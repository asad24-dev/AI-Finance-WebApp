import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import api from '../services/api';
import MetricsCards from '../components/MetricsCards';
import QuickActions from '../components/QuickActions';
import RecentTransactions from '../components/RecentTransactions';
import LoadingScreen from './LoadingScreen';

const DashboardScreen = ({ navigation, onSignOut }) => {
  const [dashboardData, setDashboardData] = useState({
    accounts: [],
    transactions: [],
    spendingData: [],
    budgets: [],
    insights: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUserProfile(currentUser);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [
        accountsResponse,
        transactionsResponse,
        spendingResponse,
        budgetsResponse,
        insightsResponse
      ] = await Promise.all([
        api.get('/accounts').catch(() => ({ data: { accounts: [] } })),
        api.get('/transactions').catch(() => ({ data: { transactions: [] } })),
        api.get('/spending/categories').catch(() => ({ data: { categories: [] } })),
        api.get('/budget').catch(() => ({ data: { budgets: [] } })),
        api.get('/insights').catch(() => ({ data: { insights: [] } }))
      ]);

      setDashboardData({
        accounts: accountsResponse.data.accounts || [],
        transactions: transactionsResponse.data.transactions || [],
        spendingData: spendingResponse.data.categories || [],
        budgets: budgetsResponse.data.budgets || [],
        insights: insightsResponse.data.insights || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  // Calculate dashboard metrics
  const calculateMetrics = () => {
    const { accounts, transactions, budgets } = dashboardData;
    
    const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
    const monthlySpending = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        const now = new Date();
        return transactionDate.getMonth() === now.getMonth() && 
               transactionDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
    
    const totalBudget = budgets.reduce((sum, budget) => sum + (budget.limit || 0), 0);
    const budgetUsed = budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
    const budgetRemaining = totalBudget - budgetUsed;

    return {
      totalBalance,
      monthlySpending,
      totalBudget,
      budgetUsed,
      budgetRemaining,
      budgetUtilization: totalBudget > 0 ? (budgetUsed / totalBudget) * 100 : 0
    };
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              onSignOut();
            } catch (error) {
              console.error('Error signing out:', error);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchUserProfile();
      await fetchDashboardData();
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  const metrics = calculateMetrics();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome back, {userProfile?.username || 'User'}!
            </Text>
            <Text style={styles.subtitle}>
              Here's your financial overview
            </Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Metrics Cards */}
        <MetricsCards metrics={metrics} />

        {/* Quick Actions */}
        <QuickActions 
          navigation={navigation}
          onRefresh={refreshData}
        />

        {/* Recent Transactions */}
        <RecentTransactions 
          transactions={dashboardData.transactions.slice(0, 5)}
          onViewAll={() => navigation.navigate('Transactions')}
        />

        {/* Budget Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Budget Overview</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Budgets')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {dashboardData.budgets.length > 0 ? (
            <View style={styles.budgetPreview}>
              {dashboardData.budgets.slice(0, 3).map(budget => (
                <View key={budget.id} style={styles.budgetItem}>
                  <View style={styles.budgetInfo}>
                    <Text style={styles.budgetCategory}>{budget.category}</Text>
                    <Text style={styles.budgetAmount}>
                      ${(budget.spent || 0).toFixed(2)} / ${budget.limit.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.budgetBar}>
                    <View 
                      style={[
                        styles.budgetProgress,
                        {
                          width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%`,
                          backgroundColor: (budget.spent / budget.limit) > 0.9 
                            ? '#ef4444' 
                            : '#10b981'
                        }
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No budgets created yet</Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Budgets')}
                style={styles.createBudgetButton}
              >
                <Text style={styles.createBudgetText}>Create Your First Budget</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Insights Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Insights</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Insights')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {dashboardData.insights.length > 0 ? (
            <View style={styles.insightsPreview}>
              {dashboardData.insights.slice(0, 2).map(insight => (
                <View key={insight.id} style={styles.insightItem}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightDescription} numberOfLines={2}>
                    {insight.description}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No insights available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  signOutText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  viewAllText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  budgetPreview: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetItem: {
    marginBottom: 12,
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  budgetAmount: {
    fontSize: 14,
    color: '#64748b',
  },
  budgetBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  budgetProgress: {
    height: 4,
    borderRadius: 2,
  },
  insightsPreview: {
    gap: 12,
  },
  insightItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 12,
  },
  createBudgetButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createBudgetText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default DashboardScreen;
