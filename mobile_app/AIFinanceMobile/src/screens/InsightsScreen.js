import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import api from '../services/api';
import LoadingScreen from './LoadingScreen';

const { width: screenWidth } = Dimensions.get('window');

const InsightsScreen = ({ navigation }) => {
  const [insights, setInsights] = useState([]);
  const [spendingData, setSpendingData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch insights data
  const fetchInsightsData = async () => {
    try {
      const [
        insightsResponse,
        spendingResponse,
        trendsResponse
      ] = await Promise.all([
        api.get('/insights').catch(() => ({ data: { insights: [] } })),
        api.get('/spending/categories').catch(() => ({ data: { categories: [] } })),
        api.get('/spending/trends').catch(() => ({ data: { trends: [] } }))
      ]);

      setInsights(insightsResponse.data.insights || []);
      setSpendingData(spendingResponse.data.categories || []);
      setMonthlyTrends(trendsResponse.data.trends || []);
    } catch (error) {
      console.error('Error fetching insights data:', error);
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await fetchInsightsData();
    setRefreshing(false);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  // Prepare chart data
  const prepareSpendingChart = () => {
    if (!spendingData.length) return null;

    const chartData = spendingData.slice(0, 6).map((item, index) => ({
      name: item.category,
      population: item.amount,
      color: [
        '#2563eb', '#10b981', '#f59e0b', 
        '#ef4444', '#8b5cf6', '#06b6d4'
      ][index],
      legendFontColor: '#64748b',
      legendFontSize: 12,
    }));

    return chartData;
  };

  const prepareMonthlyChart = () => {
    if (!monthlyTrends.length) return null;

    const labels = monthlyTrends.map(item => 
      new Date(item.month).toLocaleDateString('en-US', { month: 'short' })
    );
    const data = monthlyTrends.map(item => item.amount);

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  const prepareCategoryBarChart = () => {
    if (!spendingData.length) return null;

    const topCategories = spendingData.slice(0, 5);
    const labels = topCategories.map(item => 
      item.category.substring(0, 8) + (item.category.length > 8 ? '...' : '')
    );
    const data = topCategories.map(item => item.amount);

    return {
      labels,
      datasets: [{
        data
      }]
    };
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchInsightsData();
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading insights..." />;
  }

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#2563eb'
    }
  };

  const spendingChartData = prepareSpendingChart();
  const monthlyChartData = prepareMonthlyChart();
  const categoryBarData = prepareCategoryBarChart();

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
          <Text style={styles.title}>Financial Insights</Text>
          <Text style={styles.subtitle}>
            Understand your spending patterns
          </Text>
        </View>

        {/* Spending by Category (Pie Chart) */}
        {spendingChartData && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Spending by Category</Text>
            <View style={styles.chartContainer}>
              <PieChart
                data={spendingChartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 10]}
                absolute
              />
            </View>
          </View>
        )}

        {/* Monthly Spending Trend */}
        {monthlyChartData && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Monthly Spending Trend</Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={monthlyChartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </View>
          </View>
        )}

        {/* Top Categories (Bar Chart) */}
        {categoryBarData && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Top Spending Categories</Text>
            <View style={styles.chartContainer}>
              <BarChart
                data={categoryBarData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                showValuesOnTopOfBars
                fromZero
              />
            </View>
          </View>
        )}

        {/* Insights Cards */}
        {insights.length > 0 && (
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>Smart Insights</Text>
            {insights.map((insight, index) => (
              <View key={index} style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <View style={[
                    styles.insightType,
                    {
                      backgroundColor: insight.type === 'warning' 
                        ? '#fef3c7' 
                        : insight.type === 'success'
                        ? '#d1fae5'
                        : '#dbeafe'
                    }
                  ]}>
                    <Text style={[
                      styles.insightTypeText,
                      {
                        color: insight.type === 'warning'
                          ? '#f59e0b'
                          : insight.type === 'success'
                          ? '#10b981'
                          : '#2563eb'
                      }
                    ]}>
                      {insight.type || 'info'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.insightDescription}>
                  {insight.description}
                </Text>
                {insight.amount && (
                  <Text style={styles.insightAmount}>
                    {formatCurrency(insight.amount)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Spending Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Spending Summary</Text>
          <View style={styles.summaryGrid}>
            {spendingData.slice(0, 4).map((category, index) => (
              <View key={index} style={styles.summaryCard}>
                <Text style={styles.summaryCategory}>{category.category}</Text>
                <Text style={styles.summaryAmount}>
                  {formatCurrency(category.amount)}
                </Text>
                <Text style={styles.summaryPercentage}>
                  {category.percentage ? `${category.percentage.toFixed(1)}%` : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Financial Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Budgeting Tip</Text>
            <Text style={styles.tipDescription}>
              Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>📊 Spending Insight</Text>
            <Text style={styles.tipDescription}>
              Review your spending patterns monthly to identify areas where you can optimize your budget.
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🎯 Goal Setting</Text>
            <Text style={styles.tipDescription}>
              Set specific, measurable financial goals and track your progress regularly.
            </Text>
          </View>
        </View>
      </ScrollView>
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
  chartSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 16,
  },
  insightsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  insightCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  insightType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  insightTypeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  insightDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  insightAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  summarySection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryCategory: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  summaryPercentage: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  tipsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});

export default InsightsScreen;
