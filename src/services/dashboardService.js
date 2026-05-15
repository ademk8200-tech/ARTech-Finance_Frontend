// src/services/dashboardService.js
import { get, isMockMode } from './api';
import { 
  dashboardStats as mockDashboardStats, 
  suspiciousTrend as mockSuspiciousTrend, 
  riskDistribution as mockRiskDistribution 
} from '../data/mockData';

const adaptDashboardStats = (data) => {
  return {
    totalTransactions: data.total_transactions ?? data.totalTransactions,
    suspiciousTransactions: data.suspicious_transactions ?? data.suspiciousTransactions,
    averageRiskScore: data.average_risk_score ?? data.averageRiskScore,
    highRiskAccounts: data.high_risk_accounts ?? data.highRiskAccounts,
    totalVolume: data.total_volume ?? data.totalVolume,
  };
};

const adaptSuspiciousTrend = (data) => {
  return data.map(item => ({
    date: item.date,
    count: item.count,
    total: item.total,
  }));
};

const adaptRiskDistribution = (data) => {
  return data.map(item => ({
    level: item.level,
    count: item.count,
    percentage: item.percentage,
    color: item.color,
  }));
};

export const getDashboardStats = async () => {
  if (isMockMode()) {
    return Promise.resolve(mockDashboardStats);
  }

  try {
    const data = await get('/dashboard/stats');
    return adaptDashboardStats(data);
  } catch (error) {
    console.error('Failed to fetch dashboard stats', error);
    return mockDashboardStats; // fallback
  }
};

export const getSuspiciousTrend = async () => {
  if (isMockMode()) {
    return Promise.resolve(mockSuspiciousTrend);
  }

  try {
    const data = await get('/trends/suspicious');
    return adaptSuspiciousTrend(data);
  } catch (error) {
    console.error('Failed to fetch suspicious trend', error);
    return mockSuspiciousTrend; // fallback
  }
};

export const getRiskDistribution = async () => {
  if (isMockMode()) {
    return Promise.resolve(mockRiskDistribution);
  }

  try {
    const data = await get('/risk-distribution');
    return adaptRiskDistribution(data);
  } catch (error) {
    console.error('Failed to fetch risk distribution', error);
    return mockRiskDistribution; // fallback
  }
};
