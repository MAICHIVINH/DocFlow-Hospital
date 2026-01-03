import React, { useState, useEffect } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import {
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    TrendingUp,
    Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
    const { t } = useTranslation();
    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-900">{value}</h3>
                    {trend && (
                        <p className="mt-1 flex items-center text-xs text-green-600">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            {trend} {t('vs_last_month') || 'so với tháng trước'}
                        </p>
                    )}
                </div>
                <div className={`rounded-xl ${color} p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>
    );
};

const DashboardPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [summary, setSummary] = useState({
        totalDocuments: 0,
        pendingApprovals: 0,
        approvedDocuments: 0,
        totalInteractions: 0
    });
    const [stats, setStats] = useState([]);
    const [recentDocs, setRecentDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [summaryRes, statsRes, docsRes] = await Promise.all([
                    api.get('/stats/usage'),
                    api.get('/stats/by-department'),
                    api.get('/documents?limit=5')
                ]);

                setSummary(summaryRes.data);
                setStats(statsRes.data);
                setRecentDocs(docsRes.data.data);
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">{t('greeting')}</h2>
                <p className="text-slate-500">{t('dashboard_subtext')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title={t('total_docs')} value={summary.totalDocuments} icon={FileText} color="bg-hospital-500" trend="+12%" />
                <StatCard title={t('pending_approval')} value={summary.pendingApprovals} icon={Clock} color="bg-yellow-500" trend="-2%" />
                <StatCard title={t('approved')} value={summary.approvedDocuments} icon={CheckCircle2} color="bg-green-500" trend="+8%" />
                <StatCard title={t('interactions')} value={summary.totalInteractions} icon={ArrowUpRight} color="bg-indigo-500" trend="+24%" />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Chart */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 lg:col-span-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 font-primary">{t('docs_by_dept')}</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {(stats || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Documents Table */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800 font-primary">{t('recent_docs')}</h3>
                        <button onClick={() => navigate('/docs')} className="text-sm font-medium text-hospital-600 hover:text-hospital-700">{t('view_all')}</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <th className="pb-4">{t('document_title')}</th>
                                    <th className="pb-4">{t('department')}</th>
                                    <th className="pb-4">{t('status')}</th>
                                    <th className="pb-4">{t('time')}</th>
                                    <th className="pb-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentDocs.map((doc) => (
                                    <tr key={doc.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4">
                                            <div className="flex items-center">
                                                <div className="mr-3 rounded-lg bg-slate-100 p-2 text-slate-500 group-hover:bg-white group-hover:shadow-sm">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <span className="font-medium text-slate-700">{doc.title}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm text-slate-500">{doc.department?.name || t('unassigned')}</td>
                                        <td className="py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${doc.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {t(`status_${doc.status.toLowerCase()}`)}
                                            </span>
                                        </td>
                                        <td className="py-4 text-sm text-slate-400">{new Date(doc.created_at).toLocaleDateString(t('vi-VN') === 'vi-VN' ? 'vi-VN' : 'en-US')}</td>
                                        <td className="py-4 text-right">
                                            <button className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-hospital-600 hover:shadow-sm">
                                                <Download className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
