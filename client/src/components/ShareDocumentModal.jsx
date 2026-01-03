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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('share_document')}</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-gray-200 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Document Info */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-800">{document?.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {t('visibility')}: <span className="font-medium">{document?.visibility}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {/* Currently Shared Users */}
                    {sharedUsers.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">{t('shared_with')}</h3>
                            <div className="space-y-2">
                                {sharedUsers.map((sharedUser) => (
                                    <div
                                        key={sharedUser.id}
                                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {sharedUser.sharedWithUser.fullName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {t('shared_by')}: {sharedUser.sharedByUser.fullName}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleUnshare(sharedUser.sharedWithUser.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
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
                        <h3 className="text-lg font-semibold mb-3">{t('share_with_users')}</h3>

                        {availableUsers.length === 0 ? (
                            <p className="text-gray-500 text-sm">{t('no_users_available')}</p>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                {availableUsers.map((user) => (
                                    <label
                                        key={user.id}
                                        className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedUserIds.includes(user.id)}
                                            onChange={() => handleUserToggle(user.id)}
                                            className="mr-3 h-4 w-4 text-blue-600"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-800">{user.fullName}</p>
                                            <p className="text-sm text-gray-600">
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
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={loading || selectedUserIds.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? t('sharing') : t('share')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareDocumentModal;
