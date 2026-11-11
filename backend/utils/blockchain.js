import crypto from 'crypto';

// Generates a SHA-256 hash simulating a blockchain transaction
export const generateBlockchainHash = (data) => {
  const stringData = JSON.stringify(data) + Date.now().toString();
  return crypto.createHash('sha256').update(stringData).digest('hex');
};