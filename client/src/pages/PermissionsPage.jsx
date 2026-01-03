import React, { useState, useEffect } from 'react';
import { Shield, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const PermissionsPage = () => {
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const [permissions, setPermissions] = useState({});
    const [availablePermissions, setAvailablePermissions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [permsRes, availRes] = await Promise.all([
                axios.get('http://localhost:5000/api/permissions', { headers }),
                axios.get('http://localhost:5000/api/permissions/available', { headers })
            ]);

            setPermissions(permsRes.data.data);
            setAvailablePermissions(availRes.data.permissions);
            setRoles(availRes.data.roles);
            setLoading(false);
        } catch (error) {
            enqueueSnackbar(t('error_loading_permissions'), { variant: 'error' });
            setLoading(false);
        }
    };

    const handleTogglePermission = (role, permission) => {
        setPermissions(prev => {
            const rolePerms = prev[role] || [];
            const newRolePerms = rolePerms.includes(permission)
                ? rolePerms.filter(p => p !== permission)
                : [...rolePerms, permission];

            return { ...prev, [role]: newRolePerms };
        });
        setHasChanges(true);
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Update each role's permissions
            await Promise.all(
                roles.map(role =>
                    axios.put(
                        `http://localhost:5000/api/permissions/${role}`,
                        { permissions: permissions[role] || [] },
                        { headers }
                    )
                )
            );

            enqueueSnackbar(t('permissions_updated'), { variant: 'success' });
            setHasChanges(false);
            await fetchData(); // Reload to get fresh data
        } catch (error) {
            enqueueSnackbar(error.response?.data?.message || t('error_saving_permissions'), { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleResetToDefault = async () => {
        if (!window.confirm(t('confirm_reset_permissions'))) return;

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/permissions/reset',
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            enqueueSnackbar(t('permissions_reset_success'), { variant: 'success' });
            setHasChanges(false);
            await fetchData();
        } catch (error) {
            enqueueSnackbar(t('error_resetting_permissions'), { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-theme-primary">
                <div className="text-lg text-theme-secondary animate-pulse">{t('loading')}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-theme-primary p-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-2">
                        <div className="p-3 bg-hospital-600/10 rounded-2xl">
                            <Shield className="h-8 w-8 text-hospital-600" />
                        </div>
                        <h1 className="text-3xl font-black text-theme-primary tracking-tight">{t('permission_management')}</h1>
                    </div>
                    <p className="text-theme-secondary font-medium">{t('permission_management_subtitle')}</p>
                </div>

                {/* Warning Alert */}
                {hasChanges && (
                    <div className="mb-6 p-4 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-2xl flex items-start space-x-3 shadow-md shadow-yellow-500/5">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                            <p className="font-bold text-yellow-700">{t('unsaved_changes')}</p>
                            <p className="text-sm text-yellow-600/80 font-medium">{t('unsaved_changes_warning')}</p>
                        </div>
                    </div>
                )}

                {/* Permission Matrix */}
                <div className="bg-theme-secondary rounded-2xl shadow-xl overflow-hidden border border-theme">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full">
                            <thead className="bg-hospital-600 text-white">
                                <tr>
                                    <th className="px-6 py-5 text-left font-bold uppercase tracking-wider text-xs sticky left-0 bg-hospital-600 z-20">
                                        {t('role')}
                                    </th>
                                    {availablePermissions.map(perm => (
                                        <th key={perm} className="px-4 py-5 text-center font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">
                                            {perm}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-theme">
                                {roles.map((role, idx) => (
                                    <tr
                                        key={role}
                                        className={`${idx % 2 === 0 ? 'bg-theme-secondary' : 'bg-table-stripe'} hover:bg-hospital-500/5 transition-colors group text-sm`}
                                    >
                                        <td className="px-6 py-4 font-bold text-theme-primary sticky left-0 bg-inherit z-10 border-r border-theme shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                                            <div className="flex items-center space-x-3">
                                                <span className={`inline-block w-2.5 h-2.5 rounded-full ring-2 ring-offset-2 ring-offset-theme-secondary ${role === 'ADMIN' ? 'bg-red-500 ring-red-500/30' :
                                                    role === 'MANAGER' ? 'bg-blue-500 ring-blue-500/30' :
                                                        role === 'STAFF' ? 'bg-green-500 ring-green-500/30' :
                                                            role === 'USER' ? 'bg-yellow-500 ring-yellow-500/30' :
                                                                'bg-slate-500 ring-slate-500/30'
                                                    }`}></span>
                                                <span className="tracking-wide">{role}</span>
                                            </div>
                                        </td>
                                        {availablePermissions.map(perm => {
                                            const hasPermission = (permissions[role] || []).includes(perm) ||
                                                (permissions[role] || []).includes('*');
                                            const isWildcard = (permissions[role] || []).includes('*');

                                            return (
                                                <td key={perm} className="px-4 py-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={hasPermission}
                                                        disabled={isWildcard && perm !== '*'}
                                                        onChange={() => handleTogglePermission(role, perm)}
                                                        className="w-5 h-5 text-hospital-600 rounded-lg border-theme bg-theme-primary focus:ring-hospital-500 focus:ring-offset-theme-secondary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex items-center justify-between">
                    <button
                        onClick={handleResetToDefault}
                        disabled={saving}
                        className="flex items-center space-x-2 px-6 py-3.5 bg-theme-secondary text-theme-secondary rounded-xl hover:bg-theme-primary border border-theme transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-sm"
                    >
                        <RotateCcw className="h-5 w-5" />
                        <span>{t('reset_to_default')}</span>
                    </button>

                    <button
                        onClick={handleSaveChanges}
                        disabled={!hasChanges || saving}
                        className="flex items-center space-x-2 px-10 py-3.5 bg-hospital-600 text-white rounded-xl hover:bg-hospital-700 transition-all disabled:bg-theme-secondary disabled:text-theme-secondary/30 disabled:cursor-not-allowed shadow-xl shadow-hospital-600/20 font-bold"
                    >
                        <Save className="h-5 w-5" />
                        <span>{saving ? t('saving') : t('save_changes')}</span>
                    </button>
                </div>

                {/* Info Box */}
                <div className="mt-10 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl shadow-inner">
                    <h3 className="font-bold text-blue-600 mb-3 flex items-center space-x-2">
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                        <span>{t('permission_info_title')}</span>
                    </h3>
                    <ul className="text-sm text-theme-secondary/80 space-y-2 font-medium">
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{t('permission_info_1')}</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{t('permission_info_2')}</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{t('permission_info_3')}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PermissionsPage;
