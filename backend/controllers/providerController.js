import { pool } from '../config/db.js';

export const listProviders = async (req, res) => {
  try {
    const { q, district, category, minPrice, maxPrice } = req.query;
    let sql = `
      SELECT p.*, u.name AS owner_name,
        (SELECT json_agg(json_build_object('service_id',s.service_id,'name',s.name,'price',s.price,'category_id',s.category_id))
         FROM services s WHERE s.provider_id=p.provider_id) AS services
      FROM providers p JOIN users u ON u.user_id=p.user_id
      WHERE u.account_status='active'`;
    const params = [];
    if (q) {
      params.push(`%${q}%`);
      sql += ` AND (p.business_name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }
    if (district) { params.push(district); sql += ` AND p.district=$${params.length}`; }
    if (category) {
      params.push(category);
      sql += ` AND EXISTS (SELECT 1 FROM services s WHERE s.provider_id=p.provider_id AND s.category_id=$${params.length})`;
    }
    if (minPrice || maxPrice) {
      params.push(minPrice || 0); const a = params.length;
      params.push(maxPrice || 999999); const b = params.length;
      sql += ` AND EXISTS (SELECT 1 FROM services s WHERE s.provider_id=p.provider_id AND s.price BETWEEN $${a} AND $${b})`;
    }
    sql += ' ORDER BY p.rating_avg DESC, p.created_at DESC LIMIT 100';
    res.json((await pool.query(sql, params)).rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list providers' });
  }
};

export const getProviderById = async (req, res) => {
  try {
    const p = (await pool.query(
      `SELECT p.*, u.name AS owner_name, u.email FROM providers p
       JOIN users u ON u.user_id=p.user_id WHERE p.provider_id=$1`,
      [req.params.id]
    )).rows[0];
    if (!p) return res.status(404).json({ error: 'Provider not found' });

    const services = (await pool.query(
      `SELECT s.*, c.name AS category_name FROM services s
       LEFT JOIN categories c ON c.category_id=s.category_id
       WHERE s.provider_id=$1`,
      [req.params.id]
    )).rows;

    const reviews = (await pool.query(
      `SELECT r.*, c.name AS customer_name FROM reviews r
       JOIN customer_identities c ON c.customer_id=r.customer_id
       WHERE r.provider_id=$1 ORDER BY r.created_at DESC LIMIT 20`,
      [req.params.id]
    )).rows;

    res.json({ provider: p, services, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
};

export const getMyProvider = async (req, res) => {
  const r = (await pool.query('SELECT * FROM providers WHERE user_id=$1', [req.user.user_id])).rows[0];
  res.json(r);
};

export const updateMyProfile = async (req, res) => {
  try {
    const { business_name, description, phone, district, service_coverage, availability } = req.body;
    const r = (await pool.query(
      `UPDATE providers SET business_name=COALESCE($1,business_name), description=COALESCE($2,description),
       phone=COALESCE($3,phone), district=COALESCE($4,district),
       service_coverage=COALESCE($5,service_coverage), availability=COALESCE($6,availability)
       WHERE user_id=$7 RETURNING *`,
      [business_name, description, phone, district, service_coverage, availability, req.user.user_id]
    )).rows[0];
    res.json(r);
  } catch {
    res.status(500).json({ error: 'Update failed' });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const url = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE providers SET profile_image=$1 WHERE user_id=$2', [url, req.user.user_id]);
    res.json({ profile_image: url });
  } catch { res.status(500).json({ error: 'Upload failed' }); }
};

export const listMyServices = async (req, res) => {
  const prov = (await pool.query('SELECT provider_id FROM providers WHERE user_id=$1', [req.user.user_id])).rows[0];
  if (!prov) return res.status(404).json({ error: 'Provider not found' });
  const r = (await pool.query(
    `SELECT s.*, c.name AS category_name FROM services s
     LEFT JOIN categories c ON c.category_id=s.category_id
     WHERE s.provider_id=$1`, [prov.provider_id]
  )).rows;
  res.json(r);
};

export const addService = async (req, res) => {
  try {
    const { name, description, price, category_id, availability } = req.body;
    const prov = (await pool.query('SELECT provider_id FROM providers WHERE user_id=$1', [req.user.user_id])).rows[0];
    const r = (await pool.query(
      `INSERT INTO services (provider_id, category_id, name, description, price, availability)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [prov.provider_id, category_id, name, description, price, availability]
    )).rows[0];
    res.json(r);
  } catch { res.status(500).json({ error: 'Add failed' }); }
};

export const updateService = async (req, res) => {
  try {
    const { name, description, price, category_id, availability } = req.body;
    const prov = (await pool.query('SELECT provider_id FROM providers WHERE user_id=$1', [req.user.user_id])).rows[0];
    const r = (await pool.query(
      `UPDATE services SET name=COALESCE($1,name), description=COALESCE($2,description),
       price=COALESCE($3,price), category_id=COALESCE($4,category_id),
       availability=COALESCE($5,availability)
       WHERE service_id=$6 AND provider_id=$7 RETURNING *`,
      [name, description, price, category_id, availability, req.params.id, prov.provider_id]
    )).rows[0];
    res.json(r);
  } catch { res.status(500).json({ error: 'Update failed' }); }
};

export const deleteService = async (req, res) => {
  try {
    const prov = (await pool.query('SELECT provider_id FROM providers WHERE user_id=$1', [req.user.user_id])).rows[0];
    await pool.query('DELETE FROM services WHERE service_id=$1 AND provider_id=$2',
      [req.params.id, prov.provider_id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Delete failed' }); }
};