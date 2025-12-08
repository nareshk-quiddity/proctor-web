import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MatchingConfig.css';

interface Config {
    thresholds: {
        minimumMatchScore: number;
        strongMatchScore: number;
        autoRejectScore: number;
    };
    weights: {
        skillMatch: number;
        experienceMatch: number;
        educationMatch: number;
        cultureFit: number;
    };
    autoMatchingEnabled: boolean;
    aiEnabled: boolean;
    notifyOnStrongMatch: boolean;
}

const MatchingConfig = () => {
    const [config, setConfig] = useState<Config>({
        thresholds: {
            minimumMatchScore: 60,
            strongMatchScore: 80,
            autoRejectScore: 30
        },
        weights: {
            skillMatch: 0.4,
            experienceMatch: 0.3,
            educationMatch: 0.15,
            cultureFit: 0.15
        },
        autoMatchingEnabled: true,
        aiEnabled: true,
        notifyOnStrongMatch: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/org-admin/matching-config', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data) {
                setConfig(res.data);
            }
        } catch (err: any) {
            console.log('Using default config');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Validate weights sum to 1.0
        const totalWeight = Object.values(config.weights).reduce((sum, w) => sum + w, 0);
        if (Math.abs(totalWeight - 1.0) > 0.01) {
            setMessage('Error: Weights must sum to 100%');
            return;
        }

        setSaving(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/org-admin/matching-config', config, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Configuration saved successfully!');
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const updateThreshold = (key: keyof Config['thresholds'], value: number) => {
        setConfig({
            ...config,
            thresholds: {
                ...config.thresholds,
                [key]: value
            }
        });
    };

    const updateWeight = (key: keyof Config['weights'], value: number) => {
        setConfig({
            ...config,
            weights: {
                ...config.weights,
                [key]: value
            }
        });
    };

    const totalWeight = Object.values(config.weights).reduce((sum, w) => sum + w, 0);

    if (loading) return <div className="loading">Loading configuration...</div>;

    return (
        <div className="matching-config-container">
            <h2>Matching Configuration</h2>
            <p className="subtitle">Configure AI matching thresholds and weights</p>

            {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="config-section">
                <h3>Match Score Thresholds</h3>

                <div className="config-item">
                    <label>
                        Minimum Match Score
                        <span className="help-text">Candidates below this score won't be shown</span>
                    </label>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={config.thresholds.minimumMatchScore}
                            onChange={(e) => updateThreshold('minimumMatchScore', parseInt(e.target.value))}
                        />
                        <span className="value">{config.thresholds.minimumMatchScore}%</span>
                    </div>
                </div>

                <div className="config-item">
                    <label>
                        Strong Match Score
                        <span className="help-text">Candidates above this score are highlighted</span>
                    </label>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={config.thresholds.strongMatchScore}
                            onChange={(e) => updateThreshold('strongMatchScore', parseInt(e.target.value))}
                        />
                        <span className="value">{config.thresholds.strongMatchScore}%</span>
                    </div>
                </div>

                <div className="config-item">
                    <label>
                        Auto-Reject Score
                        <span className="help-text">Candidates below this score are auto-rejected</span>
                    </label>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={config.thresholds.autoRejectScore}
                            onChange={(e) => updateThreshold('autoRejectScore', parseInt(e.target.value))}
                        />
                        <span className="value">{config.thresholds.autoRejectScore}%</span>
                    </div>
                </div>
            </div>

            <div className="config-section">
                <h3>Matching Weights</h3>
                <p className="weight-total">Total: {(totalWeight * 100).toFixed(0)}% {totalWeight !== 1.0 && <span className="warning">(Must equal 100%)</span>}</p>

                <div className="config-item">
                    <label>Skills Match Weight</label>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={config.weights.skillMatch}
                            onChange={(e) => updateWeight('skillMatch', parseFloat(e.target.value))}
                        />
                        <span className="value">{(config.weights.skillMatch * 100).toFixed(0)}%</span>
                    </div>
                </div>

                <div className="config-item">
                    <label>Experience Match Weight</label>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={config.weights.experienceMatch}
                            onChange={(e) => updateWeight('experienceMatch', parseFloat(e.target.value))}
                        />
                        <span className="value">{(config.weights.experienceMatch * 100).toFixed(0)}%</span>
                    </div>
                </div>

                <div className="config-item">
                    <label>Education Match Weight</label>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={config.weights.educationMatch}
                            onChange={(e) => updateWeight('educationMatch', parseFloat(e.target.value))}
                        />
                        <span className="value">{(config.weights.educationMatch * 100).toFixed(0)}%</span>
                    </div>
                </div>

                <div className="config-item">
                    <label>Culture Fit Weight</label>
                    <div className="slider-container">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={config.weights.cultureFit}
                            onChange={(e) => updateWeight('cultureFit', parseFloat(e.target.value))}
                        />
                        <span className="value">{(config.weights.cultureFit * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            <div className="config-section">
                <h3>Automation Settings</h3>

                <div className="toggle-item">
                    <label>
                        <input
                            type="checkbox"
                            checked={config.autoMatchingEnabled}
                            onChange={(e) => setConfig({ ...config, autoMatchingEnabled: e.target.checked })}
                        />
                        Enable Auto-Matching
                    </label>
                    <span className="help-text">Automatically match new resumes with active jobs</span>
                </div>

                <div className="toggle-item">
                    <label>
                        <input
                            type="checkbox"
                            checked={config.aiEnabled}
                            onChange={(e) => setConfig({ ...config, aiEnabled: e.target.checked })}
                        />
                        Enable AI Analysis
                    </label>
                    <span className="help-text">Use AI for advanced matching and analysis</span>
                </div>

                <div className="toggle-item">
                    <label>
                        <input
                            type="checkbox"
                            checked={config.notifyOnStrongMatch}
                            onChange={(e) => setConfig({ ...config, notifyOnStrongMatch: e.target.checked })}
                        />
                        Notify on Strong Matches
                    </label>
                    <span className="help-text">Get notified when a strong match is found</span>
                </div>
            </div>

            <button
                className="save-btn"
                onClick={handleSave}
                disabled={saving || totalWeight !== 1.0}
            >
                {saving ? 'Saving...' : 'Save Configuration'}
            </button>
        </div>
    );
};

export default MatchingConfig;
