import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const ShareDocumentModal = ({ document, isOpen, onClose, onShareSuccess }) => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [sharedUsers, setSharedUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && document) {
            fetchUsers();
            fetchSharedUsers();
        }
    }, [isOpen, document]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const fetchSharedUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/documents/${document.id}/shared-users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSharedUsers(response.data.data || []);
        } catch (err) {
            console.error('Error fetching shared users:', err);
        }
    };

    const handleShare = async () => {
        if (selectedUserIds.length === 0) {
            setError('Please select at least one user to share with');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5000/api/documents/${document.id}/share`,
                { userIds: selectedUserIds },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSelectedUserIds([]);
            fetchSharedUsers();
            if (onShareSuccess) onShareSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to share document');
        } finally {
            setLoading(false);
        }
    };

    const handleUnshare = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:5000/api/documents/${document.id}/share/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchSharedUsers();
            if (onShareSuccess) onShareSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to unshare document');
        }
    };

    const handleUserToggle = (userId) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    if (!isOpen) return null;

    // Filter out users who are already shared with
    const sharedUserIds = sharedUsers.map(su => su.sharedWithUser.id);
    const availableUsers = users.filter(user => !sharedUserIds.includes(user.id));

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-theme-secondary rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-theme">
                {/* Header */}
                <div className="bg-gradient-to-r from-hospital-600 to-hospital-700 text-white px-6 py-5 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('share_document')}</h2>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white text-2xl font-bold transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)] custom-scrollbar">
                    {/* Document Info */}
                    <div className="mb-6 p-4 bg-theme-primary rounded-xl border border-theme">
                        <h3 className="font-semibold text-theme-primary">{document?.title}</h3>
                        <p className="text-sm text-theme-secondary mt-1">
                            {t('visibility')}: <span className="font-medium text-hospital-600">{document?.visibility}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Currently Shared Users */}
                    {sharedUsers.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-theme-primary">{t('shared_with')}</h3>
                            <div className="space-y-2">
                                {sharedUsers.map((sharedUser) => (
                                    <div
                                        key={sharedUser.id}
                                        className="flex items-center justify-between p-3 bg-blue-500/5 rounded-xl border border-blue-500/20"
                                    >
                                        <div>
                                            <p className="font-medium text-theme-primary">
                                                {sharedUser.sharedWithUser.fullName}
                                            </p>
                                            <p className="text-xs text-theme-secondary">
                                                {t('shared_by')}: {sharedUser.sharedByUser.fullName}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleUnshare(sharedUser.sharedWithUser.id)}
                                            className="px-3 py-1 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 text-xs font-bold transition-all"
                                        >
                                            {t('remove')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Share with New Users */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-theme-primary">{t('share_with_users')}</h3>

                        {availableUsers.length === 0 ? (
                            <p className="text-theme-secondary text-sm italic">{t('no_users_available')}</p>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto border border-theme rounded-xl p-3 bg-theme-primary/30 custom-scrollbar">
                                {availableUsers.map((user) => (
                                    <label
                                        key={user.id}
                                        className="flex items-center p-2 hover:bg-theme-primary rounded-lg transition-colors cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedUserIds.includes(user.id)}
                                            onChange={() => handleUserToggle(user.id)}
                                            className="mr-3 h-4 w-4 rounded border-theme text-hospital-600 focus:ring-hospital-500 bg-theme-secondary"
                                        />
                                        <div>
                                            <p className="font-medium text-theme-primary text-sm">{user.fullName}</p>
                                            <p className="text-[10px] text-theme-secondary uppercase tracking-wider">
                                                {user.department?.name || 'N/A'} - {user.role?.name || 'N/A'}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-theme-primary/50 px-6 py-4 flex justify-end space-x-3 border-t border-theme">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-theme-primary text-theme-secondary rounded-xl hover:bg-theme-secondary border border-theme transition-all font-bold text-sm"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={loading || selectedUserIds.length === 0}
                        className="px-6 py-2.5 bg-hospital-600 text-white rounded-xl hover:bg-hospital-700 disabled:bg-theme-primary disabled:text-theme-secondary/30 disabled:cursor-not-allowed shadow-lg shadow-hospital-600/20 transition-all font-bold text-sm"
                    >
                        {loading ? t('sharing') : t('share')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareDocumentModal;
