import React, { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Filter,
    Plus,
    Download,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Eye,
    Trash2,
    Archive,
    FolderArchive
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
import UploadModal from '../components/UploadModal';
import DocumentDetailModal from '../components/DocumentDetailModal';

const DocumentsPage = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [creatorFilter, setCreatorFilter] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [documents, setDocuments] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [tags, setTags] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState(null);
    const [showArchived, setShowArchived] = useState(false);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [deptRes, tagRes, userRes] = await Promise.all([
                    api.get('/departments'),
                    api.get('/tags'),
                    api.get('/users')
                ]);
                setDepartments(deptRes.data);
                setTags(tagRes.data);
                setUsers(userRes.data || []);
            } catch (err) {
                console.error("Fetch Metadata Error:", err);
            }
        };
        fetchMetadata();
    }, []);

    const fetchDocuments = async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get('/documents', {
                params: {
                    search: searchTerm,
                    department_id: deptFilter,
                    creator_id: creatorFilter,
                    tag_id: tagFilter,
                    start_date: startDate,
                    end_date: endDate,
                    is_archived: showArchived,
                    page,
                    limit: 10
                }
            });
            setDocuments(res.data.data);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error("Fetch Docs Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchDocuments(1);
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm, deptFilter, creatorFilter, tagFilter, startDate, endDate, showArchived]);

    const handleViewDocument = (docId) => {
        setSelectedDocId(docId);
        setIsDetailModalOpen(true);
    };

    const handleDownloadDocument = async (docId) => {
        try {
            const res = await api.get(`/documents/${docId}/download`);
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
            enqueueSnackbar(err.response?.data?.message || t('error_occurred'), { variant: 'error' });
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (!window.confirm(t('confirm_delete'))) return;

        try {
            await api.delete(`/documents/${docId}`);
            enqueueSnackbar(t('actions'), { variant: 'success' }); // Placeholder for success message
            fetchDocuments(pagination.page);
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || t('error_occurred'), { variant: 'error' });
        }
    };

    return (
        <div className="space-y-6 text-slate-900">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 font-primary">{t('docs_management')}</h2>
                    <p className="text-slate-500">{t('docs_subtitle')}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex p-1 bg-slate-100/50 rounded-xl border border-slate-100 w-fit">
                        <button
                            onClick={() => setShowArchived(false)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${!showArchived ? 'bg-white shadow-sm text-hospital-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <FolderArchive className="h-4 w-4" />
                            <span>{t('active_docs')}</span>
                        </button>
                        <button
                            onClick={() => setShowArchived(true)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${showArchived ? 'bg-white shadow-sm text-hospital-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Archive className="h-4 w-4" />
                            <span>{t('archived_docs')}</span>
                        </button>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="flex items-center space-x-2 rounded-xl bg-hospital-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-hospital-200 transition-all hover:bg-hospital-700 hover:-translate-y-0.5"
                        >
                            <Plus className="h-4 w-4" />
                            <span>{t('upload_doc')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-6">
                    <div className="md:col-span-2 lg:col-span-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t('search_docs_placeholder')}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-hospital-500 focus:ring-hospital-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm focus:border-hospital-500 focus:ring-hospital-500"
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                        >
                            <option value="">{t('dept_placeholder')}</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm focus:border-hospital-500 focus:ring-hospital-500"
                            value={tagFilter}
                            onChange={(e) => setTagFilter(e.target.value)}
                        >
                            <option value="">{t('tags_placeholder')}</option>
                            {tags.map((tag) => (
                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`flex items-center justify-center space-x-2 rounded-xl border py-2 px-4 text-sm font-medium transition-colors ${showAdvanced ? 'bg-hospital-50 border-hospital-200 text-hospital-600' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Filter className="h-4 w-4" />
                        <span>{showAdvanced ? t('hide_filter') : t('advanced_filter')}</span>
                    </button>
                </div>

                {/* Advanced Filters */}
                {showAdvanced && (
                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-50 md:grid-cols-3 lg:grid-cols-5 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 px-1">{t('creator')}</label>
                            <select
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm focus:border-hospital-500 focus:ring-hospital-500"
                                value={creatorFilter}
                                onChange={(e) => setCreatorFilter(e.target.value)}
                            >
                                <option value="">{t('all_users')}</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>{u.full_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 px-1">{t('from_date')}</label>
                            <input
                                type="date"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm focus:border-hospital-500 focus:ring-hospital-500"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 px-1">{t('to_date')}</label>
                            <input
                                type="date"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm focus:border-hospital-500 focus:ring-hospital-500"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="lg:col-span-2 flex items-end">
                            <button
                                onClick={() => {
                                    setCreatorFilter('');
                                    setTagFilter('');
                                    setStartDate('');
                                    setEndDate('');
                                    setDeptFilter('');
                                    setSearchTerm('');
                                    setShowArchived(false);
                                }}
                                className="text-sm text-slate-500 hover:text-hospital-600 font-medium px-2 py-2"
                            >
                                {t('reset_default')}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Documents Table */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">{t('documents')}</th>
                                <th className="px-6 py-4">{t('departments')}</th>
                                <th className="px-6 py-4">{t('status')}</th>
                                <th className="px-6 py-4">{t('created_at')}</th>
                                <th className="px-6 py-4 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 italic-last-child">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-slate-400">{t('loading')}</td>
                                </tr>
                            ) : documents.map((doc) => (
                                <tr key={doc.id} className="group hover:bg-hospital-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="rounded-lg bg-orange-50 p-2 text-orange-600 group-hover:bg-white transition-colors">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-700">{doc.title}</p>
                                                <div className="flex space-x-1 mt-1">
                                                    {(doc.tags || []).map(tag => (
                                                        <span key={tag.id} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">#{tag.name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{doc.department?.name || t('unknown')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${doc.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            doc.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {t(`status_${doc.status.toLowerCase()}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(doc.createdAt).toLocaleDateString(t('vi-VN') === 'vi-VN' ? 'vi-VN' : 'en-US')}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleViewDocument(doc.id)}
                                                className="p-2 text-slate-400 hover:text-hospital-600 hover:bg-white rounded-lg transition-all"
                                                title={t('view_details')}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDownloadDocument(doc.id)}
                                                className="p-2 text-slate-400 hover:text-hospital-600 hover:bg-white rounded-lg transition-all"
                                                title={t('download')}
                                            >
                                                <Download className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDocument(doc.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                                                title={t('delete')}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
                    <p className="text-sm text-slate-500">{t('showing')} {documents.length} / {pagination.total}</p>
                    <div className="flex space-x-2">
                        <button
                            className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 disabled:opacity-50"
                            disabled={pagination.page <= 1}
                            onClick={() => fetchDocuments(pagination.page - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 disabled:opacity-50"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => fetchDocuments(pagination.page + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={() => fetchDocuments(1)}
            />

            <DocumentDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                documentId={selectedDocId}
                onDelete={() => fetchDocuments(pagination.page)}
            />
        </div>
    );
};

export default DocumentsPage;
