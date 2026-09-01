const { verifyToken } = require('../_auth');

module.exports = async (req, res) => {
  if (!verifyToken(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { q, pageToken } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&q=${encodeURIComponent(q)}${pageToken ? `&pageToken=${pageToken}` : ''}&key=${process.env.YOUTUBE_API_KEY}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    if (!data.items) return res.status(500).json({ error: 'Search failed' });
    res.json({
      items: data.items.map(i => ({ videoId: i.id.videoId, title: i.snippet.title, thumbnail: i.snippet.thumbnails.default.url })),
      nextPageToken: data.nextPageToken || null
    });
  } catch { res.status(500).json({ error: 'Search failed' }); }
};
