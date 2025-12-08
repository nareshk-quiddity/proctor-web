import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

interface User {
    token: string;
    role: string;
    userId: string;
}

interface AuthResponse {
    success: boolean;
    message?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<AuthResponse>;
    register: (username: string, email: string, password: string, role?: string) => Promise<AuthResponse>;
    logout: () => void;
    createUser: (userData: { username: string; email: string; password: string; role: string }) => Promise<AuthResponse>;
    getAllUsers: () => Promise<{ success: boolean; users?: any[]; message?: string }>;
    deleteUser: (userId: string) => Promise<AuthResponse>;
    updateUser: (userId: string, userData: { username?: string; email?: string; role?: string; status?: string }) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const userId = localStorage.getItem('userId');
        if (token && role && userId) {
            setUser({ token, role, userId });
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<AuthResponse> => {
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('userId', res.data.userId);
            setUser({ token: res.data.token, role: res.data.role, userId: res.data.userId });
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (username: string, email: string, password: string, role: string = 'candidate'): Promise<AuthResponse> => {
        try {
            await axios.post('/api/auth/register', { username, email, password, role });
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        setUser(null);
    };

    const createUser = async (userData: { username: string; email: string; password: string; role: string; organizationId?: string }): Promise<AuthResponse> => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/admin/users', userData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'User creation failed' };
        }
    };

    const getAllUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return { success: true, users: res.data };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to fetch users' };
        }
    };

    const deleteUser = async (userId: string): Promise<AuthResponse> => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to delete user' };
        }
    };

    const updateUser = async (userId: string, userData: { username?: string; email?: string; role?: string; status?: string }): Promise<AuthResponse> => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/users/${userId}`, userData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Failed to update user' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, createUser, getAllUsers, deleteUser, updateUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
