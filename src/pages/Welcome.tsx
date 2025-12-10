import React from 'react';

const Welcome = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
            flexDirection: 'column'
        }}>
            <h1 style={{ fontSize: '3rem', color: '#333' }}>Welcome Quidhire</h1>
            <p style={{ marginTop: '1rem', color: '#666' }}>Select an option from the sidebar to get started</p>
        </div>
    );
};

export default Welcome;
