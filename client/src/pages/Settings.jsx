import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();

  const handleDeleteChats = () => {
    if (window.confirm('Are you sure you want to delete all chats? This cannot be undone.')) {
      localStorage.removeItem('chatMessages');
      navigate('/');
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: '#075e54', marginBottom: '30px' }}>Settings</h1>
      <button 
        onClick={handleDeleteChats}
        style={{
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          width: '200px'
        }}
      >
        Delete All Chats
      </button>
    </div>
  );
}