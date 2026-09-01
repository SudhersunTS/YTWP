const { verifyToken } = require('../_auth');
const { supabase } = require('../../db');

module.exports = async (req, res) => {
  if (!verifyToken(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { room } = req.query;
  const { data, error } = await supabase
    .from('chat_messages')
    .select('username, message, sent_at')
    .eq('room_name', room)
    .order('sent_at', { ascending: true })
    .limit(50);
  if (error) return res.status(500).json({ error: 'Server error' });
  res.json(data);
};
