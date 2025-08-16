import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const MetricsCards = ({ metrics }) => {
  const {
    totalBalance,
    monthlySpending,
    budgetRemaining,
    budgetUtilization
  } = metrics;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatPercentage = (percentage) => {
    return `${(percentage || 0).toFixed(1)}%`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.card, styles.balanceCard]}>
          <Text style={styles.cardLabel}>Total Balance</Text>
          <Text style={styles.cardValue}>{formatCurrency(totalBalance)}</Text>
        </View>
        
        <View style={[styles.card, styles.spendingCard]}>
          <Text style={styles.cardLabel}>This Month</Text>
          <Text style={styles.cardValue}>{formatCurrency(monthlySpending)}</Text>
        </View>
      </View>
      
      <View style={styles.row}>
        <View style={[styles.card, styles.budgetCard]}>
          <Text style={styles.cardLabel}>Budget Left</Text>
          <Text style={styles.cardValue}>{formatCurrency(budgetRemaining)}</Text>
        </View>
        
        <View style={[styles.card, styles.utilizationCard]}>
          <Text style={styles.cardLabel}>Budget Used</Text>
          <Text style={styles.cardValue}>{formatPercentage(budgetUtilization)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceCard: {
    backgroundColor: '#2563eb',
  },
  spendingCard: {
    backgroundColor: '#10b981',
  },
  budgetCard: {
    backgroundColor: '#f59e0b',
  },
  utilizationCard: {
    backgroundColor: '#8b5cf6',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default MetricsCards;
