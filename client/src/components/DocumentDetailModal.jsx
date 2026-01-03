import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, Calendar, User, Building2, Eye, Tag, Plus, CheckCircle, Archive, FolderArchive } from 'lucide-react';
import { useSnackbar } from 'notistack';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const DocumentDetailModal = ({ isOpen, onClose, documentId, onDelete }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [proxyUrl, setProxyUrl] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (isOpen && documentId) {
            fetchDocumentDetail();
        }
    }, [isOpen, documentId]);

    const fetchDocumentDetail = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/documents/${documentId}`);
            setDocument(res.data);

            // Set proxy URL for PDF preview
            if (res.data.currentVersion?.fileType?.includes('pdf')) {
                const downloadRes = await api.get(`/documents/${documentId}/download`);
                // Use the proxy URL directly as the iframe source
                // Append token for authentication
                const token = user?.accessToken || localStorage.getItem('token');
                setProxyUrl(`${downloadRes.data.proxyUrl}?token=${token}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || t('error_loading_detail'));
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const res = await api.get(`/documents/${documentId}/download`);
            const { downloadUrl, fileName, fileType } = res.data;

            // Get file extension from MIME type
            const ext = fileType.split('/')[1] || 'pdf';
            const fullFileName = fileName.includes('.') ? fileName : `${fileName}.${ext}`;

            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fullFileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || t('error_downloading'), { variant: 'error' });
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(t('confirm_delete'))) return;

        try {
            await api.delete(`/documentId}`);
            enqueueSnackbar(t('actions'), { variant: 'success' }); // success
            onDelete();
            onClose();
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || t('error_deleting'), { variant: 'error' });
        }
    };

    const handleArchive = async () => {
        if (!window.confirm(t('confirm_archive'))) return;
        try {
            await api.patch(`/documents/${documentId}/archive`);
            enqueueSnackbar(t('actions'), { variant: 'success' }); // archived
            onDelete(); // Refresh list
            onClose();
        } catch (err) {
            enqueueSnackbar(t('error_archiving'), { variant: 'error' });
        }
    };

    const handleUnarchive = async () => {
        try {
            await api.patch(`/documents/${documentId}/unarchive`);
            enqueueSnackbar(t('actions'), { variant: 'success' }); // unarchived
            onDelete(); // Refresh list
            onClose();
        } catch (err) {
            enqueueSnackbar(t('error_unarchiving'), { variant: 'error' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl transition-all max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex-none flex items-center justify-between border-b border-slate-100 p-6">
                    <h3 className="text-xl font-bold text-slate-800">{t('document_detail')}</h3>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <div className="py-20 text-center text-slate-400">{t('loading')}</div>
                    ) : error ? (
                        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                            {error}
                        </div>
                    ) : document ? (
                        <div className="space-y-6">
                            {/* Title & Status */}
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">{document.title}</h2>
                                <div className="mt-2 flex items-center space-x-2">
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${document.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                        document.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {t(`status_${document.status.toLowerCase()}`)}
                                    </span>
                                    <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                                        {t(`visibility_${document.visibility.toLowerCase()}`)}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            {document.description && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">{t('description')}</h4>
                                    <p className="text-slate-600">{document.description}</p>
                                </div>
                            )}

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start space-x-3 rounded-xl bg-slate-50 p-4">
                                    <User className="h-5 w-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500">{t('creator')}</p>
                                        <p className="font-semibold text-slate-700">{document.creator?.fullName || document.creator?.full_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 rounded-xl bg-slate-50 p-4">
                                    <Building2 className="h-5 w-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500">{t('department')}</p>
                                        <p className="font-semibold text-slate-700">{document.department?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 rounded-xl bg-slate-50 p-4">
                                    <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500">{t('created_date')}</p>
                                        <p className="font-semibold text-slate-700">
                                            {new Date(document.createdAt).toLocaleDateString(t('vi-VN') === 'vi-VN' ? 'vi-VN' : 'en-US')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 rounded-xl bg-slate-50 p-4">
                                    <Eye className="h-5 w-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-500">{t('version')}</p>
                                        <p className="font-semibold text-slate-700">
                                            {document.versions?.length || 1} {t('versions_count')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Digital Signature / Approval Stamp */}
                            {document.status === 'APPROVED' && document.approval_signature && (
                                <div className="relative overflow-hidden rounded-2xl border-2 border-green-100 bg-green-50/30 p-6 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                                    <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-green-100/50">
                                        <CheckCircle className="h-10 w-10 text-green-600" />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h4 className="text-sm font-bold text-green-800 uppercase tracking-widest mb-1">{t('digitally_signed')}</h4>
                                        <p className="text-slate-700 font-medium">{t('approver')}: <span className="font-bold">{document.approver?.fullName || t('admin')}</span></p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {t('time')}: {new Date(document.approvedAt).toLocaleString(t('vi-VN') === 'vi-VN' ? 'vi-VN' : 'en-US')}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-green-100/50">
                                            <p className="text-[9px] font-mono text-slate-400 break-all select-all">
                                                ID: {document.approval_signature}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute right-0 top-0 -mr-6 -mt-6 opacity-5 pointer-events-none">
                                        <CheckCircle className="h-32 w-32 text-green-600" />
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {document.tags && document.tags.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                                        <Tag className="h-4 w-4 mr-1" />
                                        Tags
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {document.tags.map(tag => (
                                            <span key={tag.id} className="inline-flex items-center rounded-full bg-hospital-50 px-3 py-1 text-xs font-medium text-hospital-700">
                                                #{tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PDF Preview Section */}
                            {proxyUrl && document.currentVersion?.fileType?.includes('pdf') && (
                                <div className="border-t border-slate-100 pt-6">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3">{t('preview_document')}</h4>
                                    <div className="rounded-xl border-2 border-slate-200 overflow-hidden" style={{ height: '500px' }}>
                                        <iframe
                                            src={proxyUrl}
                                            className="w-full h-full"
                                            title="Document Preview"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">
                                        {t('preview_fallback')}
                                    </p>
                                </div>
                            )}

                            {/* Version History Table (Optional Toggle) */}
                            <div className="border-t border-slate-100 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t('version_history')}</h4>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="new-version-upload"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                formData.append('change_log', t('updated_by', { name: user?.fullName || t('user') }));
                                                try {
                                                    await api.post(`/documents/${documentId}/versions`, formData);
                                                    enqueueSnackbar(t('upload_version_success'), { variant: 'success' });
                                                    fetchDocumentDetail();
                                                } catch (err) {
                                                    enqueueSnackbar(t('error_uploading_version'), { variant: 'error' });
                                                }
                                            }}
                                        />
                                        <label htmlFor="new-version-upload" className="flex items-center space-x-1 text-xs font-semibold text-hospital-600 hover:text-hospital-700 cursor-pointer">
                                            <Plus className="h-3 w-3" />
                                            <span>{t('upload_new_version')}</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-slate-100 overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                                            <tr>
                                                <th className="px-4 py-2">v.</th>
                                                <th className="px-4 py-2">{t('date')}</th>
                                                <th className="px-4 py-2">{t('note')}</th>
                                                <th className="px-4 py-2 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {(document.versions || []).map((v) => (
                                                <tr key={v.id} className={`${v.id === document.currentVersionId ? 'bg-hospital-50/50' : ''}`}>
                                                    <td className="px-4 py-2 font-bold">{v.versionNumber}</td>
                                                    <td className="px-4 py-2 text-slate-500">{new Date(v.createdAt || v.created_at).toLocaleDateString(t('vi-VN') === 'vi-VN' ? 'vi-VN' : 'en-US')}</td>
                                                    <td className="px-4 py-2 text-slate-500 italic max-w-[150px] truncate">{v.changeLog}</td>
                                                    <td className="px-4 py-2 text-right">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            {v.id !== document.currentVersionId && (
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!window.confirm(t('confirm_restore_version'))) return;
                                                                        try {
                                                                            await api.post(`/documents/${documentId}/versions/${v.id}/restore`);
                                                                            enqueueSnackbar(t('actions'), { variant: 'success' }); // success
                                                                            fetchDocumentDetail();
                                                                        } catch (err) {
                                                                            enqueueSnackbar(t('error_restoring'), { variant: 'error' });
                                                                        }
                                                                    }}
                                                                    className="text-[10px] font-bold text-hospital-600 hover:underline"
                                                                >
                                                                    {t('restore')}
                                                                </button>
                                                            )}
                                                            <a href={v.fileUrl} target="_blank" className="text-slate-400 hover:text-slate-600">
                                                                <Download className="h-3 w-3" />
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100">
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center space-x-2 rounded-xl bg-hospital-50 px-5 py-2.5 text-sm font-bold text-hospital-700 transition-all hover:bg-hospital-100"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>{t('download')}</span>
                                </button>

                                {!document.isArchived ? (
                                    <button
                                        onClick={handleArchive}
                                        className="flex items-center space-x-2 rounded-xl bg-orange-50 px-5 py-2.5 text-sm font-bold text-orange-700 transition-all hover:bg-orange-100"
                                    >
                                        <Archive className="h-4 w-4" />
                                        <span>{t('archive')}</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleUnarchive}
                                        className="flex items-center space-x-2 rounded-xl bg-green-50 px-5 py-2.5 text-sm font-bold text-green-700 transition-all hover:bg-green-100"
                                    >
                                        <FolderArchive className="h-4 w-4" />
                                        <span>{t('restore')}</span>
                                    </button>
                                )}

                                <button
                                    onClick={handleDelete}
                                    className="flex items-center space-x-2 rounded-xl bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>{t('delete')}</span>
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default DocumentDetailModal;
