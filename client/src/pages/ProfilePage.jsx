import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Building2, Key, Save, AlertCircle, Activity } from 'lucide-react';
import { useSnackbar } from 'notistack';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { t } = useTranslation();
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        currentPassword: '',
        password: '',
        confirmPassword: ''
    });
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/me');
            setProfile(res.data);
            setFormData(prev => ({ ...prev, full_name: res.data.full_name }));
        } catch (err) {
            enqueueSnackbar(t('error_loading_profile'), { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            return enqueueSnackbar(t('password_mismatch'), { variant: 'warning' });
        }

        setSaving(true);
        try {
            await api.put('/users/me', {
                full_name: formData.full_name,
                currentPassword: formData.currentPassword,
                password: formData.password || undefined
            });
            enqueueSnackbar(t('actions'), { variant: 'success' }); // success
            setFormData(prev => ({ ...prev, currentPassword: '', password: '', confirmPassword: '' }));
            fetchProfile();
        } catch (err) {
            enqueueSnackbar(err.response?.data?.message || t('error_updating_profile'), { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-theme-secondary">{t('loading')}...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-theme-primary font-primary transition-all">{t('personal_info')}</h2>
                <p className="text-theme-secondary">{t('profile_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Overview Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="rounded-2xl bg-theme-secondary p-6 shadow-sm border border-theme text-center">
                        <div className="mx-auto w-24 h-24 rounded-full bg-hospital-50/10 flex items-center justify-center mb-4 border-2 border-hospital-100/20">
                            <User className="h-12 w-12 text-hospital-600" />
                        </div>
                        <h3 className="text-lg font-bold text-theme-primary">{profile?.full_name}</h3>
                        <p className="text-sm text-theme-secondary mb-4">@{profile?.username}</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                {t(`role_${profile?.role.toLowerCase()}`)}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
                        <div className="flex items-center space-x-3 text-sm">
                            <Building2 className="h-4 w-4 text-theme-secondary" />
                            <div>
                                <p className="text-theme-secondary text-[10px] uppercase font-bold">{t('department')}</p>
                                <p className="text-theme-primary font-medium">{profile?.Department?.name || t('na')}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <Shield className="h-4 w-4 text-theme-secondary" />
                            <div>
                                <p className="text-theme-secondary text-[10px] uppercase font-bold">{t('status')}</p>
                                <p className="text-green-600 font-medium italic">{t('active')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="md:col-span-2">
                    <div className="rounded-2xl bg-theme-secondary shadow-sm border border-theme overflow-hidden">
                        <div className="border-b border-theme p-6">
                            <h3 className="font-bold text-theme-primary flex items-center space-x-2">
                                <Activity className="h-5 w-5 text-hospital-600" />
                                <span>{t('update_info')}</span>
                            </h3>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-theme-secondary mb-1">{t('full_name')}</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-secondary" />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-theme bg-theme-input text-theme-primary focus:ring-2 focus:ring-hospital-500/10 focus:border-hospital-500 transition-all outline-none"
                                            value={formData.full_name}
                                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-theme pt-6">
                                    <h4 className="text-sm font-bold text-theme-primary mb-4 flex items-center space-x-2">
                                        <Key className="h-4 w-4 text-amber-500" />
                                        <span>{t('change_password')}</span>
                                    </h4>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-theme-secondary mb-1">{t('current_password_label')}</label>
                                            <input
                                                type="password"
                                                className="w-full px-4 py-2.5 rounded-xl border border-theme bg-theme-input text-theme-primary focus:ring-2 focus:ring-hospital-500/10 focus:border-hospital-500 outline-none"
                                                value={formData.currentPassword}
                                                onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-theme-secondary mb-1">{t('new_password')}</label>
                                                <input
                                                    type="password"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-theme bg-theme-input text-theme-primary focus:ring-2 focus:ring-hospital-500/10 focus:border-hospital-500 outline-none"
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                    placeholder={t('password_empty_hint')}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-theme-secondary mb-1">{t('confirm_new_password')}</label>
                                                <input
                                                    type="password"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-theme bg-theme-input text-theme-primary focus:ring-2 focus:ring-hospital-500/10 focus:border-hospital-500 outline-none"
                                                    value={formData.confirmPassword}
                                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-hospital-600 py-3 text-sm font-bold text-white shadow-lg shadow-hospital-100 hover:bg-hospital-700 disabled:opacity-50 transition-all"
                            >
                                <Save className="h-4 w-4" />
                                <span>{saving ? t('saving') : t('save_all_changes')}</span>
                            </button>
                        </form>
                    </div>

                    <div className="mt-6 flex items-start space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div className="text-xs text-amber-700 leading-relaxed">
                            <p className="font-bold mb-1">{t('security_note_title')}:</p>
                            <p>{t('security_note_text')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
