import { pool } from '../config/db.js';

export const createReview = async (req, res) => {
  try {
    const { request_id, rating, comment } = req.body;
    const c = req.customer;

    const reqRow = (await pool.query(
      'SELECT * FROM service_requests WHERE request_id=$1 AND customer_id=$2',
      [request_id, c.customer_id]
    )).rows[0];
    if (!reqRow) return res.status(404).json({ error: 'Request not found' });
    if (reqRow.status !== 'completed') return res.status(400).json({ error: 'Request not completed' });

    const exists = (await pool.query('SELECT 1 FROM reviews WHERE request_id=$1', [request_id])).rows[0];
    if (exists) return res.status(400).json({ error: 'Review already submitted' });

    await pool.query(
      `INSERT INTO reviews (request_id, customer_id, provider_id, rating, comment)
       VALUES ($1,$2,$3,$4,$5)`,
      [request_id, c.customer_id, reqRow.provider_id, rating, comment]
    );

    const agg = (await pool.query(
      'SELECT AVG(rating)::numeric(3,2) AS avg, COUNT(*) AS count FROM reviews WHERE provider_id=$1',
      [reqRow.provider_id]
    )).rows[0];

    await pool.query(
      'UPDATE providers SET rating_avg=$1, rating_count=$2 WHERE provider_id=$3',
      [agg.avg, agg.count, reqRow.provider_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Failed' });
  }
};