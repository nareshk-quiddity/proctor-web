import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await login(email, password);
        setLoading(false);

        if (res.success) {
            // Get user role from localStorage (set by login function)
            const role = localStorage.getItem('role');

            // Redirect based on role
            switch (role) {
                case 'super_admin':
                    navigate('/super-admin/dashboard');
                    break;
                case 'customer_admin':
                    navigate('/customer-admin/dashboard');
                    break;
                case 'recruiter':
                    navigate('/recruiter-dashboard');
                    break;
                case 'candidate':
                    navigate('/candidate-dashboard');
                    break;
                default:
                    navigate('/dashboard');
            }
        } else {
            setError(res.message || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Login to your account</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
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
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder=" "
                                id="password"
                            />
                            <label htmlFor="password">Password</label>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <div className="forgot-password-link">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>

                    <button
                        type="submit"
                        className={`submit-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
