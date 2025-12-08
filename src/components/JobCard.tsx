import React from 'react';
import { Link } from 'react-router-dom';

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

interface JobCardProps {
    job: Job;
    isRecruiter?: boolean;
    onDelete?: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, isRecruiter = false, onDelete }) => {
    return (
        <div className="job-card">
            <div className="job-card-header">
                <h3>{job.title}</h3>
                <span className={`status-badge ${job.status}`}>{job.status}</span>
            </div>

            <div className="job-card-info">
                <p><strong>Location:</strong> {job.location.city ? `${job.location.city}, ` : ''}{job.location.type}</p>
                <p><strong>Type:</strong> {job.employmentType}</p>
                <p><strong>Salary:</strong> {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}</p>
            </div>

            <div className="job-card-footer">
                <Link to={`/jobs/${job._id}`} className="btn-view">View Details</Link>
                {isRecruiter && (
                    <div className="recruiter-actions">
                        <Link to={`/jobs/${job._id}/edit`} className="btn-edit">Edit</Link>
                        {onDelete && (
                            <button onClick={() => onDelete(job._id)} className="btn-delete">Delete</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobCard;
