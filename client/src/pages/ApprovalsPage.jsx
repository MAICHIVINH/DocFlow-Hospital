import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    FileText,
    User,
    Calendar,
    AlertCircle,
    Eye,
    MessageSquare,
    Activity
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
import DocumentDetailModal from '../components/DocumentDetailModal';

const ApprovalsPage = () => {
    const { t } = useTranslation();
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [notes, setNotes] = useState({});
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    const fetchApprovals = async () => {
        setLoading(true);
        try {
            const res = await api.get('/documents', { params: { status: 'PENDING' } });
            setApprovals(res.data.data);

            // Initialize notes
            const initialNotes = {};
            res.data.data.forEach(doc => {
                initialNotes[doc.id] = '';
            });
            setNotes(initialNotes);
        } catch (error) {
            console.error("Fetch Approvals Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    const handleNoteChange = (id, value) => {
        setNotes(prev => ({ ...prev, [id]: value }));
    };

    const handleApprove = async (id) => {
        setProcessingId(id);
        try {
            await api.patch(`/documents/${id}/approve`);
            setApprovals(prev => prev.filter(doc => doc.id !== id));
            enqueueSnackbar(t('approve_success'), { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(t('error_occurred') + ': ' + (error.response?.data?.message || error.message), { variant: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id) => {
        const reason = notes[id];
        if (!reason || !reason.trim()) {
            return enqueueSnackbar(t('reject_reason_required'), { variant: 'warning' });
        }

        setProcessingId(id);
        try {
            await api.patch(`/documents/${id}/reject`, { reason });
            setApprovals(prev => prev.filter(doc => doc.id !== id));
            enqueueSnackbar(t('reject_success'), { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(t('error_occurred') + ': ' + (error.response?.data?.message || error.message), { variant: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleViewDocument = (docId) => {
        setSelectedDocId(docId);
        setIsDetailModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-slate-400">{t('loading_approvals')}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-200 pb-5">
                <h2 className="text-2xl font-bold text-slate-800 font-primary">{t('approvals_queue')}</h2>
                <p className="text-slate-500">{t('approvals_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {approvals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white border border-dashed border-slate-300">
                        <CheckCircle className="h-12 w-12 text-slate-200 mb-4" />
                        <p className="text-slate-500 font-medium">{t('empty_approvals')}</p>
                    </div>
                ) : (
                    approvals.map((doc) => (
                        <div key={doc.id} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                <div className="flex items-start space-x-4">
                                    <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">{doc.title}</h3>
                                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                                            <span className="flex items-center"><User className="mr-1.5 h-4 w-4" /> {doc.creator?.full_name || t('na')}</span>
                                            <span className="flex items-center"><Calendar className="mr-1.5 h-4 w-4" /> {new Date(doc.created_at).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}</span>
                                            <span className="flex items-center"><Activity className="mr-1.5 h-4 w-4" /> {doc.department?.name || t('unknown')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => handleViewDocument(doc.id)}
                                        className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span>{t('preview')}</span>
                                    </button>
                                    <div className="h-8 w-px bg-slate-100 mx-2 hidden lg:block"></div>
                                    <button
                                        onClick={() => handleReject(doc.id)}
                                        disabled={processingId === doc.id}
                                        className="flex items-center space-x-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        <span>{t('reject')}</span>
                                    </button>
                                    <button
                                        onClick={() => handleApprove(doc.id)}
                                        disabled={processingId === doc.id}
                                        className="flex items-center space-x-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-green-700 shadow-lg shadow-green-100 disabled:opacity-50"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        <span>{t('approve')}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 flex items-start space-x-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
                                <MessageSquare className="h-5 w-5 text-slate-400 mt-0.5" />
                                <input
                                    type="text"
                                    value={notes[doc.id] || ''}
                                    onChange={(e) => handleNoteChange(doc.id, e.target.value)}
                                    placeholder={t('add_note_placeholder')}
                                    className="flex-1 bg-transparent border-none p-0 text-sm focus:ring-0 placeholder-slate-400 text-slate-600"
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-8 rounded-2xl bg-blue-50 p-5 border border-blue-100 flex items-start space-x-4">
                <AlertCircle className="h-6 w-6 text-blue-500 flex-shrink-0" />
                <div>
                    <p className="font-bold text-blue-800">{t('important_info')}</p>
                    <p className="text-blue-700 text-sm mt-1">{t('approval_disclaimer')}</p>
                </div>
            </div>

            <DocumentDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                documentId={selectedDocId}
                onDelete={() => fetchApprovals()}
            />
        </div>
    );
};

export default ApprovalsPage;
