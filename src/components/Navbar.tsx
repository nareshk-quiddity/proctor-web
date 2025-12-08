import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav style={{
            padding: '1rem 2rem',
            background: '#333',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div>
                <Link to="/" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none' }}>Home</Link>
                {user?.role === 'recruiter' && (
                    <>
                        <Link to="/recruiter-dashboard" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none', fontWeight: 'bold' }}>Recruiter Dashboard</Link>
                        <Link to="/resumes" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none' }}>Resumes</Link>
                        <Link to="/jobs" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none' }}>Jobs</Link>
                    </>
                )}
                {user?.role === 'super_admin' && (
                    <>
                        <Link to="/super-admin/dashboard" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none', fontWeight: 'bold' }}>Dashboard</Link>
                        <Link to="/admin/users" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none' }}>Manage Users</Link>
                    </>
                )}
                {user?.role === 'customer_admin' && (
                    <>
                        <Link to="/customer-admin/dashboard" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none', fontWeight: 'bold' }}>Dashboard</Link>
                        <Link to="/admin/users" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none' }}>Manage Users</Link>
                    </>
                )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user && <NotificationPanel />}
                {user ? (
                    <button onClick={logout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Logout</button>
                ) : (
                    <>
                        <Link to="/login" style={{ color: 'white', marginRight: '1rem', textDecoration: 'none' }}>Login</Link>
                        <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
