// src/components/BudgetManager.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const BudgetManager = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [newBudget, setNewBudget] = useState({
    category: '',
    budgetAmount: '',
    period: 'monthly',
    alertThreshold: 0.80
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching budget data...');
      const [budgetsRes, categoriesRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/budgets/categories')
      ]);
      
      console.log('Budgets response:', budgetsRes.data);
      console.log('Categories response:', categoriesRes.data);
      
      setBudgets(budgetsRes.data.budgets);
      setBudgetCategories(categoriesRes.data.categories);
      
      console.log('Set budgets:', budgetsRes.data.budgets);
      console.log('Set categories:', categoriesRes.data.categories);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    console.log('Creating budget with data:', newBudget);
    
    try {
      const response = await api.post('/budgets', newBudget);
      console.log('Budget created successfully:', response.data);
      
      setNewBudget({
        category: '',
        budgetAmount: '',
        period: 'monthly',
        alertThreshold: 0.80
      });
      setShowCreateForm(false);
      fetchData();
    } catch (error) {
      console.error('Error creating budget:', error);
      console.error('Error response:', error.response?.data);
      alert('Error creating budget: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleUpdateBudget = async (budgetId, updates) => {
    try {
      await api.put(`/budgets/${budgetId}`, updates);
      fetchData();
      setEditingBudget(null);
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Error updating budget: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await api.delete(`/budgets/${budgetId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting budget:', error);
        alert('Error deleting budget: ' + (error.response?.data?.error || 'Unknown error'));
      }
    }
  };

  const getProgressColor = (budget) => {
    if (budget.isOverBudget) return '#ef4444';
    if (budget.isNearLimit) return '#f59e0b';
    return '#10b981';
  };

  const getProgressWidth = (budget) => {
    return Math.min(100, budget.usagePercentage * 100);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--border-color)',
          borderTop: '4px solid var(--primary-color)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--surface-color)',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h3 style={{ 
          margin: 0, 
          color: 'var(--text-primary)',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Budget Management
        </h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
          style={{
            fontSize: '14px',
            padding: '8px 16px'
          }}
        >
          + Create Budget
        </button>
      </div>

      {/* Create Budget Form */}
      {showCreateForm && (
        <div style={{
          backgroundColor: 'var(--background-color)',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid var(--border-color)'
        }}>
          <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
            Create New Budget
          </h4>
          <form onSubmit={handleCreateBudget}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Category
                </label>
                <select
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface-color)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select Category</option>
                  {budgetCategories.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Budget Amount ($)
                </label>
                <input
                  type="number"
                  value={newBudget.budgetAmount}
                  onChange={(e) => setNewBudget({...newBudget, budgetAmount: e.target.value})}
                  required
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface-color)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Period
                </label>
                <select
                  value={newBudget.period}
                  onChange={(e) => setNewBudget({...newBudget, period: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface-color)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Alert Threshold (%)
                </label>
                <input
                  type="number"
                  value={newBudget.alertThreshold * 100}
                  onChange={(e) => setNewBudget({...newBudget, alertThreshold: e.target.value / 100})}
                  min="0"
                  max="100"
                  step="5"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--surface-color)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ fontSize: '14px' }}
              >
                Create Budget
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-secondary"
                style={{ fontSize: '14px' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget List */}
      {budgets.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No Budgets Yet</h3>
          <p style={{ margin: 0 }}>Create your first budget to start tracking your spending</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {budgets.map(budget => (
            <div key={budget.id} style={{
              backgroundColor: 'var(--background-color)',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div>
                  <h4 style={{ 
                    margin: '0 0 4px 0', 
                    color: 'var(--text-primary)',
                    fontSize: '16px'
                  }}>
                    {budget.category}
                  </h4>
                  <p style={{ 
                    margin: 0, 
                    color: 'var(--text-secondary)',
                    fontSize: '14px'
                  }}>
                    {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} budget
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  <span style={{
                    backgroundColor: budget.isOverBudget ? '#fee2e2' : budget.isNearLimit ? '#fef3c7' : '#f0fdf4',
                    color: budget.isOverBudget ? '#dc2626' : budget.isNearLimit ? '#d97706' : '#16a34a',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {budget.isOverBudget ? 'Over Budget' : budget.isNearLimit ? 'Near Limit' : 'On Track'}
                  </span>
                  <button
                    onClick={() => setEditingBudget(budget)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '4px',
                      fontSize: '16px'
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger-color)',
                      cursor: 'pointer',
                      padding: '4px',
                      fontSize: '16px'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '14px'
                }}>
                  ${budget.currentSpent.toFixed(2)} of ${budget.budgetAmount.toFixed(2)}
                </span>
                <span style={{ 
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {(budget.usagePercentage * 100).toFixed(1)}%
                </span>
              </div>

              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--border-color)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${getProgressWidth(budget)}%`,
                  height: '100%',
                  backgroundColor: getProgressColor(budget),
                  transition: 'width 0.3s ease'
                }}></div>
              </div>

              {budget.remaining > 0 && (
                <p style={{
                  margin: '8px 0 0 0',
                  color: 'var(--text-secondary)',
                  fontSize: '12px'
                }}>
                  ${budget.remaining.toFixed(2)} remaining
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Budget Modal */}
      {editingBudget && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--surface-color)',
            padding: '24px',
            borderRadius: '12px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              Edit Budget: {editingBudget.category}
            </h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleUpdateBudget(editingBudget.id, {
                budgetAmount: parseFloat(formData.get('budgetAmount')),
                alertThreshold: parseFloat(formData.get('alertThreshold')) / 100
              });
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Budget Amount ($)
                </label>
                <input
                  type="number"
                  name="budgetAmount"
                  defaultValue={editingBudget.budgetAmount}
                  required
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--background-color)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Alert Threshold (%)
                </label>
                <input
                  type="number"
                  name="alertThreshold"
                  defaultValue={editingBudget.alertThreshold * 100}
                  min="0"
                  max="100"
                  step="5"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--background-color)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '14px' }}
                >
                  Update Budget
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBudget(null)}
                  className="btn btn-secondary"
                  style={{ fontSize: '14px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManager;
