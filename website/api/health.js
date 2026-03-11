/**
 * Health check endpoint for IBCRS on Vercel
 * On Vercel, we have no Python YOLO backend - detection uses client-side ONNX model.
 * Return model_loaded: false so the frontend uses the browser ONNX model.
 */
export default async function handler(req, res) {
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

  // On Vercel: no YOLO backend; frontend uses client-side ONNX model
  return res.status(200).json({
    status: 'ok',
    model_loaded: false,
    message: 'Client-side IBCRS custom ONNX model for detection',
    backend: 'client',
    timestamp: new Date().toISOString()
  });
}
