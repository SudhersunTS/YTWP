const { verifyToken } = require('../_auth');

module.exports = async (req, res) => {
  if (!verifyToken(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { pageToken } = req.query;
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=8&videoCategoryId=10&regionCode=US${pageToken ? `&pageToken=${pageToken}` : ''}&key=${process.env.YOUTUBE_API_KEY}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    if (!data.items) return res.status(500).json({ error: 'Trending failed' });
    res.json({
      items: data.items.map(i => ({ videoId: i.id, title: i.snippet.title, thumbnail: i.snippet.thumbnails.default.url })),
      nextPageToken: data.nextPageToken || null
    });
  } catch { res.status(500).json({ error: 'Trending failed' }); }
};
