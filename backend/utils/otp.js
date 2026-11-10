import { pool } from '../config/db.js';

export const generateOTP = async (phone) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await pool.query(
    'INSERT INTO otps (phone, code, expires_at) VALUES ($1,$2,$3)',
    [phone, code, expiresAt]
  );
  console.log(` OTP for ${phone}: ${code}`);
  return code;
};

export const verifyOTP = async (phone, code) => {
  const result = await pool.query(
    `SELECT * FROM otps WHERE phone=$1 AND code=$2 AND used=false AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [phone, code]
  );
  if (!result.rows[0]) return false;
  await pool.query('UPDATE otps SET used=true WHERE otp_id=$1', [result.rows[0].otp_id]);
  return true;
};