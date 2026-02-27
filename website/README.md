# IBCRS - Intelligent BioTech Component Recognition System

> AI-powered biotech equipment detection system with real-time object recognition

## 📋 Project Overview

IBCRS is an intelligent detection system that recognizes and catalogs biotech laboratory equipment in real-time using advanced AI/ML models.

## 🚀 Deployment

### **Vercel (Static + Client-Side Detection)**
The website is deployed on Vercel and uses **client-side ML detection** (COCO-SSD) for instant recognition without backend servers.

- **URL**: https://jagriti2325.github.io/IBCRS/
- **Detection Method**: Client-side (TensorFlow.js + COCO-SSD)
- **Features**: 
  - ✅ Works in browser without external servers
  - ✅ Real-time webcam detection
  - ✅ Fast inference on GPU
  - ✅ Privacy-preserved (no data sent to servers)

### **Local Deployment (Python Flask Backend)**

For local development with the full YOLOv8 backend:

```bash
cd website
pip install -r backend/requirements.txt
python backend/app.py
```

Then open `http://localhost:5000` in your browser.

## 📁 Project Structure

```
website/
├── frontend/              # Static HTML/CSS/JS files
│   ├── index.html        # Main detection interface
│   ├── about.html
│   ├── component_*.html  # Equipment detail pages
│   ├── css/
│   ├── js/
│   │   └── main.js       # Detection logic (client + backend support)
│   ├── assets/
│   └── equipment.json    # Equipment database
├── backend/              # Flask API (local development only)
│   ├── app.py           # Flask application
│   └── requirements.txt   # Python dependencies
├── api/                  # Vercel serverless functions
│   └── health.js        # Health check endpoint
├── vercel.json          # Vercel configuration
├── package.json         # Node.js configuration for Vercel
└── .vercelignore        # Files to ignore in Vercel builds
```

## 🔧 Features

### Detection Modes

**On Vercel:**
- Uses **COCO-SSD** (client-side TensorFlow.js model)
- All detection happens in the browser
- Classes detected: ~90 common objects

**Locally:**
- Uses **YOLOv8** (custom trained model)
- Backend server processes frames
- Real-time statistics and monitoring
- Optimized for biotech equipment

### Components

- **Camera Detection**: Real-time webcam object detection
- **Snapshot Capture**: Save detected frames
- **Equipment Info**: Detailed information on recognized biotech components
- **Live Statistics**: FPS, inference time, CPU/memory usage
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠️ Environment Setup

### Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Webcam access (allows via browser permission)
- For local backend: Python 3.8+, PyTorch, OpenCV, YOLOv8

### Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome  | ✅ Full support |
| Firefox | ✅ Full support |
| Safari  | ✅ Full support |
| Edge    | ✅ Full support |

## 📝 API Endpoints

### Vercel Deployment

- `GET /api/health` - Health check (returns 503 to trigger client-side mode)

### Local Flask Backend

- `POST /api/detect` - Send frame for detection
- `POST /api/start` - Start streaming detection
- `POST /api/stop` - Stop streaming detection
- `GET /api/stats` - Get detection statistics
- `GET /video_feed` - Streaming video feed (MJPEG)

## 🔍 Troubleshooting

### Detection Not Working on Vercel

**Issue**: "Using client-side ML detection (COCO-SSD)"

**Solution**: This is normal! Vercel uses browser-based detection because:
- Flask backend requires persistent Python servers (not available on Vercel)
- COCO-SSD runs directly in your browser
- No data is sent to external servers

### Webcam Permission Denied

1. Check browser privacy settings
2. Ensure HTTPS connection (on Vercel)
3. Allow camera access in browser popup
4. Try incognito/private browsing mode

### Slow Detection

- Client-side detection depends on your device's GPU
- Disable other GPU-intensive applications
- Try a newer browser with better WASM support
- Use local deployment for faster inference

## 📚 Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
- **Client-Side ML**: TensorFlow.js, COCO-SSD
- **Backend (Local)**: Flask, Python, PyTorch, YOLOv8, OpenCV
- **Deployment**: Vercel (static hosting)
- **Hosting**: GitHub Pages + Vercel

## 🎯 Getting Started

### Using on Vercel (Recommended)

1. Visit: https://jagriti2325.github.io/IBCRS/
2. Click "Start Detection" button
3. Allow webcam access when prompted
4. System automatically detects objects in real-time

### Local Development

1. Clone repository
2. Navigate to website folder
3. Install Python requirements: `pip install -r backend/requirements.txt`
4. Run Flask app: `python backend/app.py`
5. Open browser to `http://localhost:5000`

## 📞 Contact

For questions or support:
- Email: skai.futureishere@gmail.com
- Website: https://skaitech.vercel.app/

## 📄 License

MIT License - feel free to use and modify

---

**Status**: ✅ Production Ready

Last Updated: February 2026
