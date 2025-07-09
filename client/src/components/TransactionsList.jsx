// src/components/TransactionsList.jsx
import React from 'react';

const TransactionsList = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: 'var(--background-color)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '32px'
        }}>
          📋
        </div>
        <h3 style={{ 
          color: 'var(--text-primary)', 
          marginBottom: '8px',
          fontSize: '20px',
          fontWeight: '600'
        }}>
          No Transactions Found
        </h3>
        <p style={{ 
          color: 'var(--text-secondary)',
          fontSize: '16px',
          margin: 0
        }}>
          Your recent transactions will appear here once your accounts are connected and synced.
        </p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatAmount = (amount) => {
    const isPositive = amount < 0; // Plaid returns negative for credits
    const absAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(absAmount);
    
    return {
      amount: formatted,
      isPositive,
      displayAmount: isPositive ? `+${formatted}` : `-${formatted}`
    };
  };

  const getCategoryIcon = (category) => {
    if (!category || category.length === 0) return '💼';
    
    const mainCategory = category[0]?.toLowerCase();
    switch (mainCategory) {
      case 'food and drink':
      case 'restaurants': return '🍽️';
      case 'shops':
      case 'retail': return '🛍️';
      case 'transportation': return '🚗';
      case 'gas stations': return '⛽';
      case 'travel': return '✈️';
      case 'entertainment': return '🎬';
      case 'healthcare': return '🏥';
      case 'education': return '📚';
      case 'groceries': return '🛒';
      case 'utilities': return '💡';
      case 'rent': return '🏠';
      case 'transfer': return '🔄';
      case 'deposit': return '💰';
      case 'payment': return '💳';
      default: return '💼';
    }
  };

  const getMerchantName = (transaction) => {
    return transaction.merchant_name || 
           transaction.name || 
           'Unknown Merchant';
  };

  const getTransactionDescription = (transaction) => {
    if (transaction.merchant_name && transaction.name !== transaction.merchant_name) {
      return transaction.name;
    }
    return transaction.category?.join(' • ') || 'General Transaction';
  };

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          color: 'var(--text-primary)',
          fontSize: '24px',
          fontWeight: '700',
          margin: 0
        }}>
          Recent Transactions
        </h2>
        <p style={{ 
          color: 'var(--text-secondary)',
          fontSize: '16px',
          marginTop: '4px',
          margin: 0
        }}>
          Your latest financial activity across all accounts
        </p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Category</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Account</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((transaction) => {
              const amountInfo = formatAmount(transaction.amount);
              
              return (
                <tr key={transaction.transaction_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>
                        {getCategoryIcon(transaction.category)}
                      </span>
                      <div>
                        <div style={{ 
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '15px'
                        }}>
                          {getMerchantName(transaction)}
                        </div>
                        <div style={{ 
                          color: 'var(--text-secondary)',
                          fontSize: '13px',
                          marginTop: '2px'
                        }}>
                          {getTransactionDescription(transaction)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: 'var(--background-color)',
                      color: 'var(--text-primary)',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {transaction.category?.[0] || 'Other'}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      color: 'var(--text-secondary)',
                      fontSize: '14px'
                    }}>
                      {formatDate(transaction.date)}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      fontWeight: '600',
                      fontSize: '15px',
                      color: amountInfo.isPositive ? 'var(--success-color)' : 'var(--danger-color)'
                    }}>
                      {amountInfo.displayAmount}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      color: 'var(--text-secondary)',
                      fontSize: '14px'
                    }}>
                      •••• {transaction.account_id?.slice(-4) || 'Unknown'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ 
        marginTop: '16px',
        padding: '16px',
        backgroundColor: 'var(--background-color)',
        borderRadius: 'var(--border-radius)',
        border: '1px solid var(--border-color)'
      }}>
        <p style={{ 
          color: 'var(--text-secondary)',
          fontSize: '14px',
          margin: 0
        }}>
          📊 <strong>Total Transactions:</strong> {transactions.length} • 
          <strong> Latest sync:</strong> {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default TransactionsList;
