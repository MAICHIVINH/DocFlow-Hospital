import React, { useState, useEffect } from 'react';
import { X, Upload, File, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [visibility, setVisibility] = useState('DEPARTMENT');
    const [file, setFile] = useState(null);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchDepartments();
            fetchTags();
        }
    }, [isOpen]);

    const fetchTags = async () => {
        try {
            const res = await api.get('/tags');
            setAvailableTags(res.data);
        } catch (err) {
            console.error("Fetch Tags Error:", err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error("Fetch Depts Error:", err);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !title || !departmentId) {
            setError(t('fill_required_fields'));
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('department_id', departmentId);
        formData.append('visibility', visibility);
        formData.append('file', file);
        formData.append('tags', selectedTags.join(','));

        try {
            await api.post('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            onUploadSuccess();
            onClose();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || t('error_uploading'));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDepartmentId('');
        setVisibility('DEPARTMENT');
        setFile(null);
        setSelectedTags([]);
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 text-theme-primary transition-all">
            <div className="w-full max-w-2xl rounded-2xl bg-theme-secondary shadow-2xl transition-all border border-theme">
                <div className="flex items-center justify-between border-b border-theme p-6">
                    <h3 className="text-xl font-bold text-theme-primary">{t('upload_new_doc')}</h3>
                    <button onClick={onClose} className="rounded-lg p-2 text-theme-secondary hover:bg-theme-primary transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="flex items-center space-x-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-theme-secondary">{t('document_title')}</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-theme bg-theme-primary py-2.5 px-4 text-sm focus:ring-2 focus:ring-hospital-500 text-theme-primary outline-none"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('title_placeholder')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-theme-secondary">{t('relevant_dept')}</label>
                            <select
                                className="w-full rounded-xl border border-theme bg-theme-primary py-2.5 px-4 text-sm focus:ring-2 focus:ring-hospital-500 text-theme-primary outline-none"
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                            >
                                <option value="">{t('select_dept')}</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-theme-secondary">{t('detailed_desc')}</label>
                        <textarea
                            rows="3"
                            className="w-full rounded-xl border border-theme bg-theme-primary py-2.5 px-4 text-sm focus:ring-2 focus:ring-hospital-500 text-theme-primary outline-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('desc_placeholder')}
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-theme-secondary">{t('visibility_scope')}</label>
                            <select
                                className="w-full rounded-xl border border-theme bg-theme-primary py-2.5 px-4 text-sm focus:ring-2 focus:ring-hospital-500 text-theme-primary outline-none"
                                value={visibility}
                                onChange={(e) => setVisibility(e.target.value)}
                            >
                                <option value="PUBLIC">{t('visibility_public')}</option>
                                <option value="DEPARTMENT">{t('visibility_department')}</option>
                                <option value="PRIVATE">{t('visibility_private')}</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-theme-primary">{t('tags_select')}</label>
                            <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-theme bg-theme-input min-h-[45px]">
                                {availableTags.length === 0 ? (
                                    <span className="text-xs text-theme-secondary italic">{t('no_tags_created')}</span>
                                ) : (
                                    availableTags.map(tag => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => {
                                                if (selectedTags.includes(tag.name)) {
                                                    setSelectedTags(selectedTags.filter(t => t !== tag.name));
                                                } else {
                                                    setSelectedTags([...selectedTags, tag.name]);
                                                }
                                            }}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${selectedTags.includes(tag.name)
                                                ? 'bg-hospital-500/10 border-hospital-500/30 text-hospital-600 shadow-sm'
                                                : 'bg-theme-secondary border-theme text-theme-secondary hover:border-hospital-500/30 hover:text-hospital-600'
                                                }`}
                                        >
                                            #{tag.name}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-theme-secondary">{t('attachment_files')}</label>
                        <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-theme bg-theme-primary p-8 transition-all hover:bg-theme-secondary">
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <File className="h-10 w-10 text-hospital-500" />
                                    <p className="mt-2 text-sm font-medium text-theme-primary">{file.name}</p>
                                    <button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        className="mt-2 text-xs font-semibold text-red-500 underline"
                                    >
                                        {t('remove')}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-10 w-10 text-theme-secondary opacity-30" />
                                    <p className="mt-2 text-sm text-theme-secondary">{t('drag_drop_placeholder')}</p>
                                    <input
                                        type="file"
                                        className="absolute inset-0 cursor-pointer opacity-0"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-theme py-3 text-sm font-bold text-theme-secondary hover:bg-theme-primary transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-xl bg-hospital-600 py-3 text-sm font-bold text-white shadow-lg shadow-hospital-100 hover:bg-hospital-700 disabled:opacity-50"
                        >
                            {loading ? t('processing') : t('upload_to_system')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadModal;
