import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Download, Calendar } from 'lucide-react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const StatisticsPage = () => {
    const { t } = useTranslation();
    const [deptStats, setDeptStats] = useState([]);
    const [tagStats, setTagStats] = useState([]);
    const [userStats, setUserStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usageStats, setUsageStats] = useState({
        totalDocuments: 0,
        pendingApprovals: 0,
        approvedDocuments: 0,
        totalInteractions: 0
    });
    const [dataByMonth, setDataByMonth] = useState([]);

    const [timeRange, setTimeRange] = useState('this_month'); // this_month, last_7_days, all_time

    const getDateRange = (range) => {
        const now = new Date();
        let startDate, endDate;

        if (range === 'this_month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (range === 'last_7_days') {
            startDate = new Date();
            startDate.setDate(now.getDate() - 7);
            endDate = now;
        } else {
            return { startDate: null, endDate: null };
        }

        return {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        };
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = getDateRange(timeRange);
            const params = startDate && endDate ? { startDate, endDate } : {};

            const [deptRes, usageRes, monthlyRes, tagRes, userRes] = await Promise.all([
                api.get('/stats/by-department', { params }),
                api.get('/stats/usage', { params }),
                api.get('/stats/monthly'),
                api.get('/stats/tags', { params }),
                api.get('/stats/user-contributions', { params })
            ]);
            setDeptStats(deptRes.data);
            setUsageStats(usageRes.data);
            setDataByMonth(monthlyRes.data);
            setTagStats(tagRes.data);
            setUserStats(userRes.data);
        } catch (error) {
            console.error("Fetch Stats Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [timeRange]);

    const handleExport = async () => {
        try {
            const response = await api.get('/stats/export/excel', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const fileName = `${t('stat_report_filename')}${new Date().toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US').replace(/\//g, '-')}.xlsx`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Export Error:", error);
            alert(t('error_occurred'));
        }
    };

    const handleExportPDF = async () => {
        try {
            const response = await api.get('/stats/export/pdf', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const fileName = `${t('stat_report_filename')}${new Date().toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US').replace(/\//g, '-')}.pdf`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Export PDF Error:", error);
            alert(t('error_occurred'));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-slate-400">
                {t('loading')}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-theme-primary font-primary">{t('stats_title')}</h2>
                    <p className="text-theme-secondary">{t('stats_subtitle')}</p>
                </div>
                <div className="flex space-x-3">
                    <div className="flex items-center bg-theme-input rounded-xl p-1 border border-theme">
                        {[
                            { id: 'this_month', label: t('this_month') },
                            { id: 'last_7_days', label: t('last_7_days') },
                            { id: 'all_time', label: t('all_time') }
                        ].map((range) => (
                            <button
                                key={range.id}
                                onClick={() => setTimeRange(range.id)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === range.id
                                    ? 'bg-theme-secondary text-hospital-600 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center space-x-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-900"
                    >
                        <Download className="h-4 w-4" />
                        <span>{t('export_pdf')}</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center space-x-2 rounded-xl bg-hospital-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-hospital-700"
                    >
                        <Download className="h-4 w-4" />
                        <span>{t('export_excel')}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Document Growth Line Chart */}
                <div className="rounded-2xl bg-theme-secondary p-6 shadow-sm border border-theme">
                    <h3 className="text-lg font-bold text-theme-primary mb-6 font-primary">{t('upload_view_trend')}</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataByMonth}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="views" name={t('interactions')} stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                <Area type="monotone" dataKey="uploads" name={t('documents')} stroke="#10b981" strokeWidth={3} fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Dept Bar Chart */}
                <div className="rounded-2xl bg-theme-secondary p-6 shadow-sm border border-theme">
                    <h3 className="text-lg font-bold text-theme-primary mb-6 font-primary">{t('docs_by_dept')}</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptStats} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={100} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" name={t('documents')} fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tag Distribution */}
                <div className="rounded-2xl bg-theme-secondary p-6 shadow-sm border border-theme">
                    <h3 className="text-lg font-bold text-theme-primary mb-6 font-primary">{t('popular_tags')}</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tagStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" name={t('total_docs')} fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Contributors */}
                <div className="rounded-2xl bg-theme-secondary p-6 shadow-sm border border-theme">
                    <h3 className="text-lg font-bold text-theme-primary mb-6 font-primary">{t('top_contributors')}</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userStats} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={120} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" name={t('documents')} fill="#ec4899" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Stats Summary List */}
            <div className="rounded-2xl bg-theme-secondary p-6 shadow-sm border border-theme">
                <h3 className="text-lg font-bold text-theme-primary mb-6">{t('interaction_stats')}</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="p-4 rounded-xl bg-theme-input">
                        <p className="text-sm font-medium text-theme-secondary uppercase tracking-wider font-primary">{t('total_docs')}</p>
                        <p className="mt-2 text-2xl font-bold text-theme-primary">{usageStats.totalDocuments}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-theme-input">
                        <p className="text-sm font-medium text-theme-secondary uppercase tracking-wider font-primary">{t('approved_pending')}</p>
                        <div className="mt-2 flex items-baseline space-x-2">
                            <p className="text-2xl font-bold text-green-600">{usageStats.approvedDocuments}</p>
                            <span className="text-slate-400">/</span>
                            <p className="text-2xl font-bold text-yellow-600">{usageStats.pendingApprovals}</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-theme-input">
                        <p className="text-sm font-medium text-theme-secondary uppercase tracking-wider font-primary">{t('total_interactions')}</p>
                        <p className="mt-2 text-2xl font-bold text-hospital-600">{usageStats.totalInteractions}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;
