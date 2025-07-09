export const clearAllAmplifyData = () => {
  try {
    // Clear all localStorage keys that Amplify uses
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('aws-amplify') ||
        key.startsWith('amplify') ||
        key.startsWith('CognitoIdentityServiceProvider') ||
        key.includes('idToken') ||
        key.includes('accessToken') ||
        key.includes('refreshToken') ||
        key.includes('clockDrift') ||
        key.includes('userData')
      )) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all Amplify-related keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage completely
    sessionStorage.clear();
    
    console.log('Cleared Amplify authentication data');
  } catch (error) {
    console.error('Error clearing Amplify data:', error);
  }
};

export const forceLogout = async () => {
  console.log('Force logout initiated');
  
  // Clear storage - this is the most important part
  clearAllAmplifyData();
  
  // Clear session markers to prevent loops
  localStorage.removeItem('sessionClosed');
  localStorage.removeItem('sessionClosedTime');
  
  console.log('Force logout completed - auth data cleared');
};

export const isSessionClosed = () => {
  const sessionClosed = localStorage.getItem('sessionClosed');
  const sessionClosedTime = localStorage.getItem('sessionClosedTime');
  const tabSessionId = sessionStorage.getItem('tabSessionId');
  
  // Only consider session closed if:
  // 1. Session was marked as closed
  // 2. No current tab session ID (indicating a new tab/page load)  
  // 3. Session was closed recently (within last 30 seconds)
  if (sessionClosed === 'true' && !tabSessionId && sessionClosedTime) {
    const closedTime = parseInt(sessionClosedTime);
    const now = Date.now();
    const timeDiff = now - closedTime;
    
    console.log(`Session check: closed=${sessionClosed}, timeDiff=${timeDiff}ms, hasTabId=${!!tabSessionId}`);
    
    // Return true if session was closed within last 30 seconds
    return timeDiff < 30000; // 30 seconds - shorter window to prevent issues
  }
  
  return false;
};

export const markSessionClosed = () => {
  console.log('Marking session as closed');
  localStorage.setItem('sessionClosed', 'true');
  localStorage.setItem('sessionClosedTime', Date.now().toString());
  clearAllAmplifyData();
};

export const clearSessionMarkers = () => {
  console.log('Clearing session markers');
  localStorage.removeItem('sessionClosed');
  localStorage.removeItem('sessionClosedTime');
};
