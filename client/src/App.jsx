// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Authenticator, ThemeProvider } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import DashboardPage from './pages/DashboardPage';
import { PlaidProvider } from './components/PlaidProvider';
import { signOut } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';
import { forceLogout, isSessionClosed, markSessionClosed, clearSessionMarkers } from './utils/sessionUtils';

const theme = {
  name: 'finance-app-theme',
  tokens: {
    components: {
      authenticator: {
        router: {
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        },
        form: {
          padding: '32px',
          backgroundColor: '#ffffff'
        }
      },
      button: {
        primary: {
          backgroundColor: '#4299e1',
          color: '#ffffff',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          padding: '12px 24px',
          border: 'none',
          _hover: {
            backgroundColor: '#3182ce',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(66, 153, 225, 0.3)'
          },
          _focus: {
            boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.3)'
          }
        },
        link: {
          color: '#4299e1',
          fontWeight: '500',
          _hover: {
            color: '#3182ce',
            textDecoration: 'underline'
          }
        }
      },
      fieldcontrol: {
        borderRadius: '8px',
        borderColor: '#e2e8f0',
        fontSize: '14px',
        padding: '12px',
        _focus: {
          borderColor: '#4299e1',
          boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)'
        }
      },
      tabs: {
        item: {
          color: '#718096',
          fontSize: '16px',
          fontWeight: '500',
          padding: '12px 24px',
          borderRadius: '8px 8px 0 0',
          _active: {
            color: '#4299e1',
            backgroundColor: '#f7fafc',
            borderBottom: '2px solid #4299e1'
          }
        }
      }
    },
    colors: {
      brand: {
        primary: {
          10: '#f7fafc',
          20: '#edf2f7',
          40: '#cbd5e0',
          60: '#4299e1',
          80: '#3182ce',
          90: '#2b6cb0',
          100: '#1a365d'
        }
      }
    },
    radii: {
      small: '8px',
      medium: '12px',
      large: '16px'
    }
  }
};

const customComponents = {
  Header() {
    return (
      <div style={{
        backgroundColor: '#1a365d',
        padding: '32px 0',
        color: 'white',
        textAlign: 'center',
        marginBottom: '0'
      }}>
        <div style={{
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          💰 FinanceTracker
        </div>
        <p style={{
          fontSize: '16px',
          color: '#a0aec0',
          margin: 0,
          fontWeight: '400'
        }}>
          Your personal finance management platform
        </p>
      </div>
    );
  },
  Footer() {
    return (
      <div style={{
        textAlign: 'center',
        padding: '24px',
        color: '#718096',
        fontSize: '14px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#f7fafc'
      }}>
        <p style={{ margin: 0 }}>
          Secure • Encrypted • Trusted by thousands of users
        </p>
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <span>🔒 Bank-level security</span>
          <span>📊 Real-time data</span>
          <span>🚀 Lightning fast</span>
        </div>
      </div>
    );
  }
};

export default function App() {
  const [shouldRenderAuth, setShouldRenderAuth] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  useEffect(() => {
    const checkSessionBeforeAuth = async () => {
      // Prevent multiple checks
      if (sessionChecked) return;
      
      console.log('Checking session before auth...');
      
      // Check if session was closed recently BEFORE initializing Authenticator
      if (isSessionClosed()) {
        console.log('Previous session was closed, clearing auth data...');
        await forceLogout();
        // Clear the session markers to prevent infinite loop
        clearSessionMarkers();
      } else {
        console.log('No closed session detected');
        // Clear any old session markers
        clearSessionMarkers();
      }
      
      // Mark session as checked and safe to render authenticator
      setSessionChecked(true);
      setShouldRenderAuth(true);
    };
    
    checkSessionBeforeAuth();
  }, [sessionChecked]);

  // Component to handle automatic logout on tab close
  const AutoLogoutHandler = () => {
    useEffect(() => {
      // Generate a unique session ID for this tab
      const sessionId = `session_${Date.now()}_${Math.random()}`;
      
      // Store session ID in sessionStorage (gets cleared when tab closes)
      sessionStorage.setItem('tabSessionId', sessionId);

      const handleBeforeUnload = () => {
        // Mark session as closed and clear Amplify data
        console.log('Tab closing, marking session as closed');
        markSessionClosed();
      };

      const handlePageHide = () => {
        // Handle mobile browsers and some desktop browsers
        console.log('Page hiding, marking session as closed');
        markSessionClosed();
      };

      // Add event listeners
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('pagehide', handlePageHide);

      // Cleanup function
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('pagehide', handlePageHide);
      };
    }, []);

    return null;
  };

  // Show loading while checking session
  if (!shouldRenderAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #4299e1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#2d3748', margin: 0 }}>Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <ThemeProvider theme={theme}>
        <Authenticator 
          signUpAttributes={['email']}
          components={customComponents}
          variation="modal"
          hideSignUp={false}
        >
          {({ signOut: amplifySignOut, user }) => (
            <>
              <AutoLogoutHandler />
              <PlaidProvider>
                <Router>
                  <Routes>
                    <Route
                      path="/dashboard"
                      element={<DashboardPage user={user} signOut={amplifySignOut} />}
                    />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </Router>
              </PlaidProvider>
            </>
          )}
        </Authenticator>
      </ThemeProvider>
    </div>
  );
}
