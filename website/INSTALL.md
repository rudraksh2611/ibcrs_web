# IBCRS Installation Guide

Complete step-by-step installation instructions for different operating systems.

## 🪟 Windows Installation

### Step 1: Check Python Installation
```bash
python --version
```
Should show Python 3.8 or higher. If not, download from https://www.python.org/

### Step 2: Navigate to Website Directory
```bash
cd d:\IBCRS\website
```

### Step 3: Run Startup Script
```bash
start.bat
```

This will automatically:
- Create a virtual environment
- Install all dependencies
- Start the Flask server

**Expected Output:**
```
Loading YOLOv8 model...
Model loaded successfully!
Starting IBCRS Live Detection Server...
Access the application at: http://localhost:5000
```

### Step 4: Open Browser
Navigate to: `http://localhost:5000`

### Manual Installation (if start.bat fails)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r backend\requirements.txt

# Run the server
python backend\app.py
```

---

## 🍎 macOS Installation

### Step 1: Install Dependencies
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python
brew install python3

# Install system dependencies
brew install opencv
```

### Step 2: Navigate to Website Directory
```bash
cd path/to/IBCRS/website
```

### Step 3: Make Startup Script Executable
```bash
chmod +x start.sh
```

### Step 4: Run Startup Script
```bash
./start.sh
```

### Manual Installation

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run the server
python backend/app.py
```

---

## 🐧 Linux Installation (Ubuntu/Debian)

### Step 1: Install System Dependencies
```bash
# Update package manager
sudo apt-get update

# Install Python and dependencies
sudo apt-get install -y python3 python3-pip python3-venv
sudo apt-get install -y libopencv-dev python3-opencv
sudo apt-get install -y libsm6 libxext6 libxrender-dev
```

### Step 2: Navigate to Website Directory
```bash
cd path/to/IBCRS/website
```

### Step 3: Make Startup Script Executable
```bash
chmod +x start.sh
```

### Step 4: Run Startup Script
```bash
./start.sh
```

### Manual Installation

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run the server
python backend/app.py
```

---

## 🐳 Docker Installation (All Platforms)

### Prerequisites
- Docker Desktop installed (https://www.docker.com/products/docker-desktop)
- 4GB RAM minimum
- 2GB disk space

### Step 1: Build Docker Image
```bash
cd path/to/website
docker-compose build
```

### Step 2: Run Docker Container
```bash
docker-compose up
```

### Step 3: Access Application
Open browser to: `http://localhost:5000`

### Stop Docker
```bash
docker-compose down
```

---

## ⚙️ Configuration Before Running

### 1. Update Model Path
Edit `config.py`:
```python
# Line 7
MODEL_PATH = r"D:\IBCRS\yolo8bestfile.pt"  # Update to your model path
```

### 2. (Optional) Adjust Detection Settings
```python
# Confidence threshold (0-1, higher = stricter)
CONFIDENCE_THRESHOLD = 0.4

# Camera resolution
FRAME_WIDTH = 1280
FRAME_HEIGHT = 720

# Server port (change if 5000 is in use)
PORT = 5000
```

---

## 🔍 Verify Installation

### 1. Check Server is Running
Terminal should show:
```
Starting IBCRS Server...
Access the application at: http://localhost:5000
```

### 2. Test in Browser
- Open: `http://localhost:5000`
- Should see IBCRS interface
- Click "Start Detection"
- Should see video feed

### 3. Check API Endpoints
```bash
# In another terminal/command prompt
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "detection_running": false
}
```

---

## 🆘 Troubleshooting

### Python Not Found
**Error:** `'python' is not recognized as an internal or external command`

**Solution:**
1. Install Python from https://www.python.org/
2. Make sure to check "Add Python to PATH" during installation
3. Restart your terminal/command prompt

### Port 5000 Already in Use
**Error:** `Address already in use`

**Solution:**
```bash
# Option 1: Kill process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5000
kill -9 <PID>

# Option 2: Change port in config.py
PORT = 5001  # or any available port
```

### Model Not Found
**Error:** `Model not found at ...`

**Solution:**
1. Check model file exists at the path
2. Update `MODEL_PATH` in `config.py`
3. Use correct path format:
   - Windows: `r"D:\IBCRS\yolo8bestfile.pt"` (raw string)
   - Mac/Linux: `"/path/to/yolo8bestfile.pt"`

### Webcam Not Working
**Error:** No video feed appears

**Solution:**
1. Grant browser permission to access camera
2. Check no other app is using webcam
3. Try different camera index in `config.py`:
   ```python
   WEBCAM_INDEX = 0  # Try 1, 2, etc.
   ```

### Dependencies Installation Fails
**Error:** `pip install` errors

**Solution:**
```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Try installing packages individually
pip install flask
pip install opencv-python
pip install ultralytics
pip install torch torchvision

# Or force specific versions
pip install flask==2.3.3 --force-reinstall
```

### Low FPS / High Latency
**Problem:** Detection is slow

**Solution:**
1. Close other applications
2. Reduce image size in `config.py`:
   ```python
   IMG_SIZE = 416  # Reduce from 640
   ```
3. Use faster model:
   - Try `yolov8n.pt` instead of `yolov8l.pt`
4. Reduce JPEG quality:
   ```python
   JPEG_QUALITY = 60  # Reduce from 80
   ```

---

## 📊 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4GB | 8GB+ |
| Disk Space | 2GB | 5GB+ |
| CPU | Dual Core | Quad Core+ |
| GPU | Optional | NVIDIA GPU for speed |
| Python | 3.8 | 3.10+ |
| Webcam | 720p | 1080p+ |

---

## 🚀 Quick Reference  Commands

### Windows
```bash
# Check Python
python --version

# Create environment
python -m venv venv

# Activate environment
.\venv\Scripts\activate

# Install packages
pip install -r backend\requirements.txt

# Run server
python backend\app.py

# Deactivate environment
deactivate
```

### macOS/Linux
```bash
# Check Python
python3 --version

# Create environment
python3 -m venv venv

# Activate environment
source venv/bin/activate

# Install packages
pip install -r backend/requirements.txt

# Run server
python backend/app.py

# Deactivate environment
deactivate
```

### Docker
```bash
# Build
docker-compose build

# Run
docker-compose up

# Stop
docker-compose down

# View logs
docker-compose logs -f
```

---

## ✅ Installation Checklist

- [ ] Python 3.8+ installed
- [ ] Website folder extracted
- [ ] Model file exists at configured path
- [ ] Virtual environment created
- [ ] Dependencies installed
- [ ] Configuration updated (if needed)
- [ ] Startup script run successfully
- [ ] Browser loads http://localhost:5000
- [ ] Webcam detected and working
- [ ] Detection starts successfully

---

## 📞 Getting Help

1. **Check QUICKSTART.md** - For quick setup issues
2. **Check README.md** - For feature documentation
3. **Check ADVANCED.md** - For customization
4. **Check logs** - Terminal output usually shows errors
5. **Internet search** - Most errors have solutions online

---

## 🎯 Next Steps

1. Verify installation is complete (all items checked above)
2. Read QUICKSTART.md for basic usage
3. Explore frontend interface
4. Read ADVANCED.md for customization options
5. Customize config.py for your needs

---

**Installation Guide for IBCRS**
**Version**: 1.0.0
**Last Updated**: February 2026
