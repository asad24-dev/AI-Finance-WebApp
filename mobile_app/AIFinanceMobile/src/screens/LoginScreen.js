import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signIn, signUp, confirmSignUp } from '../services/auth';

const LoginScreen = ({ navigation, onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      
      console.log('=== SIMPLE SIGNIN ===');
      console.log('Email:', trimmedEmail);
      console.log('Using simple Cognito authentication');
      
      const result = await signIn(trimmedEmail, password);
      console.log('Sign in successful:', result);
      onAuthenticated(result);
    } catch (error) {
      console.error('=== SIGNIN ERROR ===');
      console.error('Error:', error);
      
      if (error.code === 'NotAuthorizedException') {
        Alert.alert('Sign In Failed', 'Incorrect email or password.');
      } else if (error.code === 'UserNotFoundException') {
        Alert.alert('User Not Found', 'No account found with this email address.');
      } else if (error.code === 'UserNotConfirmedException') {
        Alert.alert('Account Not Confirmed', 'Please confirm your account via email first.');
      } else {
        Alert.alert('Sign In Error', error.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      
      console.log('=== SIMPLE SIGNUP ===');
      console.log('Email:', trimmedEmail);
      console.log('Using simple Cognito signup');
      
      const result = await signUp(trimmedEmail, password);
      console.log('Sign up successful:', result);
      
      setEmail(trimmedEmail);
      setShowConfirmation(true);
      Alert.alert('Success', `Please check your email (${trimmedEmail}) for confirmation code`);
    } catch (error) {
      console.error('Error signing up:', error);
      
      if (error.code === 'UsernameExistsException') {
        Alert.alert('Account Exists', 'An account with this email already exists. Try signing in instead.');
        setIsLogin(true);
      } else {
        Alert.alert('Sign Up Error', error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async () => {
    if (!confirmationCode) {
      Alert.alert('Error', 'Please enter confirmation code');
      return;
    }

    setLoading(true);
    try {
      console.log('=== SIMPLE CONFIRMATION ===');
      console.log('Email:', email);
      console.log('Code:', confirmationCode);
      console.log('Using simple Cognito confirmation');
      
      const result = await confirmSignUp(email, confirmationCode);
      console.log('Confirmation successful:', result);
      
      Alert.alert('Success', 'Account confirmed! Please sign in.', [
        {
          text: 'OK',
          onPress: () => {
            setShowConfirmation(false);
            setIsLogin(true);
            setConfirmationCode('');
          }
        }
      ]);
    } catch (error) {
      console.error('Error confirming sign up:', error);
      
      if (error.code === 'CodeMismatchException') {
        Alert.alert('Invalid Code', 'The confirmation code is incorrect. Please try again.');
      } else if (error.code === 'ExpiredCodeException') {
        Alert.alert('Code Expired', 'The confirmation code has expired. Please request a new one.');
      } else {
        Alert.alert('Confirmation Error', error.message || 'Failed to confirm account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    // For now, just show a message
    Alert.alert('Info', 'Please check your email for the confirmation code, or try signing up again if needed.');
  };

  if (showConfirmation) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.contentContainer}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>💰</Text>
              <Text style={styles.appName}>AI Finance</Text>
              <Text style={styles.subtitle}>Confirm Your Account</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.instructionText}>
                We've sent a confirmation code to {email}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Confirmation Code"
                value={confirmationCode}
                onChangeText={setConfirmationCode}
                keyboardType="number-pad"
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.disabledButton]}
                onPress={handleConfirmSignUp}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Confirming...' : 'Confirm Account'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={handleResendCode}
              >
                <Text style={styles.linkText}>Resend Code</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => {
                  setShowConfirmation(false);
                  setIsLogin(true);
                }}
              >
                <Text style={styles.linkText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>💰</Text>
            <Text style={styles.appName}>AI Finance</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            )}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={isLogin ? handleSignIn : handleSignUp}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading 
                  ? (isLogin ? 'Signing in...' : 'Creating account...') 
                  : (isLogin ? 'Sign In' : 'Create Account')
                }
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.linkText}>
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  formContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  instructionText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
    marginBottom: 8,
  },
});

export default LoginScreen;
