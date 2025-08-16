import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../services/api';
import LoadingScreen from './LoadingScreen';

const TransactionsScreen = ({ navigation, route }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('30'); // days

  const { accountId } = route.params || {};

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const endpoint = accountId 
        ? `/transactions?account_id=${accountId}`
        : '/transactions';
      const response = await api.get(endpoint);
      const transactionsData = response.data.transactions || [];
      setTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Alert.alert('Error', 'Failed to load transactions');
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  // Filter transactions
  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        (transaction.name || transaction.merchant_name || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(transaction =>
        transaction.category && 
        transaction.category[0]?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= cutoffDate;
      });
    }

    setFilteredTransactions(filtered);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount || 0));
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const categoryName = category?.[0]?.toLowerCase();
    switch (categoryName) {
      case 'food and drink':
      case 'restaurants':
        return 'restaurant';
      case 'shops':
      case 'retail':
        return 'shopping-cart';
      case 'transportation':
        return 'directions-car';
      case 'entertainment':
        return 'movie';
      case 'healthcare':
        return 'local-hospital';
      case 'transfer':
        return 'swap-horiz';
      default:
        return 'receipt';
    }
  };

  // Render transaction item
  const renderTransaction = ({ item }) => (
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Icon 
          name={getCategoryIcon(item.category)} 
          size={24} 
          color="#64748b" 
        />
      </View>
      
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionName} numberOfLines={1}>
          {item.name || item.merchant_name || 'Transaction'}
        </Text>
        <Text style={styles.transactionCategory}>
          {item.category?.[0] || 'Other'} • {formatDate(item.date)}
        </Text>
        {item.account_name && (
          <Text style={styles.accountName}>{item.account_name}</Text>
        )}
      </View>
      
      <View style={styles.transactionAmount}>
        <Text
          style={[
            styles.amountText,
            {
              color: item.amount > 0 ? '#ef4444' : '#10b981',
            },
          ]}
        >
          {item.amount > 0 ? '-' : '+'}{formatCurrency(item.amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    const loadData = async () => {
      await fetchTransactions();
      setLoading(false);
    };
    loadData();
  }, [accountId]);

  useEffect(() => {
    filterTransactions();
  }, [searchQuery, selectedCategory, dateRange, transactions]);

  if (loading) {
    return <LoadingScreen message="Loading transactions..." />;
  }

  const categories = ['all', 'food and drink', 'shops', 'transportation', 'entertainment', 'healthcare'];
  const dateRanges = [
    { label: '30 Days', value: '30' },
    { label: '90 Days', value: '90' },
    { label: '1 Year', value: '365' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {accountId ? 'Account Transactions' : 'All Transactions'}
        </Text>
        <Text style={styles.subtitle}>
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="clear" size={20} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>
                {category === 'all' ? 'All' : category.split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Date Range Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.dateFilter}
        >
          {dateRanges.map(range => (
            <TouchableOpacity
              key={range.value}
              style={[
                styles.dateButton,
                dateRange === range.value && styles.dateButtonActive
              ]}
              onPress={() => setDateRange(range.value)}
            >
              <Text style={[
                styles.dateButtonText,
                dateRange === range.value && styles.dateButtonTextActive
              ]}>
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item, index) => item.transaction_id || index.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
          }
          style={styles.transactionsList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="receipt-long" size={64} color="#e2e8f0" />
          <Text style={styles.emptyStateTitle}>No Transactions Found</Text>
          <Text style={styles.emptyStateText}>
            {searchQuery || selectedCategory !== 'all' || dateRange !== 'all'
              ? 'Try adjusting your filters'
              : 'No transactions available for this account'
            }
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1e293b',
  },
  categoryFilter: {
    marginBottom: 12,
  },
  categoryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  dateFilter: {
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  dateButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  dateButtonTextActive: {
    color: 'white',
  },
  transactionsList: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  accountName: {
    fontSize: 10,
    color: '#94a3b8',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
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
  },
});

export default TransactionsScreen;
