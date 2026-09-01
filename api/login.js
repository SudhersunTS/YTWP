const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const { data, error } = await supabase.from('users').select('*').eq('username', username).single();
  if (error || !data) return res.status(400).json({ error: 'Invalid username or password' });
  const valid = await bcrypt.compare(password, data.password);
  if (!valid) return res.status(400).json({ error: 'Invalid username or password' });
  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username });
};
