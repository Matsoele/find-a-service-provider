import { pool } from '../config/db.js';

export const startConversation = async (req, res) => {
  try {
    const { provider_id } = req.body;
    const c = req.customer;
    const existing = (await pool.query(
      'SELECT * FROM conversations WHERE customer_id=$1 AND provider_id=$2',
      [c.customer_id, provider_id]
    )).rows[0];
    if (existing) return res.json(existing);
    const created = (await pool.query(
      'INSERT INTO conversations (customer_id, provider_id) VALUES ($1,$2) RETURNING *',
      [c.customer_id, provider_id]
    )).rows[0];
    res.json(created);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Failed' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const r = (await pool.query(
      `SELECT m.*,
        (SELECT json_agg(json_build_object('id',a.attachment_id,'url',a.file_location,'type',a.file_type))
         FROM message_attachments a WHERE a.message_id=m.message_id) AS attachments
       FROM messages m WHERE conversation_id=$1 ORDER BY created_at ASC`,
      [req.params.conversationId]
    )).rows;
    res.json(r);
  } catch { res.status(500).json({ error: 'Failed' }); }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversation_id, content } = req.body;
    const senderType = req.user ? 'provider' : 'customer';
    let senderId;
    if (req.user) {
      senderId = (await pool.query('SELECT provider_id FROM providers WHERE user_id=$1', [req.user.user_id])).rows[0].provider_id;
    } else {
      senderId = req.customer.customer_id;
    }

    const conv = (await pool.query('SELECT * FROM conversations WHERE conversation_id=$1', [conversation_id])).rows[0];
    if (!conv) return res.status(404).json({ error: 'Not found' });
    const ok = (senderType === 'provider' && conv.provider_id === senderId)
            || (senderType === 'customer' && conv.customer_id === senderId);
    if (!ok) return res.status(403).json({ error: 'Not your conversation' });

    const saved = (await pool.query(
      `INSERT INTO messages (conversation_id, sender_type, sender_id, content)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [conversation_id, senderType, senderId, content]
    )).rows[0];

    if (req.file) {
      await pool.query(
        `INSERT INTO message_attachments (message_id, file_location, file_type)
         VALUES ($1,$2,$3)`,
        [saved.message_id, `/uploads/${req.file.filename}`, req.file.mimetype]
      );
    }

    req.io?.to(`conv:${conversation_id}`).emit('new-message', saved);
    res.json(saved);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Failed' });
  }
};

export const providerConversations = async (req, res) => {
  try {
    const prov = (await pool.query('SELECT provider_id FROM providers WHERE user_id=$1', [req.user.user_id])).rows[0];
    const r = (await pool.query(
      `SELECT c.*, ci.name AS customer_name, ci.phone AS customer_phone,
        (SELECT content FROM messages WHERE conversation_id=c.conversation_id ORDER BY created_at DESC LIMIT 1) AS last_message
       FROM conversations c JOIN customer_identities ci ON ci.customer_id=c.customer_id
       WHERE c.provider_id=$1 ORDER BY c.created_at DESC`, [prov.provider_id]
    )).rows;
    res.json(r);
  } catch { res.status(500).json({ error: 'Failed' }); }
};

export const customerConversations = async (req, res) => {
  try {
    const r = (await pool.query(
      `SELECT c.*, p.business_name AS provider_name, p.profile_image
       FROM conversations c JOIN providers p ON p.provider_id=c.provider_id
       WHERE c.customer_id=$1 ORDER BY c.created_at DESC`, [req.customer.customer_id]
    )).rows;
    res.json(r);
  } catch { res.status(500).json({ error: 'Failed' }); }
};