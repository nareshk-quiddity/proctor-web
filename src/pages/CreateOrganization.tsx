import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const API_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_URL || 'http://localhost:5003/api';

interface SubscriptionPlan {
    plan: string;
    maxRecruiters: number;
    maxJobPostings: number;
}

const CreateOrganization = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        plan: 'professional',
        maxRecruiters: 10,
        maxJobPostings: 20,
        contactEmail: '',
        contactName: ''
    });

    const planDefaults: Record<string, SubscriptionPlan> = {
        freemium: { plan: 'freemium', maxRecruiters: 2, maxJobPostings: 5 },
        professional: { plan: 'professional', maxRecruiters: 10, maxJobPostings: 20 },
        enterprise: { plan: 'enterprise', maxRecruiters: 50, maxJobPostings: 100 },
        custom: { plan: 'custom', maxRecruiters: 100, maxJobPostings: 500 }
    };

    const handlePlanChange = (plan: string) => {
        const defaults = planDefaults[plan];
        setFormData({
            ...formData,
            plan,
            maxRecruiters: defaults.maxRecruiters,
            maxJobPostings: defaults.maxJobPostings
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/super-admin/organizations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    domain: formData.domain || undefined,
                    subscription: {
                        plan: formData.plan,
                        maxRecruiters: formData.maxRecruiters,
                        maxJobPostings: formData.maxJobPostings,
                        status: 'active'
                    },
                    billing: {
                        contactEmail: formData.contactEmail || undefined,
                        contactName: formData.contactName || undefined
                    }
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create organization');
            }

            navigate('/super-admin/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to create organization');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-user-container">
            <div className="create-user-card">
                <h1>🏢 Create Organization</h1>
                <p className="subtitle">Add a new organization to the platform</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3>Basic Information</h3>

                        <div className="form-group">
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder=" "
                                id="name"
                            />
                            <label htmlFor="name">Organization Name *</label>
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                value={formData.domain}
                                onChange={e => setFormData({ ...formData, domain: e.target.value })}
                                placeholder=" "
                                id="domain"
                            />
                            <label htmlFor="domain">Domain (e.g., company.com)</label>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Subscription Plan</h3>

                        <div className="plan-selector">
                            {Object.keys(planDefaults).map(plan => (
                                <div
                                    key={plan}
                                    className={`plan-option ${formData.plan === plan ? 'selected' : ''}`}
                                    onClick={() => handlePlanChange(plan)}
                                >
                                    <div className="plan-name">{plan}</div>
                                    <div className="plan-details">
                                        {planDefaults[plan].maxRecruiters} recruiters, {planDefaults[plan].maxJobPostings} jobs
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="limits-grid">
                            <div className="form-group">
                                <input
                                    type="number"
                                    value={formData.maxRecruiters}
                                    onChange={e => setFormData({ ...formData, maxRecruiters: parseInt(e.target.value) })}
                                    required
                                    min="1"
                                    placeholder=" "
                                    id="maxRecruiters"
                                />
                                <label htmlFor="maxRecruiters">Max Recruiters</label>
                            </div>

                            <div className="form-group">
                                <input
                                    type="number"
                                    value={formData.maxJobPostings}
                                    onChange={e => setFormData({ ...formData, maxJobPostings: parseInt(e.target.value) })}
                                    required
                                    min="1"
                                    placeholder=" "
                                    id="maxJobPostings"
                                />
                                <label htmlFor="maxJobPostings">Max Job Postings</label>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Billing Contact (Optional)</h3>

                        <div className="form-group">
                            <input
                                type="text"
                                value={formData.contactName}
                                onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                                placeholder=" "
                                id="contactName"
                            />
                            <label htmlFor="contactName">Contact Name</label>
                        </div>

                        <div className="form-group">
                            <input
                                type="email"
                                value={formData.contactEmail}
                                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                placeholder=" "
                                id="contactEmail"
                            />
                            <label htmlFor="contactEmail">Contact Email</label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`submit-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Organization'}
                    </button>

                    <Link to="/super-admin/dashboard" className="back-btn">
                        ← Back to Dashboard
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default CreateOrganization;
