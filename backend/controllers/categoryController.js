import { pool } from '../config/db.js';

export const listCategories = async (_req, res) => {
  res.json((await pool.query('SELECT * FROM categories WHERE active=true ORDER BY name')).rows);
};

export const createCategory = async (req, res) => {
  const { name, description, icon } = req.body;
  try {
    const r = (await pool.query(
      'INSERT INTO categories (name,description,icon) VALUES ($1,$2,$3) RETURNING *',
      [name, description, icon]
    )).rows[0];
    res.json(r);
  } catch { res.status(500).json({ error: 'Failed' }); }
};

export const updateCategory = async (req, res) => {
  const { name, description, icon, active } = req.body;
  try {
    const r = (await pool.query(
      `UPDATE categories SET name=COALESCE($1,name), description=COALESCE($2,description),
       icon=COALESCE($3,icon), active=COALESCE($4,active) WHERE category_id=$5 RETURNING *`,
      [name, description, icon, active, req.params.id]
    )).rows[0];
    res.json(r);
  } catch { res.status(500).json({ error: 'Failed' }); }
};

export const deleteCategory = async (req, res) => {
  await pool.query('UPDATE categories SET active=false WHERE category_id=$1', [req.params.id]);
  res.json({ success: true });
};