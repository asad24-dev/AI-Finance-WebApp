// src/components/AccountsList.jsx
import React from 'react';

const AccountsList = ({ accounts }) => {
  if (!accounts || accounts.length === 0) {
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
          🏦
        </div>
        <h3 style={{ 
          color: 'var(--text-primary)', 
          marginBottom: '8px',
          fontSize: '20px',
          fontWeight: '600'
        }}>
          No Accounts Connected
        </h3>
        <p style={{ 
          color: 'var(--text-secondary)',
          fontSize: '16px',
          margin: 0
        }}>
          Connect your bank account to get started with tracking your finances.
        </p>
      </div>
    );
  }

  const getAccountTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'checking': return '💳';
      case 'savings': return '🏦';
      case 'credit': return '💸';
      case 'investment': return '📈';
      default: return '💼';
    }
  };

  const getBalanceColor = (balance) => {
    if (balance > 10000) return 'var(--success-color)';
    if (balance > 1000) return 'var(--text-primary)';
    return 'var(--warning-color)';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatAccountType = (type) => {
    return type?.charAt(0).toUpperCase() + type?.slice(1) || 'Unknown';
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          color: 'var(--text-primary)',
          fontSize: '24px',
          fontWeight: '700',
          margin: 0
        }}>
          Your Accounts
        </h2>
        <p style={{ 
          color: 'var(--text-secondary)',
          fontSize: '16px',
          marginTop: '4px',
          margin: 0
        }}>
          Overview of all your connected bank accounts
        </p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Type</th>
              <th>Available Balance</th>
              <th>Current Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => {
              const availableBalance = account.balances?.available;
              const currentBalance = account.balances?.current;
              const primaryBalance = availableBalance ?? currentBalance ?? 0;
              
              return (
                <tr key={account.account_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>
                        {getAccountTypeIcon(account.type)}
                      </span>
                      <div>
                        <div style={{ 
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '15px'
                        }}>
                          {account.name}
                        </div>
                        <div style={{ 
                          color: 'var(--text-secondary)',
                          fontSize: '13px',
                          marginTop: '2px'
                        }}>
                          •••• {account.mask || account.account_id.slice(-4)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: 'var(--background-color)',
                      color: 'var(--text-primary)',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {formatAccountType(account.type)}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      fontWeight: '600',
                      fontSize: '15px',
                      color: availableBalance ? getBalanceColor(availableBalance) : 'var(--text-secondary)'
                    }}>
                      {availableBalance ? formatCurrency(availableBalance) : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      fontWeight: '600',
                      fontSize: '15px',
                      color: currentBalance ? getBalanceColor(currentBalance) : 'var(--text-secondary)'
                    }}>
                      {currentBalance ? formatCurrency(currentBalance) : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: 'var(--success-color)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      Active
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
          💡 <strong>Tip:</strong> Balances are updated in real-time from your bank. 
          Available balance shows funds you can spend immediately.
        </p>
      </div>
    </div>
  );
};

export default AccountsList;
