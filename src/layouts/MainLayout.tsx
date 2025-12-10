import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="dashboard-layout" style={{ display: 'flex' }}>
            <Sidebar isOpen={isSidebarOpen} />
            <div className="main-content" style={{
                flex: 1,
                marginLeft: isSidebarOpen ? '260px' : '0',
                transition: 'margin-left 0.3s ease',
                minHeight: '100vh',
                background: '#f8fafc',
                position: 'relative'
            }}>
                <button
                    onClick={toggleSidebar}
                    style={{
                        position: 'fixed',
                        top: '1rem',
                        left: isSidebarOpen ? '270px' : '20px',
                        zIndex: 1001,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        padding: '0.5rem',
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        color: '#64748b',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        transition: 'left 0.3s ease'
                    }}
                    title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                >
                    ☰
                </button>
                <div style={{ paddingTop: '1rem' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
