import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/BulkUpload.css';

interface UploadResult {
    successful: Array<{ filename: string; resumeId: string }>;
    failed: Array<{ filename: string; error: string }>;
}

const BulkUpload = () => {
    const [files, setFiles] = useState<FileList | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState<UploadResult | null>(null);
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(e.target.files);
            setError('');
            setResults(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!files || files.length === 0) {
            setError('Please select at least one file');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('resumes', file);
        });

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/recruiter/resumes/bulk-upload', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setResults(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload resumes');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bulk-upload-container">
            <div className="bulk-upload-card">
                <h2>Bulk Upload Resumes</h2>
                <p className="subtitle">Upload multiple resumes at once (max 10 files)</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="bulk-upload-form">
                    <div className="file-drop-zone">
                        <input
                            type="file"
                            id="bulk-resumes"
                            accept=".pdf,.doc,.docx,.txt"
                            multiple
                            onChange={handleFileChange}
                            required
                        />
                        <label htmlFor="bulk-resumes">
                            <div className="drop-icon">📁</div>
                            <p>Click to select files or drag and drop</p>
                            <p className="file-types">Supported: PDF, DOC, DOCX, TXT</p>
                        </label>
                    </div>

                    {files && files.length > 0 && (
                        <div className="selected-files">
                            <h3>Selected Files ({files.length})</h3>
                            <ul>
                                {Array.from(files).map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Uploading...' : 'Upload All Resumes'}
                    </button>
                </form>

                {results && (
                    <div className="upload-results">
                        <h3>Upload Results</h3>

                        {results.successful.length > 0 && (
                            <div className="success-section">
                                <h4>✅ Successfully Uploaded ({results.successful.length})</h4>
                                <ul>
                                    {results.successful.map((item, index) => (
                                        <li key={index}>{item.filename}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {results.failed.length > 0 && (
                            <div className="failed-section">
                                <h4>❌ Failed ({results.failed.length})</h4>
                                <ul>
                                    {results.failed.map((item, index) => (
                                        <li key={index}>
                                            {item.filename}: {item.error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={() => navigate('/resumes')}
                            className="view-resumes-btn"
                        >
                            View All Resumes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkUpload;
