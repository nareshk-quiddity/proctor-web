import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import '../styles/UserList.css';

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
    status?: string;
    createdAt: string;
}

const UserList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { getAllUsers, deleteUser, updateUser, user } = useAuth();

    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({ username: '', email: '', role: '', status: '' });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    const isSuperAdmin = user?.role === 'super_admin';

    const fetchUsers = async () => {
        setLoading(true);
        const res = await getAllUsers();
        setLoading(false);

        if (res.success && res.users) {
            let filteredUsers = res.users;
            if (!isSuperAdmin) {
                filteredUsers = res.users.filter((u: User) =>
                    u.role === 'recruiter' || u.role === 'candidate'
                );
            }
            setUsers(filteredUsers);
        } else {
            setError(res.message || 'Failed to fetch users');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (userId: string, username: string) => {
        if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
            return;
        }
        const res = await deleteUser(userId);
        if (res.success) {
            setUsers(users.filter(u => u._id !== userId));
        } else {
            alert(res.message || 'Failed to delete user');
        }
    };

    const openEditModal = (userToEdit: User) => {
        setEditingUser(userToEdit);
        setEditForm({
            username: userToEdit.username,
            email: userToEdit.email,
            role: userToEdit.role,
            status: userToEdit.status || 'active'
        });
        setEditError('');
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditingUser(null);
        setEditError('');
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setEditLoading(true);
        setEditError('');

        const res = await updateUser(editingUser._id, editForm);
        setEditLoading(false);

        if (res.success) {
            setUsers(users.map(u =>
                u._id === editingUser._id
                    ? { ...u, ...editForm }
                    : u
            ));
            closeEditModal();
        } else {
            setEditError(res.message || 'Failed to update user');
        }
    };

    if (loading) {
        return (
            <div className="user-list-container">
                <div className="loading">Loading users...</div>
            </div>
        );
    }

    return (
        <div className="user-list-container">
            <div className="user-list-header">
                <h1>
                    User Management
                    <span className="header-count">
                        👥 {users.length}
                    </span>
                </h1>
                <Link to="/admin/users/create" className="create-user-btn">
                    + Create New User
                </Link>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="user-table-wrapper">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id}>
                                <td>{u.username}</td>
                                <td>{u.email}</td>
                                <td>
                                    <span className={`role-badge ${u.role}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${u.status || 'active'}`}>
                                        {u.status || 'active'}
                                    </span>
                                </td>
                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td className="actions-cell">
                                    <button
                                        onClick={() => openEditModal(u)}
                                        className="edit-btn"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(u._id, u.username)}
                                        className="delete-btn"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="no-users">
                        No users found. <Link to="/admin/users/create">Create one now</Link>
                    </div>
                )}
            </div>

            {/* Edit User Modal */}
            {editModalOpen && editingUser && (
                <div className="modal-overlay" onClick={closeEditModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit User</h2>
                            <button className="modal-close" onClick={closeEditModal}>&times;</button>
                        </div>

                        {editError && <div className="modal-error">{editError}</div>}

                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={editForm.username}
                                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={editForm.role}
                                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                >
                                    {isSuperAdmin && (
                                        <>
                                            <option value="super_admin">Super Admin</option>
                                            <option value="customer_admin">Customer Admin</option>
                                        </>
                                    )}
                                    <option value="recruiter">Recruiter</option>
                                    <option value="candidate">Candidate</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={editForm.status}
                                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={closeEditModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn" disabled={editLoading}>
                                    {editLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
