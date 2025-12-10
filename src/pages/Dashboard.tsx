import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/AdminDashboard.css';
import groupIcon from '../assets/group.png';
import userIcon from '../assets/user.png';

interface DashboardStats {
    users: {
        total: number;
        active: number;
        recruiters: {
            total: number;
            active: number;
            inactive: number;
        };
        candidates: {
            total: number;
            active: number;
            inactive: number;
        };
    };
}

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
}

const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentUsers, setRecentUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [analyticsRes, usersRes] = await Promise.all([
                axios.get('/api/admin/analytics', { headers }),
                axios.get('/api/admin/users?limit=10', { headers })
            ]);

            setStats(analyticsRes.data);
            const allUsers = usersRes.data.users || usersRes.data;
            const filteredUsers = allUsers.filter((user: User) =>
                ['recruiter', 'candidate'].includes(user.role.toLowerCase())
            );
            setRecentUsers(filteredUsers);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh data
            fetchDashboardData();
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Failed to delete user');
        }
    };

    const toggleUserStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/users/${userId}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh data
            fetchDashboardData();
        } catch (err) {
            console.error('Error updating user status:', err);
            alert('Failed to update status');
        }
    };

    const handleViewUser = async (userId: string, role: string) => {
        if (!window.confirm(`Are you sure you want to login as this ${role}? You will be logged out of your admin account.`)) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`/api/admin/impersonate/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local storage with new user credentials
            const { token: newToken, user } = res.data;
            localStorage.setItem('token', newToken);
            localStorage.setItem('role', user.role);
            localStorage.setItem('userId', user._id);
            if (user.organizationId) {
                localStorage.setItem('organizationId', user.organizationId);
            }

            // Redirect based on role
            if (role === 'recruiter') {
                window.location.href = '/recruiter-dashboard';
            } else if (role === 'candidate') {
                window.location.href = '/candidate-dashboard';
            } else {
                window.location.href = '/dashboard';
            }
        } catch (err: any) {
            console.error('Impersonation failed:', err);
            alert(err.response?.data?.message || 'Failed to login as user');
        }
    };

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="section-header">
                    <h2>Loading Dashboard...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="section-header">
                    <h2 style={{ color: 'red' }}>{error}</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Manage your organization's recruiters and candidates</p>
                </div>
                <div className="header-actions">
                    <Link to="/admin/users/create" className="btn-primary">
                        <span>➕</span> Create User
                    </Link>
                    <Link to="/admin/users" className="btn-secondary">
                        <span>📋</span> Manage All Users
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="icon">
                        <img src={groupIcon} alt="Total Users" className="stat-icon-img" />
                    </div>
                    <div className="value">{stats?.users.total || 0}</div>
                    <div className="label">Total Users</div>
                </div>
                <div className="stat-card success">
                    <div className="icon">
                        <img src={userIcon} alt="Active Recruiters" className="stat-icon-img" />
                    </div>
                    <div className="value">{stats?.users.recruiters.active || 0}</div>
                    <div className="label">Active Recruiters</div>
                </div>
                <div className="stat-card warning">
                    <div className="icon">
                        <img src={userIcon} alt="Inactive Recruiters" className="stat-icon-img" />
                    </div>
                    <div className="value">{stats?.users.recruiters.inactive || 0}</div>
                    <div className="label">Inactive Recruiters</div>
                </div>
                <div className="stat-card info">
                    <div className="icon">
                        <img src={groupIcon} alt="Total Candidates" className="stat-icon-img" />
                    </div>
                    <div className="value">{stats?.users.candidates.total || 0}</div>
                    <div className="label">Total Candidates</div>
                </div>
            </div>

            {/* People Management & Graphics */}
            <div className="charts-grid">
                {/* User Distribution Chart */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <div className="section-title">
                            <span>📊</span> User Distribution
                        </div>
                    </div>
                    <div className="chart-container">
                        <div className="bar-group">
                            <div
                                className="bar"
                                style={{
                                    height: `${(stats?.users.recruiters.total || 0) * 10}px`,
                                    background: '#6259ca'
                                }}
                            >
                                <span className="bar-value">{stats?.users.recruiters.total}</span>
                            </div>
                            <span className="bar-label">Recruiters</span>
                        </div>
                        <div className="bar-group">
                            <div
                                className="bar"
                                style={{
                                    height: `${(stats?.users.candidates.total || 0) * 10}px`,
                                    background: '#09ad95'
                                }}
                            >
                                <span className="bar-value">{stats?.users.candidates.total}</span>
                            </div>
                            <span className="bar-label">Candidates</span>
                        </div>
                    </div>
                </div>

                {/* Recent Users Table */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <div className="section-title">
                            <span>🕒</span> Recently Added Users
                        </div>
                        <Link to="/admin/users" className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                            View All
                        </Link>
                    </div>
                    <div className="table-container">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Date Joined</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.map(user => (
                                    <tr key={user._id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{user.username}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email}</div>
                                        </td>
                                        <td>
                                            <span className={`role-badge ${user.role}`}>
                                                {user.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`status-badge ${user.status}`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => toggleUserStatus(user._id, user.status)}
                                                title="Click to toggle status"
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                {new Date(user.createdAt).toLocaleDateString()}
                                                <button
                                                    onClick={() => deleteUser(user._id)}
                                                    style={{
                                                        border: 'none',
                                                        background: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '1rem'
                                                    }}
                                                    title="Delete User"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-primary"
                                                style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
                                                onClick={() => handleViewUser(user._id, user.role)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
