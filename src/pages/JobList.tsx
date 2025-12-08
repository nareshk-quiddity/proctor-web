import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import { Link } from 'react-router-dom';
import '../styles/JobList.css';

interface Job {
    _id: string;
    title: string;
    description: string;
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
    createdAt: string;
    status: string;
}

const JobList = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const [filters, setFilters] = useState({
        status: '',
        search: ''
    });

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            // Determine endpoint based on role
            const endpoint = user?.role === 'recruiter'
                ? '/api/recruiter/jobs'
                : '/api/jobs'; // Public/Candidate endpoint (to be created if not exists)

            // For now, let's assume recruiter view mainly as per task
            // If candidate, we might need a different route or use the public one

            const res = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
                params: filters
            });

            setJobs(res.data.jobs || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [filters, user?.role]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/recruiter/jobs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(jobs.filter(job => job._id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete job');
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="job-list-container">
            <div className="job-list-header">
                <h2>Job Listings</h2>
                {user?.role === 'recruiter' && (
                    <Link to="/jobs/create" className="btn-create-job">Post New Job</Link>
                )}
            </div>

            <div className="filters-section">
                <input
                    type="text"
                    name="search"
                    placeholder="Search jobs..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="search-input"
                />
                <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="status-select"
                >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="draft">Draft</option>
                </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Loading jobs...</div>
            ) : (
                <div className="jobs-grid">
                    {jobs.length === 0 ? (
                        <p>No jobs found.</p>
                    ) : (
                        jobs.map(job => (
                            <JobCard
                                key={job._id}
                                job={job}
                                isRecruiter={user?.role === 'recruiter'}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default JobList;
