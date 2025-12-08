import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CandidateDashboard.css';

const API_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_URL || 'http://localhost:5002/api';

interface Interview {
    _id: string;
    accessToken: string;
    status: string;
    expiresAt: string;
    jobId?: {
        title: string;
    };
}

const CandidateDashboard = () => {
    const navigate = useNavigate();
    const [interview, setInterview] = useState<Interview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInterviewData();
    }, []);

    const fetchInterviewData = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            // Fetch user profile to get interview ID
            const profileRes = await fetch(`${API_URL}/auth/profile/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!profileRes.ok) throw new Error('Failed to fetch profile');

            const profile = await profileRes.json();

            if (profile.interviewId) {
                // Fetch interview details using the candidate route
                const interviewRes = await fetch(`${API_URL}/candidate/interview/${profile.interviewId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (interviewRes.ok) {
                    const interviewData = await interviewRes.json();
                    setInterview(interviewData);
                }
            }
        } catch (err) {
            console.error('Error fetching interview:', err);
            setError('Failed to load interview data');
        } finally {
            setLoading(false);
        }
    };

    const getInterviewStatus = () => {
        if (!interview) return { status: 'pending', message: 'No interview scheduled yet', color: '#718096' };

        const now = new Date();
        const expiresAt = new Date(interview.expiresAt);

        if (interview.status === 'completed') {
            return { status: 'completed', message: 'Interview completed', color: '#48bb78' };
        }

        if (now > expiresAt) {
            return { status: 'expired', message: 'Interview link expired', color: '#fc8181' };
        }

        const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
            status: 'active',
            message: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`,
            color: '#667eea'
        };
    };

    const handleStartInterview = () => {
        if (interview?.accessToken) {
            navigate(`/interview/${interview.accessToken}`);
        }
    };

    const statusInfo = getInterviewStatus();

    if (loading) {
        return (
            <div className="candidate-dashboard">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="candidate-dashboard">
            <div className="dashboard-header">
                <h1>Welcome, Candidate! 👋</h1>
                <p>Your interview portal</p>
            </div>

            {error && <div className="error-banner">{error}</div>}

            <div className="dashboard-content">
                <div className="interview-card">
                    <div className="card-header">
                        <div className="card-icon">📋</div>
                        <h2>Your Interview</h2>
                    </div>

                    <div className="status-badge" style={{ backgroundColor: statusInfo.color }}>
                        {statusInfo.message}
                    </div>

                    {interview ? (
                        <div className="interview-details">
                            <div className="detail-row">
                                <span className="label">Position:</span>
                                <span className="value">{interview.jobId?.title || 'Open Position'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Status:</span>
                                <span className="value capitalize">{interview.status}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Expires:</span>
                                <span className="value">
                                    {new Date(interview.expiresAt).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>

                            {statusInfo.status === 'active' && interview.status !== 'completed' && (
                                <button
                                    className="start-interview-btn"
                                    onClick={handleStartInterview}
                                >
                                    🎬 Start Interview
                                </button>
                            )}

                            {statusInfo.status === 'expired' && (
                                <div className="expired-notice">
                                    <p>⏰ Your interview link has expired.</p>
                                    <p>Please contact the recruiting team for assistance.</p>
                                </div>
                            )}

                            {interview.status === 'completed' && (
                                <div className="completed-notice">
                                    <p>✅ Thank you for completing your interview!</p>
                                    <p>The recruiting team will review your responses and get back to you.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="no-interview">
                            <div className="icon">📭</div>
                            <p>No interview scheduled yet</p>
                            <p className="sub-text">You'll see your interview details here once scheduled.</p>
                        </div>
                    )}
                </div>

                <div className="tips-card">
                    <h3>💡 Interview Tips</h3>
                    <ul>
                        <li>Find a quiet, well-lit location</li>
                        <li>Test your camera and microphone</li>
                        <li>Have a stable internet connection</li>
                        <li>Keep water nearby</li>
                        <li>Dress professionally</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CandidateDashboard;
