// src/components/SessionManager.jsx
import { useEffect, useRef } from 'react';
import { signOut } from 'aws-amplify/auth';

const SessionManager = ({ user }) => {
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  
  // Session timeout settings (in milliseconds)
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 25 * 60 * 1000; // Show warning at 25 minutes
  
  const resetTimeout = () => {
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    
    // Set warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      showSessionWarning();
    }, WARNING_TIME);
    
    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      handleSessionTimeout();
    }, SESSION_TIMEOUT);
  };
  
  const showSessionWarning = () => {
    const warningDiv = document.createElement('div');
    warningDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      ">
        <div style="
          background-color: white;
          color: #2d3748;
          padding: 32px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          text-align: center;
          max-width: 400px;
          width: 90%;
        ">
          <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
          <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
            Session Expiring Soon
          </h3>
          <p style="margin: 0 0 24px 0; color: #718096; line-height: 1.5;">
            For your security, you'll be automatically logged out in 5 minutes due to inactivity.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button onclick="extendSession()" style="
              background-color: #4299e1;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              font-size: 14px;
            ">
              Stay Logged In
            </button>
            <button onclick="logoutNow()" style="
              background-color: #e53e3e;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              font-size: 14px;
            ">
              Logout Now
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add global functions for the buttons
    window.extendSession = () => {
      document.body.removeChild(warningDiv);
      resetTimeout(); // Reset the session timeout
    };
    
    window.logoutNow = async () => {
      document.body.removeChild(warningDiv);
      await handleSessionTimeout();
    };
    
    document.body.appendChild(warningDiv);
    
    // Auto-remove warning after 5 minutes if no action taken
    setTimeout(() => {
      if (document.body.contains(warningDiv)) {
        document.body.removeChild(warningDiv);
      }
    }, 5 * 60 * 1000);
  };
  
  const handleSessionTimeout = async () => {
    try {
      // Show logout message
      const logoutDiv = document.createElement('div');
      logoutDiv.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background-color: #e53e3e;
          color: white;
          padding: 16px 20px;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          z-index: 10001;
          font-weight: 500;
        ">
          🔒 Session expired. Logging out for security...
        </div>
      `;
      document.body.appendChild(logoutDiv);
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out user
      await signOut();
      
      // Remove logout message after sign out
      setTimeout(() => {
        if (document.body.contains(logoutDiv)) {
          document.body.removeChild(logoutDiv);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error during session timeout:', error);
      // Force reload to clear any cached state
      window.location.reload();
    }
  };
  
  useEffect(() => {
    if (!user) return;
    
    // Activity events to reset timeout
    const activityEvents = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];
    
    const handleActivity = () => {
      resetTimeout();
    };
    
    // Add event listeners for user activity
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });
    
    // Initialize timeout
    resetTimeout();
    
    // Cleanup function
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      // Clean up global functions
      delete window.extendSession;
      delete window.logoutNow;
    };
  }, [user]);
  
  return null; // This component doesn't render anything
};

export default SessionManager;
