import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/SuperAdminDashboard.css';
import groupIcon from '../assets/group.png';
import userIcon from '../assets/user.png';
import listIcon from '../assets/list.png';
import activeOrgIcon from '../assets/menu-button.png';
import inactiveOrgIcon from '../assets/menu.png';

const API_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_URL || 'http://localhost:5002/api';

interface Organization {
    _id: string;
    name: string;
    domain?: string;
    status: string;
    subscription: {
        plan: string;
        status: string;
        maxRecruiters: number;
        currentRecruiters: number;
        maxJobPostings: number;
        currentJobPostings: number;
    };
    createdAt: string;
}

interface OrgWithStats extends Organization {
    userCount?: number;
    recruiterCount?: number;
}

interface UserByRole {
    _id: string;
    count: number;
}

interface OrgByPlan {
    _id: string;
    count: number;
}

interface Analytics {
    organizations: {
        total: number;
        active: number;
    };
    users: {
        total: number;
        active: number;
        byRole: UserByRole[];
    };
    subscriptions: {
        byPlan: OrgByPlan[];
    };
}

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    status: string;
    organizationId?: {
        _id: string;
        name: string;
        domain?: string;
    };
}

interface OrgUserMapping {
    orgId: string;
    orgName: string;
    domain?: string;
    admins: number;
    recruiters: number;
    candidates: number;
    total: number;
}

const SuperAdminDashboard = () => {
    const [organizations, setOrganizations] = useState<OrgWithStats[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch all data in parallel
            const [orgsRes, analyticsRes, usersRes] = await Promise.all([
                fetch(`${API_URL}/super-admin/organizations`, { headers }),
                fetch(`${API_URL}/super-admin/analytics`, { headers }),
                fetch(`${API_URL}/super-admin/users`, { headers })
            ]);

            if (!orgsRes.ok || !analyticsRes.ok || !usersRes.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const orgsData = await orgsRes.json();
            const analyticsData = await analyticsRes.json();
            const usersData = await usersRes.json();

            setOrganizations(orgsData.organizations || []);
            setAnalytics(analyticsData);
            setUsers(usersData.users || []);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate user mappings per organization
    const getOrgUserMappings = (): OrgUserMapping[] => {
        const mappings: Map<string, OrgUserMapping> = new Map();

        // Initialize with organizations
        organizations.forEach(org => {
            mappings.set(org._id, {
                orgId: org._id,
                orgName: org.name,
                domain: org.domain,
                admins: 0,
                recruiters: 0,
                candidates: 0,
                total: 0
            });
        });

        // Count users per org
        users.forEach(user => {
            if (user.organizationId?._id) {
                const mapping = mappings.get(user.organizationId._id);
                if (mapping) {
                    mapping.total++;
                    if (user.role === 'customer_admin') mapping.admins++;
                    else if (user.role === 'recruiter') mapping.recruiters++;
                    else if (user.role === 'candidate') mapping.candidates++;
                }
            }
        });

        return Array.from(mappings.values());
    };

    // const getPlanColor = (plan: string): string => {
    //     const colors: Record<string, string> = {
    //         enterprise: '#667eea',
    //         professional: '#48bb78',
    //         freemium: '#a0aec0',
    //         custom: '#ed8936'
    //     };
    //     return colors[plan] || '#667eea';
    // };

    const toggleOrgStatus = async (orgId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/super-admin/organizations/${orgId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update organization status');
            }

            // Update local state for organizations
            setOrganizations(orgs => orgs.map(org =>
                org._id === orgId ? { ...org, status: newStatus } : org
            ));

            // Update analytics count
            setAnalytics(prev => {
                if (!prev) return prev;
                const activeChange = newStatus === 'active' ? 1 : -1;
                return {
                    ...prev,
                    organizations: {
                        ...prev.organizations,
                        active: prev.organizations.active + activeChange
                    }
                };
            });
        } catch (err) {
            console.error('Error toggling org status:', err);
            alert('Failed to update organization status');
        }
    };

    const deleteOrganization = async (orgId: string, orgName: string) => {
        if (!confirm(`Are you sure you want to delete "${orgName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/super-admin/organizations/${orgId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete organization');
            }

            // Remove from local state
            const deletedOrg = organizations.find(org => org._id === orgId);
            setOrganizations(orgs => orgs.filter(org => org._id !== orgId));

            // Update analytics
            setAnalytics(prev => {
                if (!prev) return prev;
                const wasActive = deletedOrg?.status === 'active';
                return {
                    ...prev,
                    organizations: {
                        total: prev.organizations.total - 1,
                        active: wasActive ? prev.organizations.active - 1 : prev.organizations.active
                    }
                };
            });
        } catch (err) {
            console.error('Error deleting org:', err);
            alert('Failed to delete organization');
        }
    };

    const changeOrgPlan = async (orgId: string, newPlan: string) => {
        const oldPlan = organizations.find(org => org._id === orgId)?.subscription.plan;
        if (oldPlan === newPlan) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/super-admin/organizations/${orgId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    subscription: { plan: newPlan }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update plan');
            }

            // Update local state
            setOrganizations(orgs => orgs.map(org =>
                org._id === orgId
                    ? { ...org, subscription: { ...org.subscription, plan: newPlan } }
                    : org
            ));

            // Update analytics byPlan counts
            setAnalytics(prev => {
                if (!prev) return prev;
                const updatedByPlan = prev.subscriptions.byPlan.map(p => {
                    if (p._id === oldPlan) {
                        return { ...p, count: Math.max(0, p.count - 1) };
                    }
                    if (p._id === newPlan) {
                        return { ...p, count: p.count + 1 };
                    }
                    return p;
                });
                // Add new plan if it doesn't exist
                if (!updatedByPlan.find(p => p._id === newPlan)) {
                    updatedByPlan.push({ _id: newPlan, count: 1 });
                }
                return {
                    ...prev,
                    subscriptions: { byPlan: updatedByPlan.filter(p => p.count > 0) }
                };
            });
        } catch (err) {
            console.error('Error changing plan:', err);
            alert('Failed to change organization plan');
        }
    };

    if (loading) {
        return (
            <div className="super-admin-dashboard">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const orgMappings = getOrgUserMappings();
    const maxUsers = Math.max(...(analytics?.users.byRole.map(r => r.count) || [1]));
    const maxOrgs = Math.max(...(analytics?.subscriptions.byPlan.map(p => p.count) || [1]));

    return (
        <div className="super-admin-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <h1>🛡️ Super Admin Dashboard</h1>
                <p>Platform-wide organization and user management</p>
            </div>

            {error && <div className="error-banner">⚠️ {error}</div>}

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="icon">
                        <img src={listIcon} alt="Total Orgs" className="stat-icon-img" />
                    </div>
                    <div className="value">{analytics?.organizations.total || 0}</div>
                    <div className="label">Total Organizations</div>
                </div>
                <div className="stat-card">
                    <div className="icon">
                        <img src={activeOrgIcon} alt="Active Orgs" className="stat-icon-img" />
                    </div>
                    <div className="value">{analytics?.organizations.active || 0}</div>
                    <div className="label">Active Organizations</div>
                </div>
                <div className="stat-card">
                    <div className="icon">
                        <img src={inactiveOrgIcon} alt="Inactive Orgs" className="stat-icon-img" />
                    </div>
                    <div className="value">{(analytics?.organizations.total || 0) - (analytics?.organizations.active || 0)}</div>
                    <div className="label">Inactive Organizations</div>
                </div>
                <div className="stat-card">
                    <div className="icon">
                        <img src={groupIcon} alt="Total Users" className="stat-icon-img" />
                    </div>
                    <div className="value">{analytics?.users.total || 0}</div>
                    <div className="label">Total Users</div>
                </div>
                <div className="stat-card">
                    <div className="icon">
                        <img src={userIcon} alt="Active Users" className="stat-icon-img" />
                    </div>
                    <div className="value">{analytics?.users.active || 0}</div>
                    <div className="label">Active Users</div>
                </div>
            </div>

            {/* Organizations Section */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2><span className="icon">🏢</span> Organizations</h2>
                    <div className="quick-actions">
                        <Link to="/admin/organizations/create" className="action-btn primary">
                            🏢 Create Organization
                        </Link>
                        <Link to="/admin/users" className="action-btn secondary">
                            📋 Manage Users
                        </Link>
                        <Link to="/admin/users/create" className="action-btn secondary">
                            ➕ Create User
                        </Link>
                    </div>
                </div>

                {organizations.length > 0 ? (
                    <div className="org-cards-grid">
                        {organizations.map(org => {
                            const mapping = orgMappings.find(m => m.orgId === org._id);
                            return (
                                <div key={org._id} className={`org-card ${org.status === 'inactive' ? 'inactive' : ''}`}>
                                    <div className="org-card-header">
                                        <div>
                                            <h3>{org.name}</h3>
                                            <div className="domain">{org.domain || 'No domain set'}</div>
                                        </div>
                                        <span className={`status-badge ${org.status}`}>
                                            {org.status}
                                        </span>
                                    </div>

                                    <div className="org-stats">
                                        <div className="org-stat">
                                            <div className="value">{mapping?.admins || 0}</div>
                                            <div className="label">Admins</div>
                                        </div>
                                        <div className="org-stat">
                                            <div className="value">{mapping?.recruiters || 0}</div>
                                            <div className="label">Recruiters</div>
                                        </div>
                                        <div className="org-stat">
                                            <div className="value">{mapping?.total || 0}</div>
                                            <div className="label">Total Users</div>
                                        </div>
                                    </div>

                                    <div className="org-card-footer">
                                        <select
                                            className="plan-select"
                                            value={org.subscription.plan}
                                            onChange={(e) => changeOrgPlan(org._id, e.target.value)}
                                        >
                                            <option value="freemium">Freemium</option>
                                            <option value="professional">Professional</option>
                                            <option value="enterprise">Enterprise</option>
                                            <option value="custom">Custom</option>
                                        </select>
                                        <div className="org-actions">
                                            <button
                                                className={`toggle-status-btn ${org.status}`}
                                                onClick={() => toggleOrgStatus(org._id, org.status)}
                                            >
                                                {org.status === 'active' ? '⏸️' : '▶️'}
                                            </button>
                                            <button
                                                className="delete-org-btn"
                                                onClick={() => deleteOrganization(org._id, org.name)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="icon">🏢</div>
                        <p>No organizations found</p>
                    </div>
                )}
            </div>

            {/* User Permissions Mapping */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2><span className="icon">🔐</span> Organization & User Permissions Mapping</h2>
                </div>

                <div className="permissions-table-container">
                    <table className="permissions-table">
                        <thead>
                            <tr>
                                <th>Organization</th>
                                <th>Domain</th>
                                <th>Customer Admins</th>
                                <th>Recruiters</th>
                                <th>Candidates</th>
                                <th>Total Users</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orgMappings.map(mapping => (
                                <tr key={mapping.orgId}>
                                    <td><strong>{mapping.orgName}</strong></td>
                                    <td>{mapping.domain || '—'}</td>
                                    <td>
                                        <span className="role-count admin">
                                            👑 {mapping.admins}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="role-count recruiter">
                                            👔 {mapping.recruiters}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="role-count candidate">
                                            🎓 {mapping.candidates}
                                        </span>
                                    </td>
                                    <td><strong>{mapping.total}</strong></td>
                                </tr>
                            ))}
                            {orgMappings.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', color: '#a0aec0' }}>
                                        No organization data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Charts Section */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2><span className="icon">📊</span> Platform Analytics</h2>
                </div>

                <div className="charts-grid">
                    {/* Users by Role Chart */}
                    <div className="chart-card">
                        <h3>Users by Role</h3>
                        <div className="chart-container">
                            {analytics?.users.byRole.map((role, index) => (
                                <div key={role._id} className="chart-column">
                                    <div className="chart-column-track">
                                        <div
                                            className="fill"
                                            style={{
                                                height: `${(role.count / maxUsers) * 100}%`,
                                                background: ['#6259ca', '#09ad95', '#00809D', '#45aaf2', '#f7b731'][index % 5]
                                            }}
                                        >
                                            <span className="fill-value">{role.count}</span>
                                        </div>
                                    </div>
                                    <div className="chart-column-label">
                                        {role._id.replace('_', ' ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Organizations by Plan Chart */}
                    <div className="chart-card">
                        <h3>Organizations by Plan</h3>
                        <div className="chart-container">
                            {analytics?.subscriptions.byPlan.map((plan, index) => (
                                <div key={plan._id} className="chart-column">
                                    <div className="chart-column-track">
                                        <div
                                            className="fill"
                                            style={{
                                                height: `${(plan.count / maxOrgs) * 100}%`,
                                                background: ['#6259ca', '#09ad95', '#00809D', '#45aaf2', '#f7b731'][index % 5]
                                            }}
                                        >
                                            <span className="fill-value">{plan.count}</span>
                                        </div>
                                    </div>
                                    <div className="chart-column-label">
                                        {plan._id || 'Unknown'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
