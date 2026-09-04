const { verifyToken } = require('../_auth');
const { supabase } = require('../../db');

module.exports = async (req, res) => {
  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { room } = req.query;

  if (req.method === 'GET') {
    const { data } = await supabase.from('room_state').select('*').eq('room_name', room).single();
    const { data: playlist } = await supabase.from('playlist').select('video_id, title').eq('room_name', room).order('position', { ascending: true });
    return res.json({
      videoId: data?.video_id || '',
      time: data?.time || 0,
      playing: data?.playing || false,
      currentIndex: data?.current_index ?? -1,
      playlist: (playlist || []).map(r => ({ videoId: r.video_id, title: r.title }))
    });
  }

  if (req.method === 'POST') {
    const { videoId, time, playing, currentIndex } = req.body || {};
    const { error } = await supabase.from('room_state').upsert(
      { room_name: room, video_id: videoId, time, playing, current_index: currentIndex },
      { onConflict: 'room_name' }
    );
    if (error) return res.status(500).json({ error: 'Could not save room state' });
    return res.json({ ok: true });
  }

  res.status(405).end();
};
