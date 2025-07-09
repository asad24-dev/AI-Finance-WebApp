// src/components/PlaidLinkButton.jsx
import React, { useState, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { usePlaid } from './PlaidProvider';
import api from '../services/api';

const PlaidLinkButton = () => {
  const { linkToken, loading: tokenLoading, error: tokenError } = usePlaid();
  const [loading, setLoading] = useState(false);

  // Memoize the success handler to prevent unnecessary re-renders
  const onSuccess = useCallback(async (public_token, metadata) => {
    console.log('Public Token:', public_token);
    setLoading(true);
    
    try {
      await api.post('/plaid/exchange-public-token', { public_token });
      
      // Show success message with modern styling
      const successMessage = document.createElement('div');
      successMessage.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background-color: var(--success-color);
          color: white;
          padding: 16px 20px;
          border-radius: 8px;
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        ">
          ✅ Bank account linked successfully! Refreshing data...
        </div>
      `;
      document.body.appendChild(successMessage);
      
      // Remove message after 3 seconds and refresh page
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error('Error exchanging public token:', err);
      
      // Show error message with modern styling
      const errorMessage = document.createElement('div');
      errorMessage.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background-color: var(--danger-color);
          color: white;
          padding: 16px 20px;
          border-radius: 8px;
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        ">
          ❌ Failed to link bank account. Please try again.
        </div>
      `;
      document.body.appendChild(errorMessage);
      
      // Remove error message after 5 seconds
      setTimeout(() => {
        if (document.body.contains(errorMessage)) {
          document.body.removeChild(errorMessage);
        }
      }, 5000);
    } finally {
      setLoading(false);
    }
  }, []);

  const onExit = useCallback((err, metadata) => {
    if (err) {
      console.error('Plaid Link exited with error:', err);
    }
    setLoading(false);
  }, []);

  const config = {
    token: linkToken,
    onSuccess,
    onExit,
  };

  const { open, ready, error: linkError } = usePlaidLink(config);

  const handleClick = useCallback(() => {
    if (ready && !loading && !tokenLoading) {
      open();
    }
  }, [open, ready, loading, tokenLoading]);

  // Show error if there's a token error
  if (tokenError) {
    return (
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#fed7d7',
        color: '#c53030',
        borderRadius: '8px',
        fontSize: '14px',
        border: '1px solid #feb2b2'
      }}>
        {tokenError}
      </div>
    );
  }

  // Show error if there's a link error
  if (linkError) {
    return (
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#fed7d7',
        color: '#c53030',
        borderRadius: '8px',
        fontSize: '14px',
        border: '1px solid #feb2b2'
      }}>
        Failed to initialize Plaid Link. Please refresh the page.
      </div>
    );
  }

  const isDisabled = !ready || loading || tokenLoading || !linkToken;

  return (
    <button 
      onClick={handleClick}
      disabled={isDisabled}
      className="btn btn-primary"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        opacity: isDisabled ? 0.6 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer'
      }}
    >
      {loading ? (
        <>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Connecting...
        </>
      ) : tokenLoading ? (
        <>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Loading...
        </>
      ) : (
        <>
          <span style={{ fontSize: '16px' }}>🔗</span>
          Connect Bank Account
        </>
      )}
    </button>
  );
};

export default PlaidLinkButton;
