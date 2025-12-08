import { Routes, Route, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CreateUser from './pages/CreateUser';
import UserList from './pages/UserList';
import { useAuth } from './context/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();

    // Fallback to localStorage if user state isn't updated yet but token exists
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    const effectiveUser = user || (token && role && userId ? { token, role, userId } : null);

    if (loading && !effectiveUser) return <div>Loading...</div>;
    if (!effectiveUser) return <Navigate to="/login" />;
    if (adminOnly && !['super_admin', 'customer_admin'].includes(effectiveUser.role || '')) return <Navigate to="/dashboard" />;

    return <>{children}</>;
};

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

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<div style={{ padding: '2rem' }}><h1>Welcome to Proctor</h1></div>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/jobs" element={<JobList />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/jobs/:jobId/matches" element={
                    <ProtectedRoute>
                        <MatchReview />
                    </ProtectedRoute>
                } />
                <Route path="/interview/:token" element={<InterviewBot />} />
                <Route path="/interviews/:interviewId/results" element={
                    <ProtectedRoute>
                        <InterviewResults />
                    </ProtectedRoute>
                } />
                <Route path="/resumes" element={
                    <ProtectedRoute>
                        <ResumeList />
                    </ProtectedRoute>
                } />
                <Route path="/resumes/upload" element={
                    <ProtectedRoute>
                        <ResumeUpload />
                    </ProtectedRoute>
                } />
                <Route path="/resumes/bulk-upload" element={
                    <ProtectedRoute>
                        <BulkUpload />
                    </ProtectedRoute>
                } />
                <Route path="/matching-config" element={
                    <ProtectedRoute>
                        <MatchingConfig />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                    <ProtectedRoute adminOnly>
                        <UserList />
                    </ProtectedRoute>
                } />
                <Route path="/admin/users/create" element={
                    <ProtectedRoute adminOnly>
                        <CreateUser />
                    </ProtectedRoute>
                } />
                <Route path="/recruiter-dashboard" element={
                    <ProtectedRoute>
                        <RecruiterDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/super-admin/dashboard" element={
                    <ProtectedRoute>
                        <SuperAdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/admin/organizations/create" element={
                    <ProtectedRoute adminOnly>
                        <CreateOrganization />
                    </ProtectedRoute>
                } />
                <Route path="/customer-admin/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/candidate-dashboard" element={
                    <ProtectedRoute>
                        <CandidateDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Routes>
        </>
    );
}

export default App;
