import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/NotificationPanel.css';

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}

const NotificationPanel = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` },
                params: { limit: 10 }
            });
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/notifications/unread-count', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error('Failed to fetch unread count');
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `/api/notifications/${notificationId}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchNotifications();
            fetchUnreadCount();
        } catch (err) {
            console.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                '/api/notifications/read-all',
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchNotifications();
            fetchUnreadCount();
        } catch (err) {
            console.error('Failed to mark all as read');
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
            fetchUnreadCount();
        } catch (err) {
            console.error('Failed to delete notification');
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'match': return '🎯';
            case 'interview': return '📝';
            case 'resume': return '📄';
            case 'system': return '⚙️';
            default: return '🔔';
        }
    };

    const getTimeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className="notification-container">
            <button
                className="notification-bell"
                onClick={() => setIsOpen(!isOpen)}
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="notification-overlay" onClick={() => setIsOpen(false)} />
                    <div className="notification-panel">
                        <div className="notification-header">
                            <h3>Notifications</h3>
                            {notifications.length > 0 && (
                                <button onClick={handleMarkAllAsRead} className="mark-all-read">
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="notification-list">
                            {loading ? (
                                <div className="notification-loading">Loading...</div>
                            ) : notifications.length === 0 ? (
                                <div className="notification-empty">
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif._id}
                                        className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                    >
                                        <div className="notification-icon">
                                            {getNotificationIcon(notif.type)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-title">{notif.title}</div>
                                            <div className="notification-message">{notif.message}</div>
                                            <div className="notification-time">{getTimeAgo(notif.createdAt)}</div>
                                        </div>
                                        <div className="notification-actions">
                                            {!notif.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notif._id)}
                                                    className="btn-mark-read"
                                                    title="Mark as read"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(notif._id)}
                                                className="btn-delete"
                                                title="Delete"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        {notif.link && (
                                            <Link
                                                to={notif.link}
                                                className="notification-link"
                                                onClick={() => {
                                                    handleMarkAsRead(notif._id);
                                                    setIsOpen(false);
                                                }}
                                            >
                                                View →
                                            </Link>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationPanel;
