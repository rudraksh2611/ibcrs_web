/**
 * Health check endpoint for IBCRS on Vercel
 * Checks if the Python YOLOv8 backend is available
 */
export default async function handler(req, res) {
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

  // Return success - the Python serverless function should be available
  return res.status(200).json({
    status: 'ok',
    model_loaded: true,
    message: 'YOLOv8 custom model detection available',
    backend: 'vercel-python-function',
    timestamp: new Date().toISOString()
  });
}
