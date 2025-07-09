import React, { useEffect, useState } from 'react';
import AccountsList from '../components/AccountsList';
import TransactionsList from '../components/TransactionsList';
import PlaidLinkButton from '../components/PlaidLinkButton';
import SpendingChart from '../components/SpendingChart';
import BudgetManager from '../components/BudgetManager';
import InsightsPanel from '../components/InsightsPanel';
import api from '../services/api';

const DashboardPage = ({ user, signOut }) => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [spendingData, setSpendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch accounts
        const accountsRes = await api.get('/plaid/accounts');
        setAccounts(accountsRes.data.accounts);

        // Fetch transactions
        const transactionsRes = await api.get('/plaid/transactions');
        setTransactions(transactionsRes.data.transactions);

        // Fetch spending analytics
        const spendingRes = await api.get('/analytics/spending');
        setSpendingData(spendingRes.data.categorySpending);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalBalance = accounts.reduce((sum, account) => {
    return sum + (account.balances?.current || 0);
  }, 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-color)' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'var(--surface-color)', 
        boxShadow: 'var(--shadow-sm)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '20px 0'
          }}>
            <div>
              <h1 style={{ 
                color: 'var(--primary-color)', 
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                Welcome back, {user?.username || user?.email?.split('@')[0]}
              </h1>
              <p style={{ 
                color: 'var(--text-secondary)',
                fontSize: '16px',
                margin: 0
              }}>
                Manage your finances with ease
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <PlaidLinkButton />
              <button 
                onClick={signOut}
                className="btn btn-secondary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: 'var(--accent-color)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: 'bold'
                    }}>
                      $
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                        Total Balance
                      </p>
                      <p style={{ 
                        fontSize: '24px', 
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        margin: 0
                      }}>
                        ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: 'var(--success-color)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      🏦
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                        Accounts
                      </p>
                      <p style={{ 
                        fontSize: '24px', 
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        margin: 0
                      }}>
                        {accounts.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: 'var(--warning-color)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      📊
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                        Transactions
                      </p>
                      <p style={{ 
                        fontSize: '24px', 
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        margin: 0
                      }}>
                        {transactions.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="card">
              <div className="tabs">
                <button 
                  className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  📊 Overview
                </button>
                <button 
                  className={`tab-button ${activeTab === 'accounts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('accounts')}
                >
                  💳 Accounts
                </button>
                <button 
                  className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('transactions')}
                >
                  📋 Transactions
                </button>
                <button 
                  className={`tab-button ${activeTab === 'budgets' ? 'active' : ''}`}
                  onClick={() => setActiveTab('budgets')}
                >
                  💰 Budgets
                </button>
                <button 
                  className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
                  onClick={() => setActiveTab('insights')}
                >
                  💡 Insights
                </button>
              </div>

              <div className="card-body">
                {activeTab === 'overview' && (
                  <div style={{ display: 'grid', gap: '24px' }}>
                    <SpendingChart data={spendingData} title="Current Month Spending" />
                    {accounts.length > 0 && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '24px'
                      }}>
                        <AccountsList accounts={accounts.slice(0, 3)} />
                        <TransactionsList transactions={transactions.slice(0, 5)} accounts={accounts} />
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'accounts' && <AccountsList accounts={accounts} />}
                {activeTab === 'transactions' && <TransactionsList transactions={transactions} accounts={accounts} />}
                {activeTab === 'budgets' && <BudgetManager />}
                {activeTab === 'insights' && <InsightsPanel />}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
