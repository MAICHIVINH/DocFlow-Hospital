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
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg text-gray-600">{t('loading')}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                        <Shield className="h-8 w-8 text-hospital-600" />
                        <h1 className="text-3xl font-bold text-slate-800">{t('permission_management')}</h1>
                    </div>
                    <p className="text-slate-600">{t('permission_management_subtitle')}</p>
                </div>

                {/* Warning Alert */}
                {hasChanges && (
                    <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-yellow-800">{t('unsaved_changes')}</p>
                            <p className="text-sm text-yellow-700">{t('unsaved_changes_warning')}</p>
                        </div>
                    </div>
                )}

                {/* Permission Matrix */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-hospital-600 to-hospital-700 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold sticky left-0 bg-hospital-600 z-10">
                                        {t('role')}
                                    </th>
                                    {availablePermissions.map(perm => (
                                        <th key={perm} className="px-4 py-4 text-center font-medium text-sm">
                                            <div className="whitespace-nowrap">{perm}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {roles.map((role, idx) => (
                                    <tr
                                        key={role}
                                        className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-hospital-50 transition-colors`}
                                    >
                                        <td className="px-6 py-4 font-semibold text-slate-800 sticky left-0 bg-inherit z-10">
                                            <div className="flex items-center space-x-2">
                                                <span className={`inline-block w-3 h-3 rounded-full ${role === 'ADMIN' ? 'bg-red-500' :
                                                        role === 'MANAGER' ? 'bg-blue-500' :
                                                            role === 'STAFF' ? 'bg-green-500' :
                                                                role === 'USER' ? 'bg-yellow-500' :
                                                                    'bg-gray-500'
                                                    }`}></span>
                                                <span>{role}</span>
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
                                                        className="w-5 h-5 text-hospital-600 rounded focus:ring-hospital-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="mt-6 flex items-center justify-between">
                    <button
                        onClick={handleResetToDefault}
                        disabled={saving}
                        className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RotateCcw className="h-5 w-5" />
                        <span>{t('reset_to_default')}</span>
                    </button>

                    <button
                        onClick={handleSaveChanges}
                        disabled={!hasChanges || saving}
                        className="flex items-center space-x-2 px-8 py-3 bg-hospital-600 text-white rounded-lg hover:bg-hospital-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        <Save className="h-5 w-5" />
                        <span>{saving ? t('saving') : t('save_changes')}</span>
                    </button>
                </div>

                {/* Info Box */}
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">{t('permission_info_title')}</h3>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>{t('permission_info_1')}</li>
                        <li>{t('permission_info_2')}</li>
                        <li>{t('permission_info_3')}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PermissionsPage;
