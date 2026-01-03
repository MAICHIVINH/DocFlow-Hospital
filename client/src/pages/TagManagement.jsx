import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Plus, Trash2, Search, Pencil, Check, X } from 'lucide-react';
import { useSnackbar } from 'notistack';
import api from '../api/axios';

const TagManagement = () => {
    const { t } = useTranslation();
    const [tags, setTags] = useState([]);
    const [newTagName, setNewTagName] = useState('');
    const [editingTag, setEditingTag] = useState(null); // { id, name }
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tags');
            setTags(res.data);
        } catch (err) {
            enqueueSnackbar(t('error_occurred'), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTag = async (e) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        try {
            await api.post('/tags', { name: newTagName.trim() });
            setNewTagName('');
            enqueueSnackbar(t('add_new_tag'), { variant: 'success' });
            fetchTags();
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || t('error_occurred'), { variant: 'error' });
        }
    };

    const handleUpdateTag = async (e) => {
        e.preventDefault();
        if (!editingTag.name.trim()) return;

        try {
            await api.put(`/tags/${editingTag.id}`, { name: editingTag.name.trim() });
            setEditingTag(null);
            enqueueSnackbar(t('save'), { variant: 'success' });
            fetchTags();
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || t('error_occurred'), { variant: 'error' });
        }
    };

    const handleDeleteTag = async (id) => {
        if (!window.confirm(t('confirm_delete'))) return;

        try {
            await api.delete(`/tags/${id}`);
            enqueueSnackbar(t('delete'), { variant: 'success' });
            fetchTags();
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || t('error_occurred'), { variant: 'error' });
        }
    };

    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-theme-primary font-primary">{t('tags_management')}</h2>
                <p className="text-theme-secondary">{t('tags_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Form Thêm Mới */}
                <div className="rounded-2xl bg-theme-secondary p-6 shadow-sm border border-theme h-fit">
                    <h3 className="text-lg font-bold text-theme-primary mb-4 font-primary">{t('add_new_tag')}</h3>
                    <form onSubmit={handleCreateTag} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-1 font-primary">{t('tag_name')}</label>
                            <input
                                type="text"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                placeholder={t('tag_name_placeholder')}
                                className="w-full rounded-xl border border-theme py-2.5 px-4 text-sm focus:border-hospital-500 focus:ring-hospital-500 bg-theme-input text-theme-primary transition-all font-primary"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-hospital-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-hospital-700 shadow-lg shadow-hospital-100"
                        >
                            <Plus className="h-4 w-4" />
                            <span>{t('add_tag_btn')}</span>
                        </button>
                    </form>
                </div>

                {/* Danh sách Tags */}
                <div className="lg:col-span-2 rounded-2xl bg-theme-secondary p-6 shadow-sm border border-theme">
                    <div className="flex flex-col space-y-4 mb-6 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <h3 className="text-lg font-bold text-theme-primary font-primary">{t('tags_list')} ({tags.length})</h3>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t('search_tags_placeholder')}
                                className="w-full rounded-xl border border-theme bg-theme-input py-2 pl-10 pr-4 text-sm focus:border-hospital-500 focus:ring-hospital-500 text-theme-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center text-slate-400">{t('loading')}</div>
                    ) : filteredTags.length === 0 ? (
                        <div className="py-20 text-center text-theme-secondary bg-theme-input rounded-xl border border-dashed border-theme">
                            {t('no_tags_found')}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredTags.map(tag => (
                                <div key={tag.id} className="group relative flex items-center justify-between rounded-xl border border-theme bg-theme-input p-3 hover:bg-theme-secondary hover:border-hospital-200 hover:shadow-md transition-all min-h-[56px]">
                                    {editingTag && editingTag.id === tag.id ? (
                                        <form onSubmit={handleUpdateTag} className="flex items-center space-x-2 w-full">
                                            <input
                                                autoFocus
                                                type="text"
                                                className="flex-1 rounded-lg border border-hospital-200 bg-white px-2 py-1 text-sm focus:ring-2 focus:ring-hospital-500"
                                                value={editingTag.name}
                                                onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                                            />
                                            <div className="flex items-center space-x-1">
                                                <button type="submit" className="text-green-600 hover:bg-green-50 p-1 rounded-lg">
                                                    <Check className="h-4 w-4" />
                                                </button>
                                                <button type="button" onClick={() => setEditingTag(null)} className="text-slate-400 hover:bg-slate-50 p-1 rounded-lg">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="flex items-center space-x-2">
                                                <Tag className="h-4 w-4 text-hospital-500" />
                                                <span className="text-sm font-medium text-theme-primary">#{tag.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => setEditingTag({ id: tag.id, name: tag.name })}
                                                    className="rounded-lg p-1.5 text-slate-400 hover:text-hospital-600 hover:bg-hospital-50"
                                                    title={t('edit')}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTag(tag.id)}
                                                    className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                    title={t('delete')}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TagManagement;
