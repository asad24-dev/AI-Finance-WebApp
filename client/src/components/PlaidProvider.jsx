// src/components/PlaidProvider.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import api from '../services/api';

const PlaidContext = createContext();

export const usePlaid = () => {
  const context = useContext(PlaidContext);
  if (!context) {
    throw new Error('usePlaid must be used within a PlaidProvider');
  }
  return context;
};

export const PlaidProvider = ({ children }) => {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize once per app session
    if (initialized.current) return;
    
    const initializePlaid = async () => {
      try {
        console.log('Initializing Plaid Link...');
        const res = await api.get('/plaid/create-link-token');
        setLinkToken(res.data.link_token);
        setError(null);
        initialized.current = true;
        console.log('Plaid Link initialized successfully');
      } catch (err) {
        console.error('Error initializing Plaid:', err);
        setError('Failed to initialize Plaid Link');
      } finally {
        setLoading(false);
      }
    };

    initializePlaid();
  }, []);

  const value = {
    linkToken,
    loading,
    error,
    refreshToken: async () => {
      setLoading(true);
      try {
        const res = await api.get('/plaid/create-link-token');
        setLinkToken(res.data.link_token);
        setError(null);
      } catch (err) {
        console.error('Error refreshing Plaid token:', err);
        setError('Failed to refresh Plaid Link token');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <PlaidContext.Provider value={value}>
      {children}
    </PlaidContext.Provider>
  );
};
