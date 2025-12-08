import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import VideoRecorder, { VideoRecorderRef } from '../components/VideoRecorder';
import { useRef } from 'react';
import '../styles/InterviewBot.css';

interface Question {
    questionId: string;
    questionText: string;
    questionType: string;
    options?: string[];
}

interface Interview {
    _id: string;
    status: string;
    expiresAt: string;
    questions: Question[];
    jobId: {
        title: string;
        description: string;
    };
}

const InterviewBot = () => {
    const { token } = useParams<{ token: string }>();
    const [interview, setInterview] = useState<Interview | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [started, setStarted] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState<number | null>(null);
    const [startTime, setStartTime] = useState<number>(0);

    // Candidate details
    const [candidateName, setCandidateName] = useState('');
    const [candidateEmail, setCandidateEmail] = useState('');
    const [detailsSubmitted, setDetailsSubmitted] = useState(false);

    const videoRecorderRef = useRef<VideoRecorderRef>(null);

    useEffect(() => {
        fetchInterview();
    }, [token]);

    const fetchInterview = async () => {
        try {
            const res = await axios.get(`/api/candidate/interview/${token}`);
            setInterview(res.data);
            setStarted(res.data.status === 'in_progress');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load interview');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitDetails = async () => {
        if (!candidateName.trim()) {
            setError('Please enter your name');
            return;
        }
        if (!candidateEmail.trim()) {
            setError('Please enter your email');
            return;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(candidateEmail)) {
            setError('Please enter a valid email address');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await axios.post(`/api/candidate/interview/${token}/details`, {
                candidateName,
                candidateEmail
            });
            setDetailsSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit details');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStart = async () => {
        try {
            await axios.post(`/api/candidate/interview/${token}/start`);
            setStarted(true);
            setStartTime(Date.now());
            // Start video recording
            if (videoRecorderRef.current) {
                videoRecorderRef.current.startRecording();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to start interview');
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) {
            setError('Please provide an answer');
            return;
        }

        setSubmitting(true);
        setError('');
        setFeedback('');

        const timeSpent = Math.floor((Date.now() - startTime) / 1000);

        try {
            const res = await axios.post(
                `/api/candidate/interview/${token}/answer`,
                {
                    questionId: interview!.questions[currentQuestionIndex].questionId,
                    answer,
                    timeSpent
                }
            );

            setFeedback(res.data.feedback || 'Answer submitted!');
            setScore(res.data.score);

            // Move to next question after a delay
            setTimeout(() => {
                if (currentQuestionIndex < interview!.questions.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                    setAnswer('');
                    setFeedback('');
                    setScore(null);
                    setStartTime(Date.now());
                } else {
                    handleComplete();
                }
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit answer');
        } finally {
            setSubmitting(false);
        }
    };

    const handleComplete = async () => {
        try {
            // Stop recording and get blob
            let videoBlob: Blob | null = null;
            if (videoRecorderRef.current) {
                videoRecorderRef.current.stopRecording();
                // Give it a moment to process the last chunk
                await new Promise(resolve => setTimeout(resolve, 500));
                videoBlob = videoRecorderRef.current.getBlob();
            }

            // Upload video if exists
            if (videoBlob) {
                const formData = new FormData();
                formData.append('video', videoBlob, 'interview-recording.webm');

                try {
                    await axios.post(`/api/candidate/interview/${token}/upload-video`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } catch (uploadErr) {
                    console.error('Failed to upload video:', uploadErr);
                    // Continue to complete interview even if upload fails
                }
            }

            const res = await axios.post(`/api/candidate/interview/${token}/complete`);
            setCompleted(true);
            setScore(res.data.overallScore);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to complete interview');
        }
    };

    if (loading) return <div className="loading">Loading interview...</div>;
    if (error && !interview) return <div className="error-message">{error}</div>;
    if (!interview) return <div className="error-message">Interview not found</div>;

    if (completed) {
        return (
            <div className="interview-bot-container">
                <div className="completion-card">
                    <div className="success-icon">✅</div>
                    <h2>Interview Completed!</h2>
                    <p>Thank you for completing the interview.</p>
                    {score !== null && (
                        <div className="final-score">
                            <h3>Your Score</h3>
                            <div className="score-display">{score}%</div>
                        </div>
                    )}
                    <p className="next-steps">We'll review your responses and get back to you soon.</p>
                </div>
            </div>
        );
    }

    if (!started) {
        // Show candidate details form first
        if (!detailsSubmitted) {
            return (
                <div className="interview-bot-container">
                    <div className="welcome-card">
                        <h2>Before We Begin</h2>
                        <p>Please provide your details to start the interview</p>

                        {error && <div className="error-message">{error}</div>}

                        <div style={{ marginTop: '2rem', textAlign: 'left' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={candidateName}
                                    onChange={(e) => setCandidateName(e.target.value)}
                                    placeholder="Enter your full name"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={candidateEmail}
                                    onChange={(e) => setCandidateEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSubmitDetails}
                            className="start-btn"
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Continue to Interview'}
                        </button>
                    </div>
                </div>
            );
        }

        // Show welcome screen after details submitted
        return (
            <div className="interview-bot-container">
                <div className="welcome-card">
                    <h2>Welcome to Your Interview, {candidateName}!</h2>

                    <div style={{ marginBottom: '2rem' }}>
                        <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                            This interview will be video recorded. Please ensure your camera and microphone are working.
                        </p>
                        <VideoRecorder ref={videoRecorderRef} />
                    </div>

                    <div className="job-info">
                        <h3>{interview.jobId.title}</h3>
                        <p>{interview.jobId.description}</p>
                    </div>
                    <div className="interview-info">
                        <p><strong>Total Questions:</strong> {interview.questions.length}</p>
                        <p><strong>Expires:</strong> {new Date(interview.expiresAt).toLocaleString()}</p>
                    </div>
                    <button onClick={handleStart} className="start-btn">
                        Start Interview
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = interview.questions[currentQuestionIndex];

    return (
        <div className="interview-bot-container">
            <div className="interview-progress">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${((currentQuestionIndex + 1) / interview.questions.length) * 100}%` }}
                    />
                </div>
                <span className="progress-text">
                    Question {currentQuestionIndex + 1} of {interview.questions.length}
                </span>
            </div>

            <div className="question-card">
                <div className="question-header">
                    <span className="question-type">{currentQuestion.questionType.replace(/_/g, ' ')}</span>
                </div>

                <h3 className="question-text">{currentQuestion.questionText}</h3>

                {currentQuestion.options && currentQuestion.options.length > 0 ? (
                    <div className="options-list">
                        {currentQuestion.options.map((option, index) => (
                            <label key={index} className="option-item">
                                <input
                                    type="radio"
                                    name="answer"
                                    value={option}
                                    checked={answer === option}
                                    onChange={(e) => setAnswer(e.target.value)}
                                />
                                <span>{option}</span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <textarea
                        className="answer-textarea"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        rows={8}
                    />
                )}

                {error && <div className="error-message">{error}</div>}
                {feedback && (
                    <div className="feedback-message">
                        <p>{feedback}</p>
                        {score !== null && <p className="score">Score: {score}%</p>}
                    </div>
                )}

                <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !answer.trim()}
                    className="submit-btn"
                >
                    {submitting ? 'Submitting...' :
                        currentQuestionIndex === interview.questions.length - 1 ? 'Submit & Complete' : 'Submit Answer'}
                </button>
            </div>
        </div>
    );
};

export default InterviewBot;
