import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

interface Organization {
    _id: string;
    name: string;
    domain: string;
}

const CreateUser = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('recruiter');
    const [organizationId, setOrganizationId] = useState('');
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingOrgs, setLoadingOrgs] = useState(false);
    const { createUser, user } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isSuperAdmin = user?.role === 'super_admin';
    const needsOrganization = ['customer_admin', 'recruiter'].includes(role);

    useEffect(() => {
        // Fetch organizations if user is super admin
        if (isSuperAdmin) {
            fetchOrganizations();
        }
    }, [isSuperAdmin]);

    const fetchOrganizations = async () => {
        setLoadingOrgs(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/super-admin/organizations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrganizations(res.data.organizations || []);
            if (res.data.organizations && res.data.organizations.length > 0) {
                setOrganizationId(res.data.organizations[0]._id);
            }
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
        }
        setLoadingOrgs(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (isSuperAdmin && needsOrganization && !organizationId) {
            setError('Please select an organization');
            return;
        }

        setLoading(true);
        const userData: any = { username, email, password, role };

        // Add organizationId if needed and selected
        if (isSuperAdmin && needsOrganization && organizationId) {
            userData.organizationId = organizationId;
        }

        const res = await createUser(userData);
        setLoading(false);

        if (res.success) {
            setSuccess('User created successfully! Redirecting...');
            setTimeout(() => navigate('/admin/users'), 2000);
        } else {
            setError(res.message || 'Failed to create user');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Create New User</h2>
                    <p>Admin Panel - User Management</p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder=" "
                            id="username"
                        />
                        <label htmlFor="username">Username</label>
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder=" "
                            id="email"
                        />
                        <label htmlFor="email">Email Address</label>
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder=" "
                            id="password"
                        />
                        <label htmlFor="password">Password</label>
                    </div>

                    <div className="form-group">
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            id="role"
                        >
                            {isSuperAdmin ? (
                                <>
                                    <option value="customer_admin">Customer Admin</option>
                                    <option value="recruiter">Recruiter</option>
                                    <option value="candidate">Candidate</option>
                                    <option value="super_admin">Super Admin</option>
                                </>
                            ) : (
                                <option value="recruiter">Recruiter</option>
                            )}
                        </select>
                        <label htmlFor="role">Role</label>
                    </div>

                    {isSuperAdmin && needsOrganization && (
                        <div className="form-group">
                            <select
                                value={organizationId}
                                onChange={(e) => setOrganizationId(e.target.value)}
                                id="organization"
                                required
                                disabled={loadingOrgs}
                            >
                                {loadingOrgs ? (
                                    <option>Loading organizations...</option>
                                ) : organizations.length === 0 ? (
                                    <option>No organizations available</option>
                                ) : (
                                    <>
                                        <option value="">Select Organization</option>
                                        {organizations.map(org => (
                                            <option key={org._id} value={org._id}>
                                                {org.name} ({org.domain})
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                            <label htmlFor="organization">Organization</label>
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`submit-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Creating User...' : 'Create User'}
                    </button>
                </form>

                <div className="auth-footer">
                    <Link to="/admin/users">← Back to User List</Link>
                </div>
            </div>
        </div>
    );
};

export default CreateUser;
