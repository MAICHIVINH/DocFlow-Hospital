import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Edit2, Trash2, Shield, Activity, X, CheckCircle } from 'lucide-react';
import { useSnackbar } from 'notistack';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const UsersPage = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        role: 'STAFF',
        department_id: '',
        status: 'ACTIVE'
    });
    const { enqueueSnackbar } = useSnackbar();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users', { params: { search: searchTerm } });
            setUsers(res.data.data);
            setError(null);
        } catch (err) {
            console.error('Fetch Users Error:', err);
            setError(err.response?.data?.message || t('error_fetching_users'));
        } finally {
            setLoading(false);
        }
    };

    const fetchDepts = async () => {
        try {
            const res = await api.get('/departments');
            setDepartments(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    useEffect(() => {
        fetchDepts();
    }, []);

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                password: '', // Don't show password
                full_name: user.full_name,
                role: user.role,
                department_id: user.department_id,
                status: user.status
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                full_name: '',
                role: 'STAFF',
                department_id: '',
                status: 'ACTIVE'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, formData);
            } else {
                await api.post('/users', formData);
            }
            setIsModalOpen(false);
            fetchUsers();
            setIsModalOpen(false);
            fetchUsers();
            enqueueSnackbar(t('actions'), { variant: 'success' }); // success
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || t('error_occurred'), { variant: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('confirm_delete'))) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
                enqueueSnackbar(t('actions'), { variant: 'success' }); // deleted
            } catch (err) {
                enqueueSnackbar(err.response?.data?.message || t('error_occurred'), { variant: 'error' });
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{t('users_management')}</h2>
                    <p className="text-slate-500">{t('users_subtitle')}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-hospital-600 transition-colors" />
                        <input
                            type="text"
                            placeholder={t('search_users_placeholder')}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500/20 focus:border-hospital-500 w-64 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center space-x-2 rounded-xl bg-hospital-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-hospital-100 hover:bg-hospital-700 transition-all font-secondary"
                    >
                        <UserPlus className="h-4 w-4" />
                        <span className="italic-last-child">{t('add_user')}</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400">
                        <tr>
                            <th className="px-6 py-4">{t('full_name')}</th>
                            <th className="px-6 py-4">{t('username')}</th>
                            <th className="px-6 py-4">{t('role')}</th>
                            <th className="px-6 py-4">{t('department')}</th>
                            <th className="px-6 py-4">{t('status')}</th>
                            <th className="px-6 py-4 text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-700">{u.fullName || u.full_name}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">@{u.username}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {t(`role_${u.role.toLowerCase()}`)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{u.Department?.name || t('unassigned')}</td>
                                <td className="px-6 py-4">
                                    <span className={`flex items-center space-x-1 text-xs ${u.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}`}>
                                        <Activity className="h-3 w-3" />
                                        <span>{t(`status_${u.status.toLowerCase()}`)}</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button onClick={() => handleOpenModal(u)} className="p-2 text-slate-400 hover:text-hospital-600"><Edit2 className="h-4 w-4" /></button>
                                        <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b p-6">
                            <h3 className="text-xl font-bold text-slate-800">{editingUser ? t('update_user') : t('add_new_user')}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">{t('full_name')}</label>
                                <input type="text" className="w-full rounded-xl border p-2.5 text-sm" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">{t('username')}</label>
                                    <input type="text" className="w-full rounded-xl border p-2.5 text-sm" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required disabled={!!editingUser} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">{t('password')} {editingUser && t('leave_blank_no_change')}</label>
                                    <input type="password" className="w-full rounded-xl border p-2.5 text-sm" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!editingUser} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">{t('role')}</label>
                                    <select className="w-full rounded-xl border p-2.5 text-sm" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="STAFF">STAFF</option>
                                        <option value="MANAGER">MANAGER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">{t('department')}</label>
                                    <select className="w-full rounded-xl border p-2.5 text-sm" value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })} required>
                                        <option value="">{t('select_dept')}</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full rounded-xl bg-hospital-600 py-3 font-bold text-white shadow-lg hover:bg-hospital-700">{t('save_changes')}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
