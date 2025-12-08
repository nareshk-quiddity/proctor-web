import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/MatchReview.css';

interface Match {
    _id: string;
    candidateId: {
        _id: string;
        candidateInfo: {
            name: string;
            email: string;
        };
        parsedData?: {
            skills: string[];
        };
    };
    matchScore: number;
    matchDetails: {
        skillMatch: { score: number; matched?: string[]; missing?: string[] };
        experienceMatch: { score: number; analysis?: string };
        educationMatch: { score: number; analysis?: string };
        cultureFit: { score: number; analysis?: string };
    };
    aiRecommendation: {
        decision: string;
        reasoning: string;
        confidence: number;
    };
    recruiterReview: {
        status: string;
        notes?: string;
    };
    skillGaps?: string[];
    strengths?: string[];
}

const MatchReview = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchMatches();
    }, [jobId]);

    const fetchMatches = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/recruiter/matches/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMatches(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch matches');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (matchId: string, status: string, notes: string = '') => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `/api/recruiter/matches/${matchId}/review`,
                { status, notes },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchMatches();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update review');
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'high';
        if (score >= 60) return 'medium';
        return 'low';
    };

    const filteredMatches = matches.filter(match => {
        if (filter === 'all') return true;
        if (filter === 'pending') return match.recruiterReview.status === 'pending';
        if (filter === 'approved') return match.recruiterReview.status === 'approved';
        if (filter === 'rejected') return match.recruiterReview.status === 'rejected';
        return true;
    });

    if (loading) return <div className="loading">Loading matches...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="match-review-container">
            <div className="match-header">
                <h2>Job Matches</h2>
                <div className="filter-tabs">
                    <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        All ({matches.length})
                    </button>
                    <button
                        className={filter === 'pending' ? 'active' : ''}
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({matches.filter(m => m.recruiterReview.status === 'pending').length})
                    </button>
                    <button
                        className={filter === 'approved' ? 'active' : ''}
                        onClick={() => setFilter('approved')}
                    >
                        Approved ({matches.filter(m => m.recruiterReview.status === 'approved').length})
                    </button>
                    <button
                        className={filter === 'rejected' ? 'active' : ''}
                        onClick={() => setFilter('rejected')}
                    >
                        Rejected ({matches.filter(m => m.recruiterReview.status === 'rejected').length})
                    </button>
                </div>
            </div>

            <div className="matches-list">
                {filteredMatches.length === 0 ? (
                    <p>No matches found</p>
                ) : (
                    filteredMatches.map(match => (
                        <div key={match._id} className="match-card">
                            <div className="match-card-header">
                                <div className="candidate-info">
                                    <h3>{match.candidateId.candidateInfo.name}</h3>
                                    <p>{match.candidateId.candidateInfo.email}</p>
                                </div>
                                <div className={`match-score ${getScoreColor(match.matchScore)}`}>
                                    {match.matchScore}%
                                </div>
                            </div>

                            <div className="match-details">
                                <div className="detail-row">
                                    <span>Skills Match:</span>
                                    <div className="score-bar">
                                        <div
                                            className={`score-fill ${getScoreColor(match.matchDetails.skillMatch.score)}`}
                                            style={{ width: `${match.matchDetails.skillMatch.score}%` }}
                                        />
                                        <span>{match.matchDetails.skillMatch.score}%</span>
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <span>Experience Match:</span>
                                    <div className="score-bar">
                                        <div
                                            className={`score-fill ${getScoreColor(match.matchDetails.experienceMatch.score)}`}
                                            style={{ width: `${match.matchDetails.experienceMatch.score}%` }}
                                        />
                                        <span>{match.matchDetails.experienceMatch.score}%</span>
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <span>Education Match:</span>
                                    <div className="score-bar">
                                        <div
                                            className={`score-fill ${getScoreColor(match.matchDetails.educationMatch.score)}`}
                                            style={{ width: `${match.matchDetails.educationMatch.score}%` }}
                                        />
                                        <span>{match.matchDetails.educationMatch.score}%</span>
                                    </div>
                                </div>
                            </div>

                            {match.strengths && match.strengths.length > 0 && (
                                <div className="strengths-section">
                                    <h4>Matched Skills:</h4>
                                    <div className="skills-tags">
                                        {match.strengths.map((skill, i) => (
                                            <span key={i} className="skill-tag matched">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {match.skillGaps && match.skillGaps.length > 0 && (
                                <div className="gaps-section">
                                    <h4>Missing Skills:</h4>
                                    <div className="skills-tags">
                                        {match.skillGaps.map((skill, i) => (
                                            <span key={i} className="skill-tag missing">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="ai-recommendation">
                                <h4>AI Recommendation:</h4>
                                <p className={`recommendation ${match.aiRecommendation.decision}`}>
                                    {match.aiRecommendation.decision.replace(/_/g, ' ').toUpperCase()}
                                </p>
                                <p className="reasoning">{match.aiRecommendation.reasoning}</p>
                                <p className="confidence">Confidence: {(match.aiRecommendation.confidence * 100).toFixed(0)}%</p>
                            </div>

                            {match.recruiterReview.status === 'pending' && (
                                <div className="review-actions">
                                    <button
                                        className="btn-approve"
                                        onClick={() => handleReview(match._id, 'approved', 'Approved for next round')}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="btn-reject"
                                        onClick={() => handleReview(match._id, 'rejected', 'Not a good fit')}
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}

                            {match.recruiterReview.status !== 'pending' && (
                                <div className={`review-status ${match.recruiterReview.status}`}>
                                    Status: {match.recruiterReview.status.toUpperCase()}
                                    {match.recruiterReview.notes && <p>Notes: {match.recruiterReview.notes}</p>}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MatchReview;
