// src/services/networkService.js
import { get, isMockMode } from './api';
import { networkData as mockNetworkData } from '../data/mockData';

/**
 * Backend snake_case formatını frontend camelCase formatına çevirir. 
 * Backend hazır olduğunda USE_MOCK=false yapılınca aktifleşir.
 */
const adaptNetworkData = (data) => {
  return {
    nodes: (data.nodes || []).map(node => ({
      id: node.node_id,
      label: node.label,
      type: node.type,
      riskScore: node.risk_score ? Math.round(node.risk_score * 100) : 0,
    })),
    edges: (data.edges || []).map(edge => ({
      source: edge.source_id,
      target: edge.target_id,
      amount: edge.amount,
      label: edge.label,
      riskScore: edge.risk_score ? Math.round(edge.risk_score * 100) : 0,
    })),
  };
};

export const getNetworkData = async () => {
  if (isMockMode()) {
    return Promise.resolve(mockNetworkData);
  }
  
  try {
    const data = await get('/network');
    return adaptNetworkData(data);
  } catch (error) {
    console.error('Failed to fetch network data', error);
    return { nodes: [], edges: [] };
  }
};

export const getNetworkByAccount = async (accountId, depth = 2) => {
  if (isMockMode()) {
    return Promise.resolve(mockNetworkData);
  }
  
  try {
    const data = await get(`/network/account/${accountId}?depth=${depth}`);
    return adaptNetworkData(data);
  } catch (error) {
    console.error(`Failed to fetch network data for account ${accountId}`, error);
    return { nodes: [], edges: [] };
  }
};
