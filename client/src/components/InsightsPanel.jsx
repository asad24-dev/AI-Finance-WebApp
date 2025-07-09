// src/components/InsightsPanel.jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, subMonths } from 'date-fns';
import api from '../services/api';

const InsightsPanel = () => {
  const [spendingComparison, setSpendingComparison] = useState(null);
  const [budgetAnalysis, setBudgetAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  useEffect(() => {
    fetchInsightsData();
  }, [selectedPeriod]);

  const fetchInsightsData = async () => {
    try {
      setLoading(true);
      const [comparisonRes, budgetRes] = await Promise.all([
        api.get(`/analytics/spending/comparison?period=${selectedPeriod}`),
        api.get('/analytics/budget-analysis')
      ]);
      
      setSpendingComparison(comparisonRes.data);
      setBudgetAnalysis(budgetRes.data);
    } catch (error) {
      console.error('Error fetching insights data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px'
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

  const hasData = spendingComparison && (spendingComparison.current.total > 0 || spendingComparison.previous.total > 0);

  // Prepare comparison chart data - include ALL categories from both periods
  const comparisonChartData = hasData ? (() => {
    const allCategories = new Set();
    const categoryData = {};
    
    // Collect all categories from both periods
    spendingComparison.current.categories.forEach(cat => {
      allCategories.add(cat.category);
      categoryData[cat.category] = { current: Math.abs(cat.amount), previous: 0 };
    });
    
    spendingComparison.previous.categories.forEach(cat => {
      allCategories.add(cat.category);
      if (categoryData[cat.category]) {
        categoryData[cat.category].previous = Math.abs(cat.amount);
      } else {
        categoryData[cat.category] = { current: 0, previous: Math.abs(cat.amount) };
      }
    });
    
    // Convert to chart data format
    return Array.from(allCategories).map(category => {
      const data = categoryData[category];
      const change = data.previous > 0 ? 
        ((data.current - data.previous) / data.previous) * 100 : 
        (data.current > 0 ? 100 : 0);
        
      return {
        category: category.length > 12 ? category.substring(0, 12) + '...' : category,
        current: data.current,
        previous: data.previous,
        change: change
      };
    }).sort((a, b) => (b.current + b.previous) - (a.current + a.previous)).slice(0, 8);
  })() : [];

  // Prepare budget progress data
  const budgetProgressData = budgetAnalysis && budgetAnalysis.budgets ? 
    budgetAnalysis.budgets.map(budget => ({
      category: budget.category.length > 12 ? budget.category.substring(0, 12) + '...' : budget.category,
      spent: budget.currentSpent,
      budget: budget.budgetAmount,
      usage: budget.usagePercentage * 100,
      status: budget.isOverBudget ? 'over' : budget.isNearLimit ? 'warning' : 'good'
    })) : [];

  const formatCurrency = (value) => `$${value.toFixed(2)}`;

  const getChangeIcon = (change) => {
    if (change > 5) return '📈';
    if (change < -5) return '📉';
    return '➡️';
  };

  const getChangeColor = (change) => {
    if (change > 5) return '#ef4444';
    if (change < -5) return '#10b981';
    return '#6b7280';
  };

  const renderTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: 'var(--shadow-md)',
          fontSize: '14px'
        }}>
          <p style={{ 
            margin: '0 0 8px 0', 
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ 
              margin: '0 0 4px 0', 
              color: entry.color 
            }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      display: 'grid',
      gap: '24px'
    }}>
      {/* Header */}
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
          marginBottom: '16px'
        }}>
          <h3 style={{ 
            margin: 0, 
            color: 'var(--text-primary)',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            💡 Financial Insights
          </h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--background-color)',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {!hasData ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No Data Available</h3>
            <p style={{ margin: 0 }}>Connect your bank account to see spending insights</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: 'var(--background-color)',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '4px'
              }}>
                {formatCurrency(spendingComparison.current.total)}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                Current Period
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--background-color)',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: spendingComparison.change.total >= 0 ? '#ef4444' : '#10b981',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                {getChangeIcon(spendingComparison.change.percentage)}
                {Math.abs(spendingComparison.change.percentage).toFixed(1)}%
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                vs Previous Period
              </div>
            </div>

            {budgetAnalysis && budgetAnalysis.budgets.length > 0 && (
              <div style={{
                backgroundColor: 'var(--background-color)',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: budgetAnalysis.overallUsage > 1 ? '#ef4444' : budgetAnalysis.overallUsage > 0.8 ? '#f59e0b' : '#10b981',
                  marginBottom: '4px'
                }}>
                  {(budgetAnalysis.overallUsage * 100).toFixed(0)}%
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  Budget Used
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Insights Messages */}
      {hasData && spendingComparison.insights && spendingComparison.insights.length > 0 && (
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h4 style={{ 
            margin: '0 0 16px 0', 
            color: 'var(--text-primary)',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            📝 Smart Insights
          </h4>
          <div style={{
            display: 'grid',
            gap: '12px'
          }}>
            {spendingComparison.insights.map((insight, index) => (
              <div key={index} style={{
                backgroundColor: insight.type === 'success' ? '#f0fdf4' : 
                                insight.type === 'warning' ? '#fefbeb' : 
                                insight.type === 'error' ? '#fef2f2' : '#f8fafc',
                border: `1px solid ${insight.type === 'success' ? '#bbf7d0' : 
                                   insight.type === 'warning' ? '#fed7aa' : 
                                   insight.type === 'error' ? '#fecaca' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>{insight.icon}</span>
                <div>
                  <h5 style={{
                    margin: '0 0 4px 0',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: insight.type === 'success' ? '#166534' : 
                           insight.type === 'warning' ? '#92400e' : 
                           insight.type === 'error' ? '#dc2626' : '#374151'
                  }}>
                    {insight.title}
                  </h5>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: insight.type === 'success' ? '#15803d' : 
                           insight.type === 'warning' ? '#a16207' : 
                           insight.type === 'error' ? '#dc2626' : '#4b5563'
                  }}>
                    {insight.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Alerts */}
      {budgetAnalysis && budgetAnalysis.alerts && budgetAnalysis.alerts.length > 0 && (
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h4 style={{ 
            margin: '0 0 16px 0', 
            color: 'var(--text-primary)',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            🚨 Budget Alerts
          </h4>
          <div style={{
            display: 'grid',
            gap: '12px'
          }}>
            {budgetAnalysis.alerts.map((alert, index) => (
              <div key={index} style={{
                backgroundColor: alert.type === 'error' ? '#fef2f2' : '#fefbeb',
                border: `1px solid ${alert.type === 'error' ? '#fecaca' : '#fed7aa'}`,
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>
                  {alert.type === 'error' ? '🚫' : '⚠️'}
                </span>
                <div>
                  <strong style={{
                    color: alert.type === 'error' ? '#dc2626' : '#d97706',
                    fontSize: '14px'
                  }}>
                    {alert.category}:
                  </strong>
                  <span style={{
                    marginLeft: '8px',
                    color: alert.type === 'error' ? '#dc2626' : '#a16207',
                    fontSize: '14px'
                  }}>
                    {alert.message}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spending Comparison Chart */}
      {hasData && comparisonChartData.length > 0 && (
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h4 style={{ 
            margin: '0 0 24px 0', 
            color: 'var(--text-primary)',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            📊 Spending Comparison
          </h4>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis 
                  dataKey="category" 
                  stroke="var(--text-secondary)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--text-secondary)"
                  fontSize={12}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={renderTooltip} />
                <Bar 
                  dataKey="previous" 
                  fill="#94a3b8" 
                  name="Previous Period"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="current" 
                  fill="#4f46e5" 
                  name="Current Period"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Budget Progress Chart */}
      {budgetProgressData.length > 0 && (
        <div style={{
          backgroundColor: 'var(--surface-color)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h4 style={{ 
            margin: '0 0 24px 0', 
            color: 'var(--text-primary)',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            🎯 Budget Progress
          </h4>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis 
                  dataKey="category" 
                  stroke="var(--text-secondary)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--text-secondary)"
                  fontSize={12}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={renderTooltip} />
                <Bar 
                  dataKey="budget" 
                  fill="#e5e7eb" 
                  name="Budget"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="spent" 
                  fill="#3b82f6" 
                  name="Spent"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;
