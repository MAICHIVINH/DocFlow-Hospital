import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-theme-primary p-4 transition-colors duration-300">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-theme-secondary shadow-2xl border border-theme transition-all duration-300">
                <div className="bg-hospital-600 p-8 text-center text-white">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                            <Activity className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold">DocFlow Hospital</h1>
                    <p className="mt-2 text-hospital-100 italic">{t('app_subtitle')}</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-600 border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-theme-secondary">{t('username')}</label>
                            <div className="relative mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <User className="h-5 w-5 text-theme-secondary/50" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full rounded-xl border border-theme bg-theme-primary py-3 pl-11 pr-4 text-theme-primary placeholder-theme-secondary/30 focus:border-hospital-500 focus:ring-2 focus:ring-hospital-500/20 outline-none transition-all sm:text-sm"
                                    placeholder={t('username')}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-theme-secondary">{t('password')}</label>
                            <div className="relative mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Lock className="h-5 w-5 text-theme-secondary/50" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full rounded-xl border border-theme bg-theme-primary py-3 pl-11 pr-4 text-theme-primary placeholder-theme-secondary/30 focus:border-hospital-500 focus:ring-2 focus:ring-hospital-500/20 outline-none transition-all sm:text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-xl bg-hospital-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-hospital-700 focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:ring-offset-2 disabled:opacity-70 transition-all duration-200 shadow-lg shadow-hospital-600/20"
                        >
                            {loading ? t('authenticating') : t('login')}
                        </button>

                        <div className="text-center">
                            <span className="text-[10px] text-theme-secondary opacity-50 uppercase tracking-widest font-bold">{t('version_text')} 1.0.0 Alpha</span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
