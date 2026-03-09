/**
 * Health check endpoint for IBCRS on Vercel
 * Checks if a YOLOv8 backend is configured
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

  // Check if backend is configured
  const BACKEND_URL = process.env.YOLO_BACKEND_URL || process.env.BACKEND_URL;
  
  if (BACKEND_URL) {
    // Try to verify the backend is actually reachable
    try {
      const backendHealth = await fetch(`${BACKEND_URL}/api/health`, { 
        timeout: 5000 
      });
      if (backendHealth.ok) {
        return res.status(200).json({
          status: 'ok',
          model_loaded: true,
          message: 'Connected to YOLOv8 backend',
          backend_url: BACKEND_URL,
          timestamp: new Date().toISOString()
        });
      }
    } catch (e) {
      console.log('Backend unreachable:', e.message);
    }
  }

  // If no backend or unreachable, fall back to client-side detection
  return res.status(200).json({
    status: 'degraded',
    model_loaded: false,
    message: 'Backend not available. Using client-side COCO-SSD detection. To use custom YOLOv8: set YOLO_BACKEND_URL environment variable on Vercel.',
    timestamp: new Date().toISOString()
  });
}
