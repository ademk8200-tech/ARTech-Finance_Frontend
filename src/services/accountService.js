// src/services/accountService.js
import { get, isMockMode } from './api';
import { accounts as mockAccounts } from '../data/mockData';

/**
 * Backend snake_case formatını frontend camelCase formatına çevirir. 
 * Backend hazır olduğunda USE_MOCK=false yapılınca aktifleşir.
 */
const adaptAccount = (data) => {
  return {
    id: data.account_id,
    ownerName: data.owner_name,
    accountType: data.account_type,
    totalIncoming: data.total_incoming,
    totalOutgoing: data.total_outgoing,
    transactionCount: data.transaction_count,
    riskLevel: data.risk_level,
    riskScore: data.risk_score ? Math.round(data.risk_score * 100) : 0,
  };
};

export const getAccounts = async () => {
  if (isMockMode()) {
    return Promise.resolve(mockAccounts);
  }
  
  try {
    const data = await get('/accounts');
    return data.map(adaptAccount);
  } catch (error) {
    console.error('Failed to fetch accounts', error);
    return [];
  }
};

export const getAccountById = async (id) => {
  if (isMockMode()) {
    const acc = mockAccounts.find(a => a.id === id);
    return Promise.resolve(acc || null);
  }
  
  try {
    const data = await get(`/accounts/${id}`);
    return adaptAccount(data);
  } catch (error) {
    console.error(`Failed to fetch account ${id}`, error);
    return null;
  }
};
