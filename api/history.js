const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all history from Vercel KV
      try {
        const history = (await kv.get('meme_history')) || [];
        return res.status(200).json({
          success: true,
          history: history,
          total: history.length
        });
      } catch (kvError) {
        console.log('KV error:', kvError.message);
        return res.status(200).json({
          success: true,
          history: [],
          total: 0
        });
      }
    } 
    
    else if (req.method === 'DELETE') {
      // Delete specific history entry
      const id = req.query.id || req.url.split('/').pop();
      
      try {
        const history = (await kv.get('meme_history')) || [];
        const filtered = history.filter(h => h.id !== id);
        await kv.set('meme_history', filtered);
        
        return res.status(200).json({ success: true, message: 'Deleted' });
      } catch (kvError) {
        console.log('KV error:', kvError.message);
        return res.status(200).json({ success: true, message: 'Deleted' });
      }
    }
    
    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
