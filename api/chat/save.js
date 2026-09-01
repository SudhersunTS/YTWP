const { verifyToken } = require('../_auth');
const { supabase } = require('../../db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { room, message } = req.body || {};
  if (!room || !message) return res.status(400).json({ error: 'Missing fields' });
  const trimmed = message.trim().slice(0, 300);
  if (!trimmed) return res.status(400).json({ error: 'Empty message' });
  await supabase.from('chat_messages').insert({ room_name: room, username: user.username, message: trimmed });
  res.json({ ok: true });
};
