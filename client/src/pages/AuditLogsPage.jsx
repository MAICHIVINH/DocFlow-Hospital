import { Activity, User, Clock, Info, ShieldAlert, Search, Filter, Calendar } from 'lucide-react';
import api from '../api/axios';
import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

const AuditLogsPage = () => {
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState('');
    const [userIdFilter, setUserIdFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });

    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (actionFilter) params.action = actionFilter;
            if (userIdFilter) params.user_id = userIdFilter;
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;

            const res = await api.get('/audit', { params });
            setLogs(res.data.data);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error("Fetch Logs Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/users');
                setUsers(res.data.data || []);
            } catch (err) {
                console.error("Fetch Users for Audit Error:", err);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [actionFilter, userIdFilter, startDate, endDate]);

    const getActionColor = (action) => {
        if (action.includes('UPLOAD')) return 'text-blue-600 bg-blue-50';
        if (action.includes('APPROVE')) return 'text-green-600 bg-green-50';
        if (action.includes('REJECT')) return 'text-red-600 bg-red-50';
        if (action.includes('LOGIN')) return 'text-slate-600 bg-slate-50';
        return 'text-orange-600 bg-orange-50';
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-200 pb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 font-primary italic-last-child">{t('audit_logs')}</h2>
                    <p className="text-slate-500">{t('audit_subtitle')}</p>
                </div>
                <div className="rounded-xl bg-orange-50 p-4 border border-orange-100 flex items-center space-x-3">
                    <ShieldAlert className="h-5 w-5 text-orange-500" />
                    <span className="text-sm font-semibold text-orange-700">{t('admin_monitoring')}</span>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <div className="flex items-center space-x-2 mb-4 text-slate-800 font-bold">
                    <Filter className="h-4 w-4 text-hospital-600" />
                    <span className="text-sm uppercase tracking-wider">{t('advanced_filter')}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t('action')}</label>
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-hospital-500 focus:ring-hospital-500 outline-none transition-all"
                        >
                            <option value="">{t('all_actions')}</option>
                            <option value="UPLOAD">UPLOAD</option>
                            <option value="APPROVE">APPROVE</option>
                            <option value="REJECT">REJECT</option>
                            <option value="VIEW">VIEW</option>
                            <option value="DOWNLOAD">DOWNLOAD</option>
                            <option value="DELETE">DELETE</option>
                            <option value="LOGIN">LOGIN</option>
                            <option value="CREATE">CREATE</option>
                            <option value="UPDATE">UPDATE</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t('performer')}</label>
                        <select
                            value={userIdFilter}
                            onChange={(e) => setUserIdFilter(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-hospital-500 focus:ring-hospital-500 outline-none transition-all"
                        >
                            <option value="">{t('all_users')}</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.full_name} (@{u.username})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t('from_date')}</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-hospital-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t('to_date')}</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-hospital-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
                {(actionFilter || userIdFilter || startDate || endDate) && (
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => {
                                setActionFilter('');
                                setUserIdFilter('');
                                setStartDate('');
                                setEndDate('');
                            }}
                            className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                        >
                            {t('clear_all_filters')}
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400">
                            <tr>
                                <th className="px-6 py-4 italic-last-child">{t('time')}</th>
                                <th className="px-6 py-4">{t('user')}</th>
                                <th className="px-6 py-4">{t('action')}</th>
                                <th className="px-6 py-4">{t('details')}</th>
                                <th className="px-6 py-4">{t('ip_address')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="py-20 text-center text-slate-400">{t('loading')}</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="5" className="py-20 text-center text-slate-400">{t('empty_audit')}</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-500 flex items-center space-x-2">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>{new Date(log.created_at || log.createdAt).toLocaleString(t('vi-VN') === 'vi-VN' ? 'vi-VN' : 'en-US')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div className="text-sm">
                                                    <p className="font-bold text-slate-700">{log.user?.fullName || t('system_user')}</p>
                                                    <p className="text-[10px] text-slate-400">@{log.user?.username || 'system'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                                            <div className="space-y-1">
                                                <p className="font-mono text-xs text-slate-500">
                                                    {log.target_table}: {log.target_id?.substring(0, 8)}...
                                                </p>
                                                {log.payload && Object.keys(log.payload).length > 0 && (
                                                    <p className="text-xs text-slate-400">
                                                        {JSON.stringify(log.payload).substring(0, 50)}...
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                                            {log.ipAddress || '0.0.0.0'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4">
                    <p className="text-sm text-slate-500">{t('page')} {pagination.page} / {pagination.totalPages}</p>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => fetchLogs(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                        >
                            {t('prev')}
                        </button>
                        <button
                            onClick={() => fetchLogs(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                        >
                            {t('next')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogsPage;
