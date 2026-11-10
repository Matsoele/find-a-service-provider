import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { generateOTP, verifyOTP } from '../utils/otp.js';

const signUser = (u) =>
  jwt.sign({ id: u.user_id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const signCustomer = (id) =>
  jwt.sign({ customerId: id, type: 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const registerProvider = async (req, res) => {
  const { name, email, password, phone, business_name, district, service_coverage, description } = req.body;
  try {
    const exists = await pool.query('SELECT 1 FROM users WHERE email=$1', [email]);
    if (exists.rows.length) return res.status(400).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = (await pool.query(
      `INSERT INTO users (name,email,password_hash,phone,role)
       VALUES ($1,$2,$3,$4,'provider') RETURNING *`,
      [name, email, hash, phone]
    )).rows[0];

    await pool.query(
      `INSERT INTO providers (user_id, business_name, description, phone, district, service_coverage)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [user.user_id, business_name, description || '', phone, district, service_coverage || district]
    );

    res.json({ token: signUser(user), user: { id: user.user_id, name, email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const loginProvider = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = (await pool.query('SELECT * FROM users WHERE email=$1', [email])).rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.account_status !== 'active') return res.status(403).json({ error: 'Account inactive' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const provider = (await pool.query('SELECT * FROM providers WHERE user_id=$1', [user.user_id])).rows[0];
    res.json({
      token: signUser(user),
      user: { id: user.user_id, name: user.name, email: user.email, role: user.role },
      provider,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const requestCustomerOTP = async (req, res) => {
  const { phone, name } = req.body;
  try {
    if (!phone) return res.status(400).json({ error: 'Phone required' });
    let cust = (await pool.query('SELECT * FROM customer_identities WHERE phone=$1', [phone])).rows[0];
    if (!cust) {
      cust = (await pool.query(
        'INSERT INTO customer_identities (name, phone, verified) VALUES ($1,$2,false) RETURNING *',
        [name || 'Customer', phone]
      )).rows[0];
    }
    await generateOTP(phone);
    res.json({ message: 'OTP sent', customer_id: cust.customer_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OTP request failed' });
  }
};

export const verifyCustomerOTP = async (req, res) => {
  const { phone, code } = req.body;
  try {
    const ok = await verifyOTP(phone, code);
    if (!ok) return res.status(400).json({ error: 'Invalid or expired OTP' });
    const cust = (await pool.query(
      'UPDATE customer_identities SET verified=true WHERE phone=$1 RETURNING *',
      [phone]
    )).rows[0];
    res.json({ token: signCustomer(cust.customer_id), customer: cust });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
};

export const me = async (req, res) => {
  const prov = (await pool.query('SELECT * FROM providers WHERE user_id=$1', [req.user.user_id])).rows[0];
  res.json({ user: req.user, provider: prov });
};