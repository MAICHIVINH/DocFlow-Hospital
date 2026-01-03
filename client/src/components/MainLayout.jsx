import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';
import api from '../api/axios';
import {
    LayoutDashboard,
    FileText,
    CheckSquare,
    BarChart3,
    LogOut,
    Activity,
    Menu,
    X,
    Bell,
    User as UserIcon,
    ShieldAlert,
    Users,
    Layers,
    Tag,
    Languages,
    Sun,
    Moon
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center space-x-3 rounded-xl px-4 py-3 transition-all duration-200 ${isActive
                ? 'bg-hospital-600 text-white shadow-lg shadow-hospital-200'
                : 'text-slate-600 hover:bg-hospital-50 hover:text-hospital-600'
            }`
        }
    >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{label}</span>
    </NavLink>
);

import { io } from 'socket.io-client';

const MainLayout = ({ children }) => {
    const { t, i18n } = useTranslation();
    const { isDarkMode, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (user) {
            fetchNotifications();

            // Initialize Socket.io
            const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

            socket.on('connect', () => {
                console.log('Connected to socket server');
                socket.emit('join', user.id);
                if (user.department_id) {
                    socket.emit('join_dept', user.department_id);
                }
            });

            socket.on('new_notification', (data) => {
                setNotifications(prev => [data, ...prev]);
                enqueueSnackbar(data.title, {
                    variant: 'info',
                    autoHideDuration: 5000,
                    onClick: () => navigate(data.link || '/notifications')
                });
            });

            return () => socket.disconnect();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications', { params: { limit: 5 } });
            // Handle both old array format and new pagination object format just in case, but target new format
            setNotifications(res.data.data || res.data);
        } catch (err) {
            console.error("Fetch Notifs Error:", err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error("Mark read error:", err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;
    const location = useLocation();
    const currentPath = location.pathname;

    const getBreadcrumb = () => {
        const map = {
            '/': { parent: t('summary'), child: t('dashboard') },
            '/docs': { parent: t('summary'), child: t('documents') },
            '/approvals': { parent: t('summary'), child: t('approvals') },
            '/notifications': { parent: t('summary'), child: t('notifications') },
            '/stats': { parent: t('audit_logs'), child: t('stats') },
            '/audit': { parent: t('audit_logs'), child: t('audit_logs') },
            '/users': { parent: t('users'), child: t('users') },
            '/departments': { parent: t('users'), child: t('departments') },
            '/tags': { parent: t('users'), child: t('tag_management') },
            '/permissions': { parent: t('users'), child: t('permission_management') },
            '/profile': { parent: t('profile'), child: t('summary') }
        };
        const { parent, child } = map[currentPath] || map['/docs'];
        return (
            <>
                {parent} / <span className="text-hospital-600 font-semibold">{child}</span>
            </>
        );
    };

    return (
        <div className="flex h-screen bg-theme-primary overflow-hidden text-theme-primary">
            {/* Sidebar for Desktop */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-theme-sidebar shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-theme`}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between px-6 py-8">
                        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hospital-600 shadow-lg shadow-hospital-100 group-hover:bg-hospital-700 transition-colors">
                                <Activity className="h-7 w-7 text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tight text-theme-primary">DocFlow</span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-6 px-4 overflow-y-auto custom-scrollbar">
                        <div>
                            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{t('summary')}</p>
                            <div className="space-y-1">
                                <SidebarItem to="/" icon={LayoutDashboard} label={t('dashboard')} />
                                <SidebarItem to="/docs" icon={FileText} label={t('documents')} />
                                {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                                    <SidebarItem to="/approvals" icon={CheckSquare} label={t('approvals')} />
                                )}
                                <SidebarItem to="/notifications" icon={Bell} label={t('notifications')} />
                            </div>
                        </div>

                        <div>
                            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{t('audit_logs')}</p>
                            <div className="space-y-1">
                                <SidebarItem to="/stats" icon={BarChart3} label={t('stats')} />
                                {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                                    <SidebarItem to="/audit" icon={ShieldAlert} label={t('audit_logs')} />
                                )}
                            </div>
                        </div>

                        {user?.role === 'ADMIN' && (
                            <div>
                                <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{t('users')}</p>
                                <div className="space-y-1">
                                    <SidebarItem to="/users" icon={Users} label={t('users')} />
                                    <SidebarItem to="/departments" icon={Layers} label={t('departments')} />
                                    <SidebarItem to="/tags" icon={Tag} label={t('tag_management')} />
                                    <SidebarItem to="/permissions" icon={ShieldAlert} label={t('permission_management')} />
                                </div>
                            </div>
                        )}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-slate-50">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-red-600 transition-colors hover:bg-red-50 font-medium"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>{t('logout')}</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="flex h-16 items-center justify-between border-b border-theme bg-theme-secondary px-6">
                    <button
                        className="lg:hidden text-slate-600"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X /> : <Menu />}
                    </button>

                    <div className="hidden lg:block text-theme-secondary font-medium">
                        {getBreadcrumb()}
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Language Switcher */}
                        <div className="flex items-center bg-theme-input rounded-lg p-1">
                            <button
                                onClick={() => i18n.changeLanguage('vi')}
                                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${i18n.language === 'vi' ? 'bg-theme-secondary text-hospital-600 shadow-sm' : 'text-slate-400'}`}
                            >
                                VI
                            </button>
                            <button
                                onClick={() => i18n.changeLanguage('en')}
                                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${i18n.language === 'en' ? 'bg-theme-secondary text-hospital-600 shadow-sm' : 'text-slate-400'}`}
                            >
                                EN
                            </button>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl text-slate-400 hover:bg-theme-input hover:text-hospital-600 transition-all"
                            title={isDarkMode ? "Light Mode" : "Dark Mode"}
                        >
                            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                className="relative text-slate-400 hover:text-hospital-600 transition-colors mt-2"
                            >
                                <Bell className="h-6 w-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {notifOpen && (
                                <div className="absolute right-0 mt-4 w-80 rounded-2xl bg-theme-secondary shadow-2xl ring-1 ring-black ring-opacity-5 z-[60] border border-theme">
                                    <div className="p-4 border-b border-theme flex items-center justify-between">
                                        <h4 className="font-bold text-theme-primary">{t('notifications')}</h4>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-hospital-600 bg-hospital-50 px-2 py-0.5 rounded-full">
                                            {t('new')}
                                        </span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400 text-sm">{t('no_notifications')}</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                                                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!n.is_read ? 'bg-hospital-50/30' : ''}`}
                                                >
                                                    <p className={`text-sm ${!n.is_read ? 'font-bold text-slate-800' : 'text-slate-600'}`}>{n.title}</p>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.content}</p>
                                                    <p className="text-[10px] text-slate-400 mt-2">
                                                        {new Date(n.created_at || n.createdAt).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-3 text-center border-t border-slate-50">
                                        <button
                                            onClick={() => {
                                                navigate('/notifications');
                                                setNotifOpen(false);
                                            }}
                                            className="text-xs font-semibold text-hospital-600 hover:underline"
                                        >
                                            {t('view_all')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative group">
                            <div className="flex items-center space-x-3 border-l border-theme pl-6 cursor-pointer">
                                <div className="text-right">
                                    <p className="font-bold text-theme-primary leading-tight">{user?.full_name}</p>
                                    <p className="text-xs text-theme-secondary font-medium uppercase tracking-tighter">{user?.role}</p>
                                </div>
                                <div className="rounded-full bg-hospital-100 p-2">
                                    <UserIcon className="h-5 w-5 text-hospital-600" />
                                </div>
                            </div>

                            {/* User Dropdown */}
                            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-theme-secondary shadow-2xl ring-1 ring-black ring-opacity-5 z-[60] border border-theme opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <div className="p-2">
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm text-theme-secondary hover:bg-theme-input transition-colors"
                                    >
                                        <UserIcon className="h-4 w-4" />
                                        <span>{t('profile')}</span>
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-50 mt-1 pt-2"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>{t('logout')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-8 relative scrollbar-hide">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
