import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

const API_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_URL || 'http://localhost:5002/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Reset link sent if email exists');
                setSubmitted(true);
            } else {
                setError(data.message || 'Failed to send reset link');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>🔐 Forgot Password</h2>
                    <p>Enter your email to receive a reset link</p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                {!submitted ? (
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

                        <button
                            type="submit"
                            className={`submit-btn ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <div className="success-container">
                        <div className="success-icon">📧</div>
                        <p>Check your email for the reset link!</p>
                        <p className="sub-text">If you don't see it, check your spam folder.</p>
                    </div>
                )}

                <div className="auth-footer">
                    Remember your password? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
