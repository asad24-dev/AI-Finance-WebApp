// Simple direct AWS Cognito authentication - no complex Amplify setup
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const poolData = {
  UserPoolId: 'ap-southeast-2_b7ouuqkHr',
  ClientId: '59lgthmmkjqcda7ektkb54mt2n'
};

const userPool = new CognitoUserPool(poolData);

// Store auth tokens
const storeTokens = async (session) => {
  try {
    const tokens = {
      idToken: session.getIdToken().getJwtToken(),
      accessToken: session.getAccessToken().getJwtToken(),
      refreshToken: session.getRefreshToken().getToken(),
    };
    await AsyncStorage.setItem('authTokens', JSON.stringify(tokens));
    console.log('Tokens stored successfully');
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

// Get stored tokens
export const getStoredTokens = async () => {
  try {
    const tokens = await AsyncStorage.getItem('authTokens');
    return tokens ? JSON.parse(tokens) : null;
  } catch (error) {
    console.error('Error getting stored tokens:', error);
    return null;
  }
};

// Clear stored tokens
export const clearStoredTokens = async () => {
  try {
    await AsyncStorage.removeItem('authTokens');
    console.log('Tokens cleared');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

export const signIn = (email, password) => {
  return new Promise((resolve, reject) => {
    const authenticationData = {
      Username: email,
      Password: password,
    };
    
    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const userData = {
      Username: email,
      Pool: userPool,
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: async (session) => {
        console.log('Authentication successful');
        await storeTokens(session);
        resolve({
          user: cognitoUser,
          session: session,
          idToken: session.getIdToken().getJwtToken()
        });
      },
      onFailure: (err) => {
        console.error('Authentication failed:', err);
        reject(err);
      },
    });
  });
};

export const signUp = (email, password) => {
  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, [], null, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

export const confirmSignUp = (email, code) => {
  return new Promise((resolve, reject) => {
    const userData = {
      Username: email,
      Pool: userPool,
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};
