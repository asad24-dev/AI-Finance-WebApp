import React, { useState } from 'react';
import { Alert, ActivityIndicator, View, StyleSheet } from 'react-native';
import { create, open, usePlaidEmitter } from 'react-native-plaid-link-sdk';
import api from '../services/api';

const PlaidLinkButton = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const handlePlaidSuccess = async (data) => {
    try {
      console.log('Plaid Link success! Public token:', data.publicToken);
      setLoading(true);
      
      // Exchange public token with your backend
      const response = await api.post('/plaid/exchange-public-token', {
        public_token: data.publicToken
      });
      
      console.log('Token exchange successful:', response.data);
      
      if (onSuccess) onSuccess(response.data);
      Alert.alert('Success', 'Bank account connected successfully!');
      
    } catch (error) {
      console.error('Error exchanging public token:', error);
      Alert.alert('Error', 'Failed to complete bank connection');
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaidExit = (data) => {
    console.log('Plaid Link exit:', data);
    setLoading(false);
    
    if (data && data.error) {
      console.error('Plaid Link error:', data.error);
      Alert.alert('Connection Error', data.error.displayMessage || 'Failed to connect bank account');
    }
  };

  const handlePlaidEvent = (data) => {
    console.log('Plaid Link event:', data);
  };

  // Set up Plaid event listener
  usePlaidEmitter((event) => {
    console.log('Plaid Event received:', event.eventName);
    
    switch (event.eventName) {
      case 'onSuccess':
        handlePlaidSuccess(event.data);
        break;
      case 'onExit':
        handlePlaidExit(event.data);
        break;
      case 'onEvent':
        handlePlaidEvent(event.data);
        break;
      default:
        console.log('Unknown Plaid event:', event);
    }
  });

  const handlePlaidLink = async () => {
    console.log('Starting Plaid Link process...');
    setLoading(true);
    
    try {
      console.log('Getting Plaid link token from backend...');
      
      // Step 1: Get link token from your backend
      const response = await api.get('/plaid/create-link-token');
      const { link_token } = response.data;
      
      console.log('Link token received:', link_token);
      
      // Step 2: Create Plaid Link configuration
      console.log('Creating Plaid Link configuration...');
      create({
        token: link_token,
      });
      
      console.log('Plaid Link created, opening...');
      
      // Step 3: Open Plaid Link - remove loading here as it will be handled by events
      setTimeout(() => {
        try {
          open();
          console.log('Plaid Link opened successfully');
          setLoading(false); // Stop loading when Plaid interface opens
        } catch (openError) {
          console.error('Error opening Plaid Link:', openError);
          Alert.alert('Error', 'Failed to open bank connection interface');
          setLoading(false);
        }
      }, 500); // Small delay to ensure create() completes
      
    } catch (error) {
      console.error('Error in Plaid Link process:', error);
      Alert.alert('Error', 'Failed to initialize bank connection. Please check your authentication.');
      if (onError) onError(error);
      setLoading(false);
    }
  };

  return {
    handlePlaidLink,
    loading,
    PlaidLinkComponent: () => (
      <View>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00d4aa" />
          </View>
        )}
      </View>
    )
  };
};

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 1000,
  },
});

export default PlaidLinkButton;
