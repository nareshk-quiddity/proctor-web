import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/InterviewResults.css';

interface Interview {
    _id: string;
    candidateId: {
        candidateInfo: {
            name: string;
            email: string;
        };
    };
    jobId: {
        title: string;
    };
    status: string;
    overallScore: number;
    completedAt: string;
    questions: Array<{
        questionText: string;
        questionType: string;
        answer: string;
        aiScore: number;
        aiAnalysis?: {
            strengths: string[];
            weaknesses: string[];
            keyPoints: string[];
            sentiment: string;
        };
        timeSpent: number;
    }>;
    aiAssessment: {
        technicalScore: number;
        communicationScore: number;
        problemSolvingScore: number;
        cultureFitScore: number;
        strengths: string[];
        concerns: string[];
        keyInsights: string[];
        recommendation: string;
        confidence: number;
    };
    videoRecording?: {
        fileUrl: string;
        fileName: string;
        fileSize: number;
        duration: number;
        uploadedAt: string;
    };
}

const InterviewResults = () => {
    const { interviewId } = useParams<{ interviewId: string }>();
    const [interview, setInterview] = useState<Interview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInterview();
    }, [interviewId]);

    const fetchInterview = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/recruiter/interviews/${interviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInterview(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load interview results');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'high';
        if (score >= 60) return 'medium';
        return 'low';
    };

    const getRecommendationColor = (rec: string) => {
        if (rec === 'strong_yes') return 'strong-yes';
        if (rec === 'yes') return 'yes';
        if (rec === 'maybe') return 'maybe';
        return 'no';
    };

    if (loading) return <div className="loading">Loading interview results...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!interview) return <div className="error-message">Interview not found</div>;

    return (
        <div className="interview-results-container">
            <div className="results-header">
                <div className="candidate-info">
                    <h2>{interview.candidateId.candidateInfo.name}</h2>
                    <p>{interview.candidateId.candidateInfo.email}</p>
                    <p className="job-title">{interview.jobId.title}</p>
                </div>
                <div className={`overall-score ${getScoreColor(interview.overallScore)}`}>
                    <div className="score-label">Overall Score</div>
                    <div className="score-value">{interview.overallScore}%</div>
                </div>
            </div>

            <div className="assessment-summary">
                <h3>AI Assessment</h3>
                <div className="score-breakdown">
                    <div className="score-item">
                        <span>Technical</span>
                        <div className="score-bar">
                            <div
                                className={`score-fill ${getScoreColor(interview.aiAssessment.technicalScore)}`}
                                style={{ width: `${interview.aiAssessment.technicalScore}%` }}
                            />
                        </div>
                        <span>{interview.aiAssessment.technicalScore}%</span>
                    </div>
                    <div className="score-item">
                        <span>Communication</span>
                        <div className="score-bar">
                            <div
                                className={`score-fill ${getScoreColor(interview.aiAssessment.communicationScore)}`}
                                style={{ width: `${interview.aiAssessment.communicationScore}%` }}
                            />
                        </div>
                        <span>{interview.aiAssessment.communicationScore}%</span>
                    </div>
                    <div className="score-item">
                        <span>Problem Solving</span>
                        <div className="score-bar">
                            <div
                                className={`score-fill ${getScoreColor(interview.aiAssessment.problemSolvingScore)}`}
                                style={{ width: `${interview.aiAssessment.problemSolvingScore}%` }}
                            />
                        </div>
                        <span>{interview.aiAssessment.problemSolvingScore}%</span>
                    </div>
                    <div className="score-item">
                        <span>Culture Fit</span>
                        <div className="score-bar">
                            <div
                                className={`score-fill ${getScoreColor(interview.aiAssessment.cultureFitScore)}`}
                                style={{ width: `${interview.aiAssessment.cultureFitScore}%` }}
                            />
                        </div>
                        <span>{interview.aiAssessment.cultureFitScore}%</span>
                    </div>
                </div>

                <div className="assessment-details">
                    <div className="detail-section">
                        <h4>Strengths</h4>
                        <ul>
                            {interview.aiAssessment.strengths.map((strength, i) => (
                                <li key={i} className="strength-item">{strength}</li>
                            ))}
                        </ul>
                    </div>

                    {interview.aiAssessment.concerns.length > 0 && (
                        <div className="detail-section">
                            <h4>Concerns</h4>
                            <ul>
                                {interview.aiAssessment.concerns.map((concern, i) => (
                                    <li key={i} className="concern-item">{concern}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="detail-section">
                        <h4>Key Insights</h4>
                        <ul>
                            {interview.aiAssessment.keyInsights.map((insight, i) => (
                                <li key={i}>{insight}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="recommendation-section">
                        <h4>Recommendation</h4>
                        <div className={`recommendation ${getRecommendationColor(interview.aiAssessment.recommendation)}`}>
                            {interview.aiAssessment.recommendation.replace(/_/g, ' ').toUpperCase()}
                        </div>
                        <p className="confidence">Confidence: {(interview.aiAssessment.confidence * 100).toFixed(0)}%</p>
                    </div>
                </div>
            </div>

            <div className="questions-section">
                <h3>Question-by-Question Analysis</h3>
                {interview.questions.map((q, index) => (
                    <div key={index} className="question-result">
                        <div className="question-header">
                            <span className="question-number">Q{index + 1}</span>
                            <span className="question-type">{q.questionType.replace(/_/g, ' ')}</span>
                            <span className={`question-score ${getScoreColor(q.aiScore)}`}>{q.aiScore}%</span>
                        </div>
                        <p className="question-text">{q.questionText}</p>
                        <div className="answer-section">
                            <h5>Answer:</h5>
                            <p className="answer-text">{q.answer}</p>
                        </div>
                        {q.aiAnalysis && (
                            <div className="analysis-section">
                                {q.aiAnalysis.strengths.length > 0 && (
                                    <div className="analysis-item">
                                        <strong>Strengths:</strong>
                                        <ul>
                                            {q.aiAnalysis.strengths.map((s, i) => (
                                                <li key={i}>{s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {q.aiAnalysis.weaknesses.length > 0 && (
                                    <div className="analysis-item">
                                        <strong>Areas for Improvement:</strong>
                                        <ul>
                                            {q.aiAnalysis.weaknesses.map((w, i) => (
                                                <li key={i}>{w}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                        <p className="time-spent">Time spent: {Math.floor(q.timeSpent / 60)}m {q.timeSpent % 60}s</p>
                    </div>
                ))}
            </div>

            {/* Video Recording Section */}
            {interview.videoRecording && (
                <div className="video-section" style={{ marginTop: '2rem', padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>Interview Recording</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <video
                            src={interview.videoRecording.fileUrl}
                            controls
                            style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
                        />
                        <a
                            href={interview.videoRecording.fileUrl}
                            download
                            className="download-btn"
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#2563eb',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontWeight: '500'
                            }}
                        >
                            Download Video
                        </a>
                    </div>
                </div>
            )}

            {/* Feedback Section */}
            <div className="feedback-section" style={{ marginTop: '2rem', padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>Send Feedback to Candidate</h3>
                <FeedbackForm interviewId={interview._id} />
            </div>
        </div>
    );
};

const FeedbackForm = ({ interviewId }: { interviewId: string }) => {
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(5);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');

    const handleSendFeedback = async () => {
        if (!feedback.trim()) return;

        setSending(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/recruiter/interviews/${interviewId}/feedback`, {
                feedback,
                rating
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Feedback sent successfully!');
            setFeedback('');
        } catch (err) {
            setMessage('Failed to send feedback');
        } finally {
            setSending(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Rating (1-5)</label>
                <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                >
                    {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}</option>
                    ))}
                </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Feedback Comments</label>
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    placeholder="Enter feedback for the candidate..."
                />
            </div>
            {message && <p style={{ color: message.includes('success') ? 'green' : 'red', marginBottom: '1rem' }}>{message}</p>}
            <button
                onClick={handleSendFeedback}
                disabled={sending || !feedback.trim()}
                style={{
                    padding: '0.75rem 1.5rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    opacity: sending ? 0.7 : 1
                }}
            >
                {sending ? 'Sending...' : 'Send Feedback'}
            </button>
        </div>


    );
};

export default InterviewResults;
