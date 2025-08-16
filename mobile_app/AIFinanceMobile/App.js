import React, { useState, useEffect } from 'react';
import { StatusBar, Platform, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AccountsScreen from './src/screens/AccountsScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import BudgetsScreen from './src/screens/BudgetsScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import LoadingScreen from './src/screens/LoadingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator Component
const TabNavigator = ({ onSignOut }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Accounts') {
            iconName = 'account-balance';
          } else if (route.name === 'Transactions') {
            iconName = 'receipt-long';
          } else if (route.name === 'Budgets') {
            iconName = 'account-balance-wallet';
          } else if (route.name === 'Insights') {
            iconName = 'analytics';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        children={(props) => <DashboardScreen {...props} onSignOut={onSignOut} />}
      />
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Budgets" component={BudgetsScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
    </Tab.Navigator>
  );
};

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      // Check if we have stored tokens
      const { getStoredTokens } = await import('./src/services/auth');
      const tokens = await getStoredTokens();
      
      if (tokens && tokens.idToken) {
        console.log('Found stored auth tokens');
        setIsAuthenticated(true);
      } else {
        console.log('No stored auth tokens found');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.warn('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign in
  const handleSignIn = () => {
    setIsAuthenticated(true);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { clearStoredTokens } = await import('./src/services/auth');
      await clearStoredTokens();
      console.log('User signed out');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Initializing app..." />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="Main">
              {(props) => <TabNavigator {...props} onSignOut={handleSignOut} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onAuthenticated={handleSignIn} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
