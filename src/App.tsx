import { Routes, Route, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CreateUser from './pages/CreateUser';
import UserList from './pages/UserList';
import { useAuth } from './context/AuthContext';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import ResumeList from './pages/ResumeList';
import ResumeUpload from './pages/ResumeUpload';
import BulkUpload from './pages/BulkUpload';
import MatchReview from './pages/MatchReview';
import MatchingConfig from './pages/MatchingConfig';
import InterviewBot from './pages/InterviewBot';
import InterviewResults from './pages/InterviewResults';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CandidateDashboard from './pages/CandidateDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import CreateOrganization from './pages/CreateOrganization';
import MainLayout from './layouts/MainLayout';
import Welcome from './pages/Welcome';

interface ProtectedRouteProps {
    children: ReactNode;
    adminOnly?: boolean;
    superAdminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false, ...props }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();

    // Fallback to localStorage if user state isn't updated yet but token exists
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    const effectiveUser = user || (token && role && userId ? { token, role, userId } : null);

    if (loading && !effectiveUser) return <div>Loading...</div>;

    if (!effectiveUser) return <Navigate to="/login" />;

    if (adminOnly) {
        const userRole = effectiveUser.role?.trim() || '';
        if (!['super_admin', 'customer_admin'].includes(userRole)) {
            return <Navigate to="/dashboard" />;
        }
    }

    if (props.superAdminOnly) {
        const userRole = effectiveUser.role?.trim() || '';
        if (userRole !== 'super_admin') {
            return <Navigate to="/dashboard" />;
        }
    }

    return <>{children}</>;
};

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/home" element={<ProtectedRoute><MainLayout><Welcome /></MainLayout></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Interview Bot Public Route */}
            <Route path="/interview/:token" element={<InterviewBot />} />

            {/* Protected Dashboard Routes */}
            <Route path="/jobs" element={<ProtectedRoute><MainLayout><JobList /></MainLayout></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<ProtectedRoute><MainLayout><JobDetail /></MainLayout></ProtectedRoute>} />
            <Route path="/jobs/:jobId/matches" element={<ProtectedRoute><MainLayout><MatchReview /></MainLayout></ProtectedRoute>} />
            <Route path="/interviews/:interviewId/results" element={<ProtectedRoute><MainLayout><InterviewResults /></MainLayout></ProtectedRoute>} />
            <Route path="/resumes" element={<ProtectedRoute><MainLayout><ResumeList /></MainLayout></ProtectedRoute>} />
            <Route path="/resumes/upload" element={<ProtectedRoute><MainLayout><ResumeUpload /></MainLayout></ProtectedRoute>} />
            <Route path="/resumes/bulk-upload" element={<ProtectedRoute><MainLayout><BulkUpload /></MainLayout></ProtectedRoute>} />
            <Route path="/matching-config" element={<ProtectedRoute><MainLayout><MatchingConfig /></MainLayout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly><MainLayout><UserList /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/users/create" element={<ProtectedRoute adminOnly><MainLayout><CreateUser /></MainLayout></ProtectedRoute>} />
            <Route path="/recruiter-dashboard" element={<ProtectedRoute><MainLayout><RecruiterDashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/super-admin/dashboard" element={<ProtectedRoute><MainLayout><SuperAdminDashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/admin/organizations/create" element={<ProtectedRoute superAdminOnly><MainLayout><CreateOrganization /></MainLayout></ProtectedRoute>} />
            <Route path="/customer-admin/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
            <Route path="/candidate-dashboard" element={<ProtectedRoute><MainLayout><CandidateDashboard /></MainLayout></ProtectedRoute>} />
        </Routes>
    );
}

export default App;
