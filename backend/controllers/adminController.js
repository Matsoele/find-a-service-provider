import { pool } from '../config/db.js';

export const stats = async (_req, res) => {
  const [providers, requests, reviews, messages] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM providers'),
    pool.query('SELECT COUNT(*) FROM service_requests'),
    pool.query('SELECT COUNT(*) FROM reviews'),
    pool.query('SELECT COUNT(*) FROM messages'),
  ]);
  res.json({
    providers: +providers.rows[0].count,
    requests: +requests.rows[0].count,
    reviews: +reviews.rows[0].count,
    messages: +messages.rows[0].count,
  });
};

export const listAllProviders = async (_req, res) => {
  const r = (await pool.query(
    `SELECT p.*, u.email, u.account_status FROM providers p JOIN users u ON u.user_id=p.user_id
     ORDER BY p.created_at DESC`
  )).rows;
  res.json(r);
};

export const toggleProviderStatus = async (req, res) => {
  const { status } = req.body;
  const r = (await pool.query(
    `UPDATE users SET account_status=$1
     WHERE user_id=(SELECT user_id FROM providers WHERE provider_id=$2) RETURNING user_id`,
    [status, req.params.id]
  )).rows[0];
  res.json(r);
};

export const listAllRequests = async (_req, res) => {
  const r = (await pool.query(
    `SELECT r.*, p.business_name AS provider_name, ci.name AS customer_name
     FROM service_requests r
     JOIN providers p ON p.provider_id=r.provider_id
     JOIN customer_identities ci ON ci.customer_id=r.customer_id
     ORDER BY r.created_at DESC LIMIT 200`
  )).rows;
  res.json(r);
};

export const activityLog = async (_req, res) => {
  const r = (await pool.query(
    'SELECT * FROM system_activity ORDER BY created_at DESC LIMIT 200'
  )).rows;
  res.json(r);
};

// --- ADDED: BLOCKCHAIN LEDGER FUNCTION ---
export const getBlockchainLedger = async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT reference_number, blockchain_hash, status, created_at 
       FROM service_requests 
       WHERE blockchain_hash IS NOT NULL 
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ledger' });
  }
};