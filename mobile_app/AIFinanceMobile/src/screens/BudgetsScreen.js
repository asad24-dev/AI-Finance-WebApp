import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../services/api';
import LoadingScreen from './LoadingScreen';

const BudgetsScreen = ({ navigation }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly'
  });

  const categories = [
    'Food & Drink',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Utilities',
    'Travel',
    'Education',
    'Other'
  ];

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      const response = await api.get('/budget');
      setBudgets(response.data.budgets || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      Alert.alert('Error', 'Failed to load budgets');
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await fetchBudgets();
    setRefreshing(false);
  };

  // Create/Update budget
  const saveBudget = async () => {
    if (!formData.category || !formData.limit) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const budgetData = {
        category: formData.category,
        limit: parseFloat(formData.limit),
        period: formData.period
      };

      if (editingBudget) {
        await api.put(`/budget/${editingBudget.id}`, budgetData);
      } else {
        await api.post('/budget', budgetData);
      }

      setModalVisible(false);
      setEditingBudget(null);
      setFormData({ category: '', limit: '', period: 'monthly' });
      await fetchBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget');
    }
  };

  // Delete budget
  const deleteBudget = async (budgetId) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/budget/${budgetId}`);
              await fetchBudgets();
            } catch (error) {
              console.error('Error deleting budget:', error);
              Alert.alert('Error', 'Failed to delete budget');
            }
          }
        }
      ]
    );
  };

  // Open edit modal
  const openEditModal = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      limit: budget.limit.toString(),
      period: budget.period || 'monthly'
    });
    setModalVisible(true);
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingBudget(null);
    setFormData({ category: '', limit: '', period: 'monthly' });
    setModalVisible(true);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  // Get budget status color
  const getBudgetStatusColor = (spent, limit) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 75) return '#f59e0b';
    return '#10b981';
  };

  // Calculate budget progress
  const getBudgetProgress = (spent, limit) => {
    return Math.min((spent / limit) * 100, 100);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchBudgets();
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading budgets..." />;
  }

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);

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
          <Text style={styles.title}>Budget Overview</Text>
          <TouchableOpacity onPress={openCreateModal} style={styles.addButton}>
            <Icon name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Budget</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalBudget)}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Spent</Text>
              <Text style={[styles.summaryItemValue, { color: '#ef4444' }]}>
                {formatCurrency(totalSpent)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Remaining</Text>
              <Text style={[styles.summaryItemValue, { color: '#10b981' }]}>
                {formatCurrency(totalBudget - totalSpent)}
              </Text>
            </View>
          </View>
          {totalBudget > 0 && (
            <View style={styles.overallProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    {
                      width: `${getBudgetProgress(totalSpent, totalBudget)}%`,
                      backgroundColor: getBudgetStatusColor(totalSpent, totalBudget)
                    }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {((totalSpent / totalBudget) * 100).toFixed(1)}% used
              </Text>
            </View>
          )}
        </View>

        {/* Budgets List */}
        {budgets.length > 0 ? (
          <View style={styles.budgetsList}>
            {budgets.map((budget) => (
              <View key={budget.id} style={styles.budgetItem}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetCategory}>{budget.category}</Text>
                  <View style={styles.budgetActions}>
                    <TouchableOpacity 
                      onPress={() => openEditModal(budget)}
                      style={styles.actionButton}
                    >
                      <Icon name="edit" size={20} color="#2563eb" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => deleteBudget(budget.id)}
                      style={styles.actionButton}
                    >
                      <Icon name="delete" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.budgetAmounts}>
                  <Text style={styles.budgetSpent}>
                    {formatCurrency(budget.spent || 0)} spent
                  </Text>
                  <Text style={styles.budgetLimit}>
                    of {formatCurrency(budget.limit)}
                  </Text>
                </View>
                
                <View style={styles.budgetProgress}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        {
                          width: `${getBudgetProgress(budget.spent || 0, budget.limit)}%`,
                          backgroundColor: getBudgetStatusColor(budget.spent || 0, budget.limit)
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {getBudgetProgress(budget.spent || 0, budget.limit).toFixed(1)}%
                  </Text>
                </View>
                
                <Text style={styles.budgetPeriod}>
                  {budget.period || 'monthly'} budget
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="savings" size={64} color="#e2e8f0" />
            <Text style={styles.emptyStateTitle}>No Budgets Created</Text>
            <Text style={styles.emptyStateText}>
              Create your first budget to start tracking your spending
            </Text>
            <TouchableOpacity onPress={openCreateModal} style={styles.createButton}>
              <Text style={styles.createButtonText}>Create Budget</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Budget Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBudget ? 'Edit Budget' : 'Create Budget'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Category Selection */}
              <Text style={styles.fieldLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryOptions}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        formData.category === category && styles.categoryOptionActive
                      ]}
                      onPress={() => setFormData({...formData, category})}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        formData.category === category && styles.categoryOptionTextActive
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Budget Limit */}
              <Text style={styles.fieldLabel}>Budget Limit</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter budget amount"
                value={formData.limit}
                onChangeText={(text) => setFormData({...formData, limit: text})}
                keyboardType="numeric"
              />

              {/* Period Selection */}
              <Text style={styles.fieldLabel}>Period</Text>
              <View style={styles.periodOptions}>
                {['weekly', 'monthly', 'yearly'].map(period => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodOption,
                      formData.period === period && styles.periodOptionActive
                    ]}
                    onPress={() => setFormData({...formData, period})}
                  >
                    <Text style={[
                      styles.periodOptionText,
                      formData.period === period && styles.periodOptionTextActive
                    ]}>
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveBudget} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>
                  {editingBudget ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  summaryCard: {
    backgroundColor: '#10b981',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  summaryAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryItemLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  summaryItemValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  overallProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  budgetsList: {
    marginHorizontal: 20,
    gap: 12,
  },
  budgetItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  budgetActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  budgetAmounts: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  budgetSpent: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  budgetLimit: {
    fontSize: 14,
    color: '#64748b',
  },
  budgetProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  budgetPeriod: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'capitalize',
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
  createButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalForm: {
    padding: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  categoryOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryOptionActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: 'white',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  periodOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  periodOption: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  periodOptionActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  periodOptionText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  periodOptionTextActive: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});

export default BudgetsScreen;
