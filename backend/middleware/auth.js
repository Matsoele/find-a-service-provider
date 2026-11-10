import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const r = await pool.query('SELECT * FROM users WHERE user_id=$1', [decoded.id]);
    if (!r.rows[0]) return res.status(401).json({ error: 'User not found' });
    req.user = r.rows[0];
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role))
    return res.status(403).json({ error: 'Forbidden' });
  next();
};

export const requireCustomer = async (req, res, next) => {
  try {
    const header = req.headers['x-customer-token'];
    if (!header) return res.status(401).json({ error: 'Customer token required' });
    const decoded = jwt.verify(header, process.env.JWT_SECRET);
    if (decoded.type !== 'customer') return res.status(401).json({ error: 'Invalid token' });
    const r = await pool.query(
      'SELECT * FROM customer_identities WHERE customer_id=$1 AND verified=true',
      [decoded.customerId]
    );
    if (!r.rows[0]) return res.status(401).json({ error: 'Not verified' });
    req.customer = r.rows[0];
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid customer token' });
  }
};