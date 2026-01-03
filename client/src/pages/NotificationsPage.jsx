import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, Mail } from 'lucide-react';
import { useSnackbar } from 'notistack';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const NotificationsPage = () => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
    const { enqueueSnackbar } = useSnackbar();

    const fetchNotifications = async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get('/notifications', { params: { page, limit: 10 } });
            setNotifications(res.data.data);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error("Fetch Notifications Error:", error);
            enqueueSnackbar(t('error_loading_notifications'), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
            enqueueSnackbar(t('actions'), { variant: 'success' }); // marked_read
        } catch (error) {
            console.error("Mark read error:", error);
            enqueueSnackbar(t('error_occurred'), { variant: 'error' });
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="border-b border-slate-200 pb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 font-primary">{t('your_notifications')}</h2>
                    <p className="text-slate-500">{t('notifications_subtitle')}</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-4 border border-blue-100 flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-semibold text-blue-700">{t('total')}: {pagination.total} {t('notifications_count')}</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">{t('loading_notifications')}...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">{t('no_notifications')}</div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`p-6 hover:bg-slate-50 transition-colors flex items-start space-x-4 ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${!n.is_read ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className={`text-base ${!n.is_read ? 'font-bold text-slate-800' : 'text-slate-700'}`}>
                                            {n.title}
                                        </h4>
                                        <span className="text-xs text-slate-400 flex items-center whitespace-nowrap ml-4">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {new Date(n.created_at || n.createdAt).toLocaleString(t('vi-VN') === 'vi-VN' ? 'vi-VN' : 'en-US')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3">{n.content}</p>

                                    {!n.is_read && (
                                        <button
                                            onClick={() => handleMarkAsRead(n.id)}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                        >
                                            <Check className="h-3 w-3" />
                                            <span>{t('mark_as_read')}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
                    <p className="text-sm text-slate-500">{t('pagination_page', { current: pagination.page, total: pagination.totalPages || 1 })}</p>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => fetchNotifications(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                        >
                            {t('previous')}
                        </button>
                        <button
                            onClick={() => fetchNotifications(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                        >
                            {t('next')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
