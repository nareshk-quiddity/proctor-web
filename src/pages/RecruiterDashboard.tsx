import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/Dashboard.css';

interface Analytics {
    overview: {
        myJobs: number;
        myResumes: number;
        myMatches: number;
        myInterviews: number;
    };
    jobsPerformance: Array<{
        title: string;
        matchCount: number;
        status: string;
    }>;
    interviewStats: Array<{
        _id: string;
        count: number;
    }>;
    topMatches: Array<any>;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const RecruiterDashboard = () => {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/analytics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/analytics/export/${type}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Failed to export data');
        }
    };

    if (loading) return <div className="loading">Loading dashboard...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!analytics) return <div className="error-message">No data available</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Recruiter Dashboard</h2>
                <div className="export-buttons">
                    <button onClick={() => handleExport('matches')} className="export-btn">
                        Export Matches
                    </button>
                    <button onClick={() => handleExport('resumes')} className="export-btn">
                        Export Resumes
                    </button>
                    <button onClick={() => handleExport('interviews')} className="export-btn">
                        Export Interviews
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">💼</div>
                    <div className="stat-content">
                        <div className="stat-value">{analytics.overview.myJobs}</div>
                        <div className="stat-label">My Jobs</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📄</div>
                    <div className="stat-content">
                        <div className="stat-value">{analytics.overview.myResumes}</div>
                        <div className="stat-label">Resumes</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                        <div className="stat-value">{analytics.overview.myMatches}</div>
                        <div className="stat-label">Matches</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                        <div className="stat-value">{analytics.overview.myInterviews}</div>
                        <div className="stat-label">Interviews</div>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Jobs Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.jobsPerformance.slice(0, 5)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="title" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="matchCount" fill="#6366f1" name="Matches" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Interview Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={analytics.interviewStats}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry._id}: ${entry.count}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {analytics.interviewStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="top-matches-section">
                <h3>Top Matches</h3>
                <div className="matches-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Job</th>
                                <th>Score</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analytics.topMatches.map((match, index) => (
                                <tr key={index}>
                                    <td>{match.candidateId?.candidateInfo?.name || 'N/A'}</td>
                                    <td>{match.jobId?.title || 'N/A'}</td>
                                    <td>
                                        <span className="match-score">{match.matchScore}%</span>
                                    </td>
                                    <td>
                                        <a href={`/jobs/${match.jobId?._id}/matches`} className="view-link">
                                            View
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;
