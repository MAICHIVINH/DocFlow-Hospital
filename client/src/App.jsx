import { SnackbarProvider } from 'notistack'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import ApprovalsPage from './pages/ApprovalsPage'
import StatisticsPage from './pages/StatisticsPage'
import AuditLogsPage from './pages/AuditLogsPage'
import UsersPage from './pages/UsersPage'
import DepartmentsPage from './pages/DepartmentsPage'
import NotificationsPage from './pages/NotificationsPage'
import TagManagement from './pages/TagManagement'
import PermissionsPage from './pages/PermissionsPage'
import ProfilePage from './pages/ProfilePage'
import PrivateRoute from './components/PrivateRoute'
import MainLayout from './components/MainLayout'

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />

                            {/* Protected Routes */}
                            <Route element={<PrivateRoute />}>
                                <Route path="/" element={<MainLayout children={<DashboardPage />} />} />
                                <Route path="/docs" element={<MainLayout children={<DocumentsPage />} />} />
                                <Route path="/approvals" element={<MainLayout children={<ApprovalsPage />} />} />
                                <Route path="/stats" element={<MainLayout children={<StatisticsPage />} />} />
                                <Route path="/audit" element={<MainLayout children={<AuditLogsPage />} />} />
                                <Route path="/users" element={<MainLayout children={<UsersPage />} />} />
                                <Route path="/departments" element={<MainLayout children={<DepartmentsPage />} />} />
                                <Route path="/notifications" element={<MainLayout children={<NotificationsPage />} />} />
                                <Route path="/tags" element={<MainLayout children={<TagManagement />} />} />
                                <Route path="/permissions" element={<MainLayout children={<PermissionsPage />} />} />
                                <Route path="/profile" element={<MainLayout children={<ProfilePage />} />} />
                            </Route>

                            {/* Catch all */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Router>
                </SnackbarProvider>
            </ThemeProvider>
        </AuthProvider>
    )
}

export default App
