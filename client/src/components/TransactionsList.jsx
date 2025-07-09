// src/components/TransactionsList.jsx
import React, { useState } from 'react';
import api from '../services/api';

const TransactionsList = ({ transactions, accounts = [] }) => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

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

  // Filter transactions by selected account
  const filteredTransactions = selectedAccount 
    ? transactions.filter(tx => tx.account_id === selectedAccount)
    : transactions;

  const handleDownloadStatement = async () => {
    try {
      setIsDownloading(true);
      
      const params = new URLSearchParams();
      if (selectedAccount) {
        params.append('accountId', selectedAccount);
      }
      
      const response = await api.get(`/plaid/statement?${params.toString()}`, {
        responseType: 'blob'
      });
      
      // Create blob URL and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const accountName = selectedAccount 
        ? accounts.find(acc => acc.account_id === selectedAccount)?.name || 'Account'
        : 'All-Accounts';
      
      link.download = `Transaction-Statement-${accountName}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading statement:', error);
      alert('Failed to download statement. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

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
  const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
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
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Account Filter */}
          <select 
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--surface-color)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              minWidth: '150px'
            }}
          >
            <option value="">All Accounts</option>
            {accounts.map(account => (
              <option key={account.account_id} value={account.account_id}>
                {account.name} (****{account.account_id?.slice(-4)})
              </option>
            ))}
          </select>
          
          {/* Download Statement Button */}
          <button
            onClick={handleDownloadStatement}
            disabled={isDownloading}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              opacity: isDownloading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            {isDownloading ? '⏳' : '📄'} 
            {isDownloading ? 'Generating...' : 'Download Statement'}
          </button>
        </div>
      </div>

      {/* Filter Summary */}
      {selectedAccount && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'var(--background-color)',
          borderRadius: 'var(--border-radius)',
          marginBottom: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ 
            color: 'var(--text-secondary)',
            fontSize: '14px',
            margin: 0
          }}>
            🔍 Showing transactions for: <strong style={{ color: 'var(--text-primary)' }}>
              {accounts.find(acc => acc.account_id === selectedAccount)?.name || 'Selected Account'}
            </strong> ({filteredTransactions.length} transactions)
          </p>
        </div>
      )}

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
          📊 <strong>Showing:</strong> {filteredTransactions.length} of {transactions.length} transactions
          {selectedAccount && (
            <span> • <strong>Account:</strong> {accounts.find(acc => acc.account_id === selectedAccount)?.name}</span>
          )} • 
          <strong> Latest sync:</strong> {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default TransactionsList;
