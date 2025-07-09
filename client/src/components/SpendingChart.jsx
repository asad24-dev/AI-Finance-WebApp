// src/components/SpendingChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const SpendingChart = ({ data, title = "Spending by Category" }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        backgroundColor: 'var(--surface-color)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No Data Available</h3>
        <p style={{ margin: 0 }}>Connect your bank account to see spending insights</p>
      </div>
    );
  }

  // Transform data for recharts
  const chartData = data.map(item => ({
    name: item.category,
    value: Math.abs(item.amount),
    count: item.count,
    color: item.color || getRandomColor()
  }));

  const totalSpent = chartData.reduce((sum, item) => sum + item.value, 0);

  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalSpent) * 100).toFixed(1);
      
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
            {data.name}
          </p>
          <p style={{ 
            margin: '0 0 4px 0', 
            color: 'var(--text-secondary)' 
          }}>
            Amount: <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              ${data.value.toFixed(2)}
            </span>
          </p>
          <p style={{ 
            margin: '0 0 4px 0', 
            color: 'var(--text-secondary)' 
          }}>
            Percentage: <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              {percentage}%
            </span>
          </p>
          <p style={{ 
            margin: 0, 
            color: 'var(--text-secondary)' 
          }}>
            Transactions: <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              {data.count}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

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
          {title}
        </h3>
        <div style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          textAlign: 'right'
        }}>
          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
            Total: ${totalSpent.toFixed(2)}
          </div>
          <div>
            {chartData.reduce((sum, item) => sum + item.count, 0)} transactions
          </div>
        </div>
      </div>

      <div style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="var(--surface-color)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={renderCustomTooltip} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: 'var(--text-primary)', fontSize: '12px' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown */}
      <div style={{
        marginTop: '24px',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          {chartData
            .sort((a, b) => b.value - a.value)
            .slice(0, 6)
            .map((item, index) => {
              const percentage = ((item.value / totalSpent) * 100).toFixed(1);
              return (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px',
                  backgroundColor: 'var(--background-color)',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    flexShrink: 0
                  }}></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.name}
                    </div>
                    <div style={{
                      color: 'var(--text-secondary)',
                      fontSize: '12px'
                    }}>
                      ${item.value.toFixed(2)} ({percentage}%)
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

// Helper function to generate colors
function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#10AC84', '#EE5A24', '#0652DD', '#9C88FF', '#FFC048'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default SpendingChart;
