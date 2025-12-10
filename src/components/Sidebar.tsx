import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const role = localStorage.getItem('role');

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
                <Link to="/admin/users" className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}>
                    <span className="icon">👥</span> Manage Users
                </Link>
                {role === 'super_admin' && (
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
