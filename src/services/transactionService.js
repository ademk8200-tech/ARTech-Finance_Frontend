// src/services/transactionService.js
import { get, isMockMode } from './api';
import { transactions as mockTransactions } from '../data/mockData';

/**
 * Backend snake_case formatını frontend camelCase formatına çevirir. 
 * Backend hazır olduğunda USE_MOCK=false yapılınca aktifleşir.
 */
const adaptTransaction = (data) => {
  const statusMap = {
    suspicious: 'Şüpheli',
    review: 'İncelemede',
    normal: 'Normal',
  };

  return {
    id: data.transaction_id,
    senderAccount: data.sender_account,
    receiverAccount: data.receiver_account,
    amount: data.amount,
    currency: data.currency || 'TRY',
    date: data.date || new Date().toISOString(),
    transactionType: data.transaction_type || 'Bilinmeyen',
    riskScore: data.risk_score ? Math.round(data.risk_score * 100) : 0,
    status: statusMap[data.status] || data.status,
    pattern: data.pattern || '',
    explanation: data.explanation || '',
    xaiReasons: data.xai_reasons || [],
    importantNodes: data.important_nodes || [],
    importantEdges: data.important_edges || [],
    featureImportance: data.feature_importance || [],
  };
};

export const getTransactions = async () => {
  if (isMockMode()) {
    return Promise.resolve(mockTransactions);
  }
  
  try {
    const data = await get('/transactions');
    return data.map(adaptTransaction);
  } catch (error) {
    console.error('Failed to fetch transactions', error);
    return [];
  }
};

export const getTransactionById = async (id) => {
  if (isMockMode()) {
    const txn = mockTransactions.find(t => t.id === id);
    return Promise.resolve(txn || null);
  }

  try {
    const data = await get(`/transactions/${id}`);
    return adaptTransaction(data);
  } catch (error) {
    console.error(`Failed to fetch transaction ${id}`, error);
    return null;
  }
};
