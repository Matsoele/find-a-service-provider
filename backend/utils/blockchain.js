import crypto from 'crypto';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { pool } from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const privateKey = naclUtil.decodeBase64(process.env.FSP_APP_PRIVATE_KEY);
const publicKey = naclUtil.decodeBase64(process.env.FSP_APP_PUBLIC_KEY);

export const generateBlockchainRecord = async (refNumber, requestData) => {
  try {
    // 1. Hash the data
    const dataString = JSON.stringify(requestData);
    const dataHash = crypto.createHash('sha256').update(dataString).digest('hex');

    // 2. Sign the hash with Ed25519 Private Key
    const signature = nacl.sign.detached(naclUtil.decodeUTF8(dataHash), privateKey);
    const signatureBase64 = naclUtil.encodeBase64(signature);

    // 3. Verify the signature with Public Key (Simulating Node verification)
    const isVerified = nacl.sign.detached.verify(
      naclUtil.decodeUTF8(dataHash),
      signature,
      publicKey
    );

    if (!isVerified) throw new Error("Cryptographic signature verification failed!");

    // 4. Get the latest block to link the chain
    const lastBlockRes = await pool.query('SELECT * FROM blockchain_ledger ORDER BY block_height DESC LIMIT 1');
    const lastBlock = lastBlockRes.rows[0];

    const newHeight = lastBlock.block_height + 1;
    const previousHash = lastBlock.current_block_hash;

    // 5. Create the current block's hash (Merkle root simulation)
    const blockData = newHeight + refNumber + dataHash + previousHash;
    const currentBlockHash = crypto.createHash('sha256').update(blockData).digest('hex');

    // 6. Save the new block to the database
    await pool.query(
      `INSERT INTO blockchain_ledger 
       (block_height, reference_number, data_hash, previous_block_hash, current_block_hash, signature)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [newHeight, refNumber, dataHash, previousHash, currentBlockHash, signatureBase64]
    );

    console.log(`⛓️ Block #${newHeight} successfully mined for request ${refNumber}`);
    
    return dataHash; // Return the data hash to store in the service_requests table
  } catch (error) {
    console.error("❌ Blockchain Error:", error.message);
    return "BLOCKCHAIN_FAILED";
  }
};