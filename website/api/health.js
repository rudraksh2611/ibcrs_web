/**
 * Health check endpoint for IBCRS on Vercel
 * Returns status indicating that client-side detection is being used
 */
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return error to indicate backend is not available
  // This will trigger client-side model loading (COCO-SSD)
  return res.status(503).json({
    status: 'no-backend',
    model_loaded: false,
    message: 'Backend detection unavailable on Vercel. Using client-side detection (COCO-SSD).',
    timestamp: new Date().toISOString()
  });
}
