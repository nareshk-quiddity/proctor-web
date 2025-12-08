import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/ResumeUpload.css';

const ResumeUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [candidateName, setCandidateName] = useState('');
    const [candidateEmail, setCandidateEmail] = useState('');
    const [candidatePhone, setCandidatePhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setError('Please select a file');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('candidateName', candidateName);
        formData.append('candidateEmail', candidateEmail);
        formData.append('candidatePhone', candidatePhone);

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/recruiter/resumes/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Resume uploaded successfully!');
            setTimeout(() => navigate('/resumes'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload resume');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="resume-upload-container">
            <div className="upload-card">
                <h2>Upload Resume</h2>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="upload-form">
                    <div className="form-group">
                        <input
                            type="text"
                            id="candidateName"
                            value={candidateName}
                            onChange={(e) => setCandidateName(e.target.value)}
                            placeholder=" "
                        />
                        <label htmlFor="candidateName">Candidate Name</label>
                    </div>

                    <div className="form-group">
                        <input
                            type="email"
                            id="candidateEmail"
                            value={candidateEmail}
                            onChange={(e) => setCandidateEmail(e.target.value)}
                            placeholder=" "
                        />
                        <label htmlFor="candidateEmail">Email</label>
                    </div>

                    <div className="form-group">
                        <input
                            type="tel"
                            id="candidatePhone"
                            value={candidatePhone}
                            onChange={(e) => setCandidatePhone(e.target.value)}
                            placeholder=" "
                        />
                        <label htmlFor="candidatePhone">Phone</label>
                    </div>

                    <div className="form-group file-upload">
                        <label htmlFor="resume">Resume File *</label>
                        <input
                            type="file"
                            id="resume"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileChange}
                            required
                        />
                        {file && <p className="file-name">Selected: {file.name}</p>}
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Uploading...' : 'Upload Resume'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResumeUpload;
