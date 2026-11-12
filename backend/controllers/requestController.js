import { pool } from '../config/db.js';
import { v4 as uuid } from 'uuid';
import { generateBlockchainRecord } from '../utils/blockchain.js'; // UPDATED IMPORT

const makeRef = () => 'FSP-' + uuid().slice(0, 8).toUpperCase();

export const createRequest = async (req, res) => {
  try {
    const { provider_id, service_id, description, location, preferred_date } = req.body;
    const c = req.customer;
    const ref = makeRef();

    // --- BLOCKCHAIN IMPLEMENTATION ---
    // Create a hash of the request details to ensure integrity
    const hashData = { provider_id, customer_id: c.customer_id, description, location, preferred_date };
    const blockchainHash = await generateBlockchainRecord(ref, hashData); // UPDATED FUNCTION CALL
    // ---------------------------------

    const r = (await pool.query(
      `INSERT INTO service_requests
       (reference_number, customer_id, provider_id, service_id, description, location, preferred_date, blockchain_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [ref, c.customer_id, provider_id, service_id || null, description, location, preferred_date, blockchainHash]
    )).rows[0];

    const provUser = (await pool.query('SELECT user_id FROM providers WHERE provider_id=$1', [provider_id])).rows[0];
    if (provUser) {
      await pool.query(
        `INSERT INTO notifications (recipient_type, recipient_id, type, message)
         VALUES ('provider',$1,'new_request',$2)`,
        [provUser.user_id, `New service request ${ref}`]
      );
    }
    res.json(r);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Failed' });
  }
};

export const trackRequest = async (req, res) => {
  try {
    const { reference, phone } = req.body;
    const r = (await pool.query(
      `SELECT r.*, p.business_name AS provider_name, ci.phone AS customer_phone,
        s.name AS service_name
       FROM service_requests r
       JOIN providers p ON p.provider_id=r.provider_id
       JOIN customer_identities ci ON ci.customer_id=r.customer_id
       LEFT JOIN services s ON s.service_id=r.service_id
       WHERE r.reference_number=$1 AND ci.phone=$2`,
      [reference, phone]
    )).rows[0];
    if (!r) return res.status(404).json({ error: 'Request not found' });
    res.json(r);
  } catch { res.status(500).json({ error: 'Failed' }); }
};

export const myProviderRequests = async (req, res) => {
  try {
    const prov = (await pool.query('SELECT provider_id FROM providers WHERE user_id=$1', [req.user.user_id])).rows[0];
    const r = (await pool.query(
      `SELECT r.*, ci.name AS customer_name, ci.phone AS customer_phone, s.name AS service_name
       FROM service_requests r
       JOIN customer_identities ci ON ci.customer_id=r.customer_id
       LEFT JOIN services s ON s.service_id=r.service_id
       WHERE r.provider_id=$1 ORDER BY r.created_at DESC`, [prov.provider_id]
    )).rows;
    res.json(r);
  } catch { res.status(500).json({ error: 'Failed' }); }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['accepted','rejected','in_progress','completed','cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const prov = (await pool.query('SELECT provider_id FROM providers WHERE user_id=$1', [req.user.user_id])).rows[0];
    const r = (await pool.query(
      `UPDATE service_requests SET status=$1, updated_at=NOW()
       WHERE request_id=$2 AND provider_id=$3 RETURNING *`,
      [status, req.params.id, prov.provider_id]
    )).rows[0];
    if (!r) return res.status(404).json({ error: 'Request not found' });

    await pool.query(
      `INSERT INTO notifications (recipient_type, recipient_id, type, message)
       VALUES ('customer',$1,'status_update',$2)`,
      [r.customer_id, `Request ${r.reference_number} is ${status}`]
    );
    res.json(r);
  } catch { res.status(500).json({ error: 'Failed' }); }
};