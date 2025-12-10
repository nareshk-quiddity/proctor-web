import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
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

interface PermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    org: Organization;
    onSave: (orgId: string, updates: any) => Promise<void>;
}

const ManagePermissionsModal = ({ isOpen, onClose, org, onSave }: PermissionModalProps) => {
    const [status, setStatus] = useState(org.status);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setStatus(org.status);
    }, [org]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setLoading(true);
        await onSave(org._id, { status });
        setLoading(false);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Manage Permissions - {org.name}</h3>
                    <button className="close-modal-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                className="toggle-input"
                                checked={status === 'active'}
                                onChange={(e) => setStatus(e.target.checked ? 'active' : 'inactive')}
                            />
                            <span>Organization Status: <strong>{status === 'active' ? 'Active' : 'Inactive'}</strong></span>
                        </label>
                    </div>
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#475569' }}>Access Control</h4>
                        <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Recruiter Access</span>
                                <span style={{ color: '#16a34a' }}>Allowed</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Candidate Access</span>
                                <span style={{ color: '#16a34a' }}>Allowed</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>API Access</span>
                                <span style={{ color: '#dc2626' }}>Restricted</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="action-btn secondary" onClick={onClose}>Cancel</button>
                    <button className="action-btn primary" onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    org: Organization;
    onUpgrade: (orgId: string, plan: string) => Promise<void>;
}

const PlanUpgradeModal = ({ isOpen, onClose, org, onUpgrade }: PlanModalProps) => {
    const [selectedPlan, setSelectedPlan] = useState(org.subscription.plan);
    const [processing, setProcessing] = useState(false);

    if (!isOpen) return null;

    const plans = [
        { id: 'freemium', name: 'Freemium', price: '$0/mo' },
        { id: 'professional', name: 'Professional', price: '$49/mo' },
        { id: 'enterprise', name: 'Enterprise', price: '$199/mo' }
    ];

    const handleUpgrade = async () => {
        if (selectedPlan === org.subscription.plan) {
            onClose();
            return;
        }
        setProcessing(true);
        // Simulate payment delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        await onUpgrade(org._id, selectedPlan);
        setProcessing(false);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={processing ? undefined : onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Upgrade Plan - {org.name}</h3>
                    {!processing && <button className="close-modal-btn" onClick={onClose}>&times;</button>}
                </div>
                <div className="modal-body">
                    {processing ? (
                        <div className="loading-container" style={{ minHeight: '200px' }}>
                            <div className="spinner"></div>
                            <p>Processing Payment...</p>
                        </div>
                    ) : (
                        <div className="plan-options">
                            {plans.map(plan => (
                                <div
                                    key={plan.id}
                                    className={`plan-option-card ${selectedPlan === plan.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedPlan(plan.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPlan === plan.id}
                                        onChange={() => setSelectedPlan(plan.id)}
                                        style={{ accentColor: '#6259ca' }}
                                    />
                                    <div className="plan-info">
                                        <span className="plan-name">{plan.name}</span>
                                        <span className="plan-price">{plan.price}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {!processing && (
                    <div className="modal-footer">
                        <button className="action-btn secondary" onClick={onClose}>Cancel</button>
                        <button className="action-btn primary" onClick={handleUpgrade}>
                            {selectedPlan === org.subscription.plan ? 'Current Plan' : 'Proceed to Payment'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const SuperAdminDashboard = () => {
    const [organizations, setOrganizations] = useState<OrgWithStats[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // UI State
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);


    const ITEMS_PER_SLIDE = 8;
    const totalSlides = Math.ceil(organizations.length / ITEMS_PER_SLIDE);

    const nextSlide = () => setCurrentSlide(prev => (prev + 1) % totalSlides);
    const prevSlide = () => setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);

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

    const updateOrgStatus = async (orgId: string, updates: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/super-admin/organizations/${orgId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) throw new Error('Failed to update organization');

            const newStatus = updates.status;
            // Update local state
            setOrganizations(orgs => orgs.map(org =>
                org._id === orgId ? { ...org, ...updates } : org
            ));

            // Update analytics if status changed
            if (newStatus) {
                setAnalytics(prev => {
                    if (!prev) return prev;
                    if (prev.organizations.total > 0) { // Simple recalculation or re-fetch would be better, but approximating
                        // Re-fetching is safer usually, but for UI responsiveness we update locally
                    }
                    return prev;
                });
                fetchDashboardData(); // Refresh to be safe
            }
        } catch (err) {
            console.error('Error updating org:', err);
            alert('Failed to update organization');
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

    const updateOrgPlan = async (orgId: string, newPlan: string) => {
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

            if (!response.ok) throw new Error('Failed to update plan');

            // Update local and fetch
            setOrganizations(orgs => orgs.map(org =>
                org._id === orgId
                    ? { ...org, subscription: { ...org.subscription, plan: newPlan } }
                    : org
            ));
            fetchDashboardData(); // Refresh analytics
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
        <div className="super-admin-dashboard" style={{
            padding: '2rem',
            background: '#f8fafc',
            minHeight: '100vh',
            width: '100%'
        }}>
            {/* Header */}
            <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div>
                    <h1>🛡️ Super Admin Dashboard</h1>
                    <p>Platform-wide organization and user management</p>
                </div>
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
                    <>
                        <div className="org-cards-grid">
                            {organizations.slice(currentSlide * ITEMS_PER_SLIDE, (currentSlide + 1) * ITEMS_PER_SLIDE).map(org => {
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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                                <span className="org-plan">{org.subscription.plan}</span>
                                                <button
                                                    className="action-btn secondary"
                                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                                                    onClick={() => { setSelectedOrg(org); setIsPlanModalOpen(true); }}
                                                >
                                                    Upgrade
                                                </button>
                                            </div>
                                            <div className="org-actions">
                                                <button
                                                    className={`toggle-status-btn ${org.status}`}
                                                    onClick={() => { setSelectedOrg(org); setIsPermissionModalOpen(true); }}
                                                    title="Manage Permissions & Status"
                                                >
                                                    {org.status === 'active' ? '⏸️ Active' : '▶️ Inactive'}
                                                </button>
                                                <button
                                                    className="delete-org-btn"
                                                    onClick={() => deleteOrganization(org._id, org.name)}
                                                    title="Delete Organization"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {totalSlides > 1 && (
                            <div className="carousel-controls">
                                <button className="carousel-btn" onClick={prevSlide} disabled={currentSlide === 0}>
                                    ←
                                </button>
                                <div className="carousel-indicators">
                                    {Array.from({ length: totalSlides }).map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`indicator ${currentSlide === idx ? 'active' : ''}`}
                                            onClick={() => setCurrentSlide(idx)}
                                        />
                                    ))}
                                </div>
                                <button className="carousel-btn" onClick={nextSlide} disabled={currentSlide === totalSlides - 1}>
                                    →
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="icon">🏢</div>
                        <p>No organizations found</p>
                    </div>
                )}
            </div>

            {selectedOrg && (
                <>
                    <ManagePermissionsModal
                        isOpen={isPermissionModalOpen}
                        onClose={() => setIsPermissionModalOpen(false)}
                        org={selectedOrg}
                        onSave={updateOrgStatus}
                    />
                    <PlanUpgradeModal
                        isOpen={isPlanModalOpen}
                        onClose={() => setIsPlanModalOpen(false)}
                        org={selectedOrg}
                        onUpgrade={updateOrgPlan}
                    />
                </>
            )}

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
