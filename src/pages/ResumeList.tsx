import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/ResumeList.css';

interface Resume {
    _id: string;
    candidateInfo: {
        name: string;
        email: string;
        phone?: string;
    };
    resumeFile?: {
        originalName: string;
        fileUrl: string;
        fileType: string;
    };
    parsedData?: {
        skills: string[];
        rawText?: string;
    };
    status: string;
    createdAt: string;
}

const ResumeList = () => {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        search: ''
    });

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/recruiter/resumes', {
                headers: { Authorization: `Bearer ${token}` },
                params: filters
            });

            setResumes(res.data.resumes || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch resumes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumes();
    }, [filters]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this resume?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/recruiter/resumes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResumes(resumes.filter(resume => resume._id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete resume');
        }
    };

    return (
        <div className="resume-list-container">
            <div className="resume-list-header">
                <h2>Resumes</h2>
                <div className="header-actions">
                    <Link to="/resumes/upload" className="btn-upload">Upload Resume</Link>
                    <Link to="/resumes/bulk-upload" className="btn-bulk">Bulk Upload</Link>
                </div>
            </div>

            <div className="filters-section">
                <input
                    type="text"
                    name="search"
                    placeholder="Search by name or email..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="search-input"
                />
                <select
                    name="status"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="status-select"
                >
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="screening">Screening</option>
                    <option value="matched">Matched</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Loading resumes...</div>
            ) : (
                <div className="resumes-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Skills</th>
                                <th>Status</th>
                                <th>Uploaded</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resumes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center' }}>No resumes found</td>
                                </tr>
                            ) : (
                                resumes.map(resume => (
                                    <tr key={resume._id}>
                                        <td>{resume.candidateInfo.name}</td>
                                        <td>{resume.candidateInfo.email}</td>
                                        <td>
                                            <div className="skills-preview">
                                                {resume.parsedData?.skills.slice(0, 3).map((skill, i) => (
                                                    <span key={i} className="skill-tag">{skill}</span>
                                                ))}
                                                {resume.parsedData && resume.parsedData.skills.length > 3 && (
                                                    <span className="more-skills">+{resume.parsedData.skills.length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${resume.status}`}>
                                                {resume.status}
                                            </span>
                                        </td>
                                        <td>{new Date(resume.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="actions">
                                                {resume.resumeFile?.fileUrl && (
                                                    <a
                                                        href={`http://localhost:5002${resume.resumeFile.fileUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-view"
                                                    >
                                                        📄 View
                                                    </a>
                                                )}
                                                <button onClick={() => handleDelete(resume._id)} className="btn-delete">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ResumeList;
