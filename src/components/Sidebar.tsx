import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const role = localStorage.getItem('role'); // e.g. 'super_admin', 'customer_admin', 'recruiter'

    // Visibility Flags
    const showManageUsers = ['super_admin', 'customer_admin'].includes(role || '');
    const showJobsResumes = role === 'recruiter';
    const showAddOrg = role === 'super_admin';

    const getDashboardPath = () => {
        switch (role) {
            case 'super_admin': return '/super-admin/dashboard';
            case 'recruiter': return '/recruiter-dashboard';
            case 'candidate': return '/candidate-dashboard';
            case 'customer_admin': return '/customer-admin/dashboard';
            default: return '/dashboard';
        }
    };

    const dashboardPath = getDashboardPath();

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <h2>🛡️ Admin</h2>
            </div>
            <nav className="sidebar-nav">
                <Link to="/home" className={`nav-item ${isActive('/home') ? 'active' : ''}`}>
                    <span className="icon">🏠</span> Home
                </Link>
                <Link to={dashboardPath} className={`nav-item ${isActive(dashboardPath) ? 'active' : ''}`}>
                    <span className="icon">📊</span> Dashboard
                </Link>

                {showManageUsers && (
                    <Link to="/admin/users" className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}>
                        <span className="icon">👥</span> Manage Users
                    </Link>
                )}

                {showJobsResumes && (
                    <>
                        <Link to="/jobs" className={`nav-item ${isActive('/jobs') ? 'active' : ''}`}>
                            <span className="icon">💼</span> Jobs
                        </Link>
                        <Link to="/resumes" className={`nav-item ${isActive('/resumes') ? 'active' : ''}`}>
                            <span className="icon">📄</span> Resumes
                        </Link>
                    </>
                )}

                {showAddOrg && (
                    <Link to="/admin/organizations/create" className={`nav-item ${isActive('/admin/organizations/create') ? 'active' : ''}`}>
                        <span className="icon">🏢</span> Add Org
                    </Link>
                )}
            </nav>
            <div className="sidebar-footer">
                <button className="logout-btn" onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                    window.location.href = '/login';
                }}>
                    <span className="icon">🚪</span> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
