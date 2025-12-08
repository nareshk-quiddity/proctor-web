import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/JobDetail.css';

interface Job {
    _id: string;
    title: string;
    description: string;
    requirements: {
        skills: string[];
        experience: {
            min: number;
            max: number;
            unit: string;
        };
        education: string;
    };
    location: {
        type: string;
        city?: string;
        country?: string;
    };
    employmentType: string;
    salary: {
        min: number;
        max: number;
        currency: string;
    };
    status: string;
    createdAt: string;
}

const JobDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const token = localStorage.getItem('token');
                const endpoint = user?.role === 'recruiter'
                    ? `/api/recruiter/jobs/${id}`
                    : `/api/jobs/${id}`; // Public endpoint

                const res = await axios.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setJob(res.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch job details');
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id, user?.role]);

    if (loading) return <div className="loading">Loading job details...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!job) return <div className="error-message">Job not found</div>;

    return (
        <div className="job-detail-container">
            <div className="job-detail-header">
                <div className="header-content">
                    <h1>{job.title}</h1>
                    <div className="job-meta">
                        <span className="location">📍 {job.location.city}, {job.location.type}</span>
                        <span className="type">💼 {job.employmentType}</span>
                        <span className="salary">💰 {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}</span>
                    </div>
                </div>
                {user?.role === 'recruiter' && (
                    <div className="header-actions">
                        <Link to={`/jobs/${job._id}/edit`} className="btn-edit-job">Edit Job</Link>
                    </div>
                )}
            </div>

            <div className="job-content">
                <section className="description-section">
                    <h2>Description</h2>
                    <div className="description-text">{job.description}</div>
                </section>

                <section className="requirements-section">
                    <h2>Requirements</h2>

                    <div className="req-group">
                        <h3>Skills</h3>
                        <div className="skills-list">
                            {job.requirements.skills.map((skill, index) => (
                                <span key={index} className="skill-tag">{skill}</span>
                            ))}
                        </div>
                    </div>

                    <div className="req-group">
                        <h3>Experience</h3>
                        <p>{job.requirements.experience.min} - {job.requirements.experience.max} {job.requirements.experience.unit}</p>
                    </div>

                    <div className="req-group">
                        <h3>Education</h3>
                        <p>{job.requirements.education}</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default JobDetail;
