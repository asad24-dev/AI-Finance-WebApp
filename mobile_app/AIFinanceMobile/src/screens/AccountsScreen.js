import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../services/api';
import PlaidLinkButton from '../components/PlaidLinkButton';
import LoadingScreen from './LoadingScreen';

const AccountsScreen = ({ navigation }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Initialize Plaid Link Button
  const plaidLink = PlaidLinkButton({
    onSuccess: (data) => {
      console.log('Plaid Link Success:', data);
      // Refresh accounts after successful link
      fetchAccounts();
    },
    onError: (error) => {
      console.error('Plaid Link Error:', error);
    }
  });

  // Fetch accounts data
  const fetchAccounts = async () => {
    try {
      console.log('Fetching accounts from backend...');
      const response = await api.get('/plaid/accounts');
      console.log('Accounts response:', response.data);
      setAccounts(response.data.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Please sign in again');
      } else {
        Alert.alert('Error', 'Failed to load accounts');
      }
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await fetchAccounts();
    setRefreshing(false);
  };

  // Handle add account
  const handleAddAccount = () => {
    console.log('Add account button pressed');
    plaidLink.handlePlaidLink();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  // Get account type icon
  const getAccountIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'checking':
        return 'account-balance-wallet';
      case 'savings':
        return 'savings';
      case 'credit':
        return 'credit-card';
      case 'investment':
        return 'trending-up';
      default:
        return 'account-balance';
    }
  };

  // Get account type color
  const getAccountColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'checking':
        return '#2563eb';
      case 'savings':
        return '#10b981';
      case 'credit':
        return '#ef4444';
      case 'investment':
        return '#8b5cf6';
      default:
        return '#64748b';
    }
  };

  // Render account item
  const renderAccount = ({ item }) => (
    <TouchableOpacity 
      style={styles.accountItem}
      onPress={() => {
        // Navigate to account details or transactions
        navigation.navigate('Transactions', { accountId: item.account_id });
      }}
    >
      <View style={styles.accountInfo}>
        <View style={[
          styles.accountIcon,
          { backgroundColor: getAccountColor(item.type) }
        ]}>
          <Icon 
            name={getAccountIcon(item.type)} 
            size={24} 
            color="white" 
          />
        </View>
        <View style={styles.accountDetails}>
          <Text style={styles.accountName}>{item.name}</Text>
          <Text style={styles.accountType}>
            {item.subtype || item.type} • •••• {item.mask || '0000'}
          </Text>
          <Text style={styles.institutionName}>{item.institution_name}</Text>
        </View>
      </View>
      <View style={styles.accountBalance}>
        <Text style={[
          styles.balanceAmount,
          {
            color: item.type === 'credit' && item.balance > 0 
              ? '#ef4444' 
              : '#1e293b'
          }
        ]}>
          {formatCurrency(item.balance)}
        </Text>
        {item.type === 'credit' && (
          <Text style={styles.availableCredit}>
            Available: {formatCurrency(item.available || 0)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    const loadData = async () => {
      await fetchAccounts();
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading accounts..." />;
  }

  const totalBalance = accounts.reduce((sum, account) => {
    if (account.type === 'credit') {
      return sum - (account.balance || 0); // Credit balances are debt
    }
    return sum + (account.balance || 0);
  }, 0);

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
          <Text style={styles.title}>My Accounts</Text>
          <TouchableOpacity onPress={handleAddAccount} style={styles.addButton}>
            <Icon name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Total Balance Card */}
        <View style={styles.totalBalanceCard}>
          <Text style={styles.totalBalanceLabel}>Total Net Worth</Text>
          <Text style={styles.totalBalanceAmount}>
            {formatCurrency(totalBalance)}
          </Text>
          <Text style={styles.totalBalanceSubtext}>
            Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Accounts List */}
        {accounts.length > 0 ? (
          <View style={styles.accountsList}>
            <FlatList
              data={accounts}
              renderItem={renderAccount}
              keyExtractor={(item) => item.account_id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="account-balance" size={64} color="#e2e8f0" />
            <Text style={styles.emptyStateTitle}>No Accounts Connected</Text>
            <Text style={styles.emptyStateText}>
              Connect your bank accounts to see your financial overview
            </Text>
            <TouchableOpacity onPress={handleAddAccount} style={styles.connectButton}>
              <Text style={styles.connectButtonText}>Connect Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Account Types Summary */}
        {accounts.length > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Account Summary</Text>
            <View style={styles.summaryGrid}>
              {['checking', 'savings', 'credit', 'investment'].map(type => {
                const typeAccounts = accounts.filter(acc => acc.type?.toLowerCase() === type);
                if (typeAccounts.length === 0) return null;
                
                const typeBalance = typeAccounts.reduce((sum, acc) => {
                  return type === 'credit' 
                    ? sum + (acc.balance || 0) // Credit shows as debt
                    : sum + (acc.balance || 0);
                }, 0);

                return (
                  <View key={type} style={styles.summaryItem}>
                    <View style={[
                      styles.summaryIcon,
                      { backgroundColor: getAccountColor(type) }
                    ]}>
                      <Icon 
                        name={getAccountIcon(type)} 
                        size={20} 
                        color="white" 
                      />
                    </View>
                    <Text style={styles.summaryType}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                    <Text style={styles.summaryAmount}>
                      {formatCurrency(typeBalance)}
                    </Text>
                    <Text style={styles.summaryCount}>
                      {typeAccounts.length} account{typeAccounts.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Plaid Native Component */}
      <plaidLink.PlaidLinkComponent />
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
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalBalanceCard: {
    backgroundColor: '#2563eb',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalBalanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  totalBalanceAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  totalBalanceSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  accountsList: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  accountItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  accountType: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  institutionName: {
    fontSize: 12,
    color: '#64748b',
  },
  accountBalance: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  availableCredit: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  emptyState: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 48,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  connectButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  summarySection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  summaryCount: {
    fontSize: 10,
    color: '#64748b',
  },
});

export default AccountsScreen;
