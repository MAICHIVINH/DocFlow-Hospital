import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, LayoutGrid, X } from 'lucide-react';
import { useSnackbar } from 'notistack';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const DepartmentsPage = () => {
    const { t } = useTranslation();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const { enqueueSnackbar } = useSnackbar();

    const fetchDepts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/departments');
            setDepartments(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDepts(); }, []);

    const handleOpenModal = (dept = null) => {
        if (dept) {
            setEditingDept(dept);
            setFormData({ name: dept.name, description: dept.description });
        } else {
            setEditingDept(null);
            setFormData({ name: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDept) {
                await api.put(`/departments/${editingDept.id}`, formData);
            } else {
                await api.post('/departments', formData);
            }
            setIsModalOpen(false);
            fetchDepts();
            enqueueSnackbar(editingDept ? t('dept_update_success') : t('dept_add_success'), { variant: 'success' });
        } catch (err) { enqueueSnackbar(t('error_occurred'), { variant: 'error' }); }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('confirm_delete_dept'))) {
            try {
                await api.delete(`/departments/${id}`);
                fetchDepts();
                enqueueSnackbar(t('dept_delete_success'), { variant: 'success' });
            } catch (err) { enqueueSnackbar(t('error_occurred') + ': ' + (err.response?.data?.message || ''), { variant: 'error' }); }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 font-primary">{t('dept_management')}</h2>
                    <p className="text-slate-500">{t('dept_subtitle')}</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center space-x-2 rounded-xl bg-hospital-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-hospital-700 shadow-lg shadow-hospital-100"
                >
                    <Plus className="h-4 w-4" />
                    <span>{t('add_dept')}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {departments.map(d => (
                    <div key={d.id} className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="rounded-xl bg-hospital-50 p-3 text-hospital-600">
                                <LayoutGrid className="h-6 w-6" />
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(d)} className="p-2 text-slate-400 hover:text-hospital-600 hover:bg-slate-50 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete(d.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-slate-800">{d.name}</h3>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-2">{d.description || t('no_description')}</p>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b p-6">
                            <h3 className="text-xl font-bold text-slate-800">{editingDept ? t('update_dept') : t('add_new_dept')}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">{t('dept_name')}</label>
                                <input type="text" className="w-full rounded-xl border p-2.5 text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder={t('dept_name_placeholder')} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">{t('description')}</label>
                                <textarea rows="3" className="w-full rounded-xl border p-2.5 text-sm" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder={t('dept_desc_placeholder')} />
                            </div>
                            <button type="submit" className="w-full rounded-xl bg-hospital-600 py-3 font-bold text-white shadow-lg shadow-hospital-100 hover:bg-hospital-700 transition-all">{t('save_info')}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentsPage;
