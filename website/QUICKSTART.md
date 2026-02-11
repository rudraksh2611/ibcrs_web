# IBCRS - QUICK START GUIDE

## ⚡ 60-Second Setup

### Windows
1. Open Command Prompt and navigate to the website folder
2. Double-click `start.bat`
3. Wait for "Starting IBCRS Server..." message
4. Open browser to **http://localhost:5000**

### macOS/Linux
1. Open Terminal and navigate to the website folder
2. Run: `chmod +x start.sh` (first time only)
3. Run: `./start.sh`
4. Open browser to **http://localhost:5000**

---

## 🎯 Basic Usage

### Start Detection
- Click the **green "Start" button** on the page
- Wait for video feed to appear
- Object detection will start automatically

### Stop Detection
- Click the **red "Stop" button**
- Video stream will terminate

### Capture Screenshot
- Click **"Snapshot"** button while detection is running
- Image saves to your Downloads folder

---

## 👀 What You'll See

- **Live Video Feed**: Real-time detection with bounding boxes
- **Performance Metrics**: FPS, inference time, CPU/Memory usage
- **Detection Summary**: Count of detected objects by class

---

## ⚠️ Troubleshooting

### "Cannot connect to server"
- Make sure the Flask server is running (check terminal output)
- Try refreshing browser (Ctrl+R or Cmd+R)

### "Model not found"
- Edit `backend/app.py` line 10
- Update `MODEL_PATH` to correct model location
- Restart the server

### "Low FPS"
- Close other applications
- Edit `config.py` and reduce `IMG_SIZE` to 416
- Use smaller model (yolov8n instead of yolov8l)

---

## 📊 Monitor Performance

**Inference Time**: How long detection takes per frame (lower = faster)
**FPS**: Frames per second (higher = smoother)
**CPU/Memory**: System resource usage

---

## 🔧 Configuration

Edit `config.py` to customize:
- Model path and confidence
- Camera resolution
- Server port
- Performance settings

---

## 📚 Full Documentation

See `README.md` for complete setup, API documentation, and advanced features.

---

**Need Help?** Check the troubleshooting section in README.md
