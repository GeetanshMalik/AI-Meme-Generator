// Note: History is stored in memory within each serverless function
// For production, you'd want to use a database like MongoDB or Vercel KV
let memeHistory = [];

module.exports = async (req, res) => {
  // Enable CORS
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
      // Get all history
      return res.status(200).json({
        success: true,
        history: memeHistory,
        total: memeHistory.length
      });
    } 
    
    else if (req.method === 'DELETE') {
      // Delete specific history entry
      const { id } = req.query;
      const index = memeHistory.findIndex(h => h.id === id);
      
      if (index !== -1) {
        memeHistory.splice(index, 1);
        return res.status(200).json({ success: true, message: 'Deleted' });
      } else {
        return res.status(404).json({ success: false, error: 'Not found' });
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
