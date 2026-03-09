/**
 * Detection endpoint for IBCRS on Vercel
 * This proxies detection requests to an external YOLOv8 backend
 * 
 * Set the BACKEND_URL environment variable on Vercel to point to your Flask backend
 * Example: https://ibcrs-backend.railway.app/api/detect
 */
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get backend URL from environment variable
  const BACKEND_URL = process.env.YOLO_BACKEND_URL || process.env.BACKEND_URL;
  
  if (!BACKEND_URL) {
    return res.status(503).json({
      error: 'Backend not configured',
      message: 'Set YOLO_BACKEND_URL or BACKEND_URL environment variable to your Flask backend URL'
    });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Proxy the request to the Flask backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image })
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend returned ${backendResponse.status}`);
    }

    const detections = await backendResponse.json();
    return res.status(200).json(detections);
  } catch (error) {
    console.error('Detection proxy error:', error);
    return res.status(500).json({
      error: 'Detection failed',
      message: error.message
    });
  }
}
