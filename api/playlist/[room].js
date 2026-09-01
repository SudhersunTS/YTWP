const { verifyToken } = require('../_auth');
const { supabase } = require('../../db');

module.exports = async (req, res) => {
  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { room } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('playlist')
      .select('video_id, title')
      .eq('room_name', room)
      .order('position', { ascending: true });
    if (error) return res.status(500).json({ error: 'Server error' });
    return res.json(data.map(r => ({ videoId: r.video_id, title: r.title })));
  }

  if (req.method === 'POST') {
    const { action, videoId, title, index } = req.body || {};

    if (action === 'add') {
      const { data: existing } = await supabase.from('playlist').select('position').eq('room_name', room).order('position', { ascending: false }).limit(1);
      const position = existing?.length ? existing[0].position + 1 : 0;
      await supabase.from('playlist').insert({ room_name: room, video_id: videoId, title, position });
      return res.json({ ok: true });
    }

    if (action === 'remove') {
      const { data: items } = await supabase.from('playlist').select('id, position').eq('room_name', room).order('position', { ascending: true });
      if (!items || !items[index]) return res.status(400).json({ error: 'Invalid index' });
      await supabase.from('playlist').delete().eq('id', items[index].id);
      const remaining = items.filter((_, i) => i !== index);
      for (let i = 0; i < remaining.length; i++) {
        await supabase.from('playlist').update({ position: i }).eq('id', remaining[i].id);
      }
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  }

  res.status(405).end();
};
