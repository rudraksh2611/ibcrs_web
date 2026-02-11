# IBCRS Website Project Structure

A complete professional web application for real-time object detection using YOLOv8.

## 📁 Directory Structure

```
website/
│
├── backend/                          # Python Flask backend
│   ├── app.py                        # Main Flask application with detection logic
│   └── requirements.txt              # Python dependencies
│
├── frontend/                         # Web interface
│   ├── index.html                    # Main HTML page
│   ├── css/
│   │   └── style.css                 # Professional styling (modern design)
│   ├── js/
│   │   └── main.js                   # Frontend logic and API integration
│   └── assets/                       # Images and other assets (expandable)
│
├── config.py                         # Configuration file (centralized settings)
│
├── README.md                         # Complete documentation
├── QUICKSTART.md                     # Quick setup guide (60 seconds)
├── ADVANCED.md                       # Advanced features and customization
├── INDEX.md                          # This file
│
├── start.bat                         # Windows startup script
├── start.sh                          # Linux/macOS startup script
│
├── Dockerfile                        # Docker container configuration
├── docker-compose.yml                # Docker Compose for orchestration
│
└── .gitignore                        # Git ignore configuration
```

## 🗂️ File Descriptions

### Backend Files

#### `backend/app.py`
- **Purpose**: Main Flask application
- **Key Features**:
  - YOLOv8 model loading
  - Real-time webcam detection
  - Video streaming endpoint (`/video_feed`)
  - RESTful API endpoints
  - System statistics tracking
  - Error handling

#### `backend/requirements.txt`
- **Purpose**: Python dependencies
- **Includes**:
  - Flask (web framework)
  - OpenCV (computer vision)
  - YOLOv8/Ultralytics (detection model)
  - PyTorch (deep learning)
  - psutil (system monitoring)

### Frontend Files

#### `frontend/index.html`
- **Purpose**: Single-page application
- **Sections**:
  - Navigation bar
  - Hero section (landing page)
  - Live detection section
  - Statistics dashboard
  - About section
  - Footer

#### `frontend/css/style.css`
- **Purpose**: Professional responsive design
- **Features**:
  - Modern gradient design
  - Smooth animations
  - Responsive grid layouts
  - Dark theme with accent colors
  - Hover effects and transitions
  - Mobile-friendly media queries

#### `frontend/js/main.js`
- **Purpose**: Frontend interactivity and API communication
- **Features**:
  - Start/Stop detection
  - Real-time statistics updates
  - Video feed management
  - Snapshot capture
  - Error handling and notifications
  - Navigation handling

### Configuration Files

#### `config.py`
- **Purpose**: Centralized application configuration
- **Sections**:
  - Model settings (path, confidence, size)
  - Webcam settings (resolution, FPS)
  - Server settings (host, port)
  - Performance tuning
  - Logging configuration
  - Advanced options

#### `README.md`
- **Contents**:
  - Features overview
  - Installation instructions
  - Configuration guide
  - API documentation
  - Troubleshooting
  - Technology stack
  - Performance benchmarks

#### `QUICKSTART.md`
- **Contents**:
  - 60-second setup guide
  - Basic usage instructions
  - Troubleshooting quick fixes
  - Performance monitoring tips

#### `ADVANCED.md`
- **Contents**:
  - API integration examples
  - Custom model training
  - Performance optimization
  - Multi-webcam support
  - Deployment options
  - Mobile app integration
  - Testing and monitoring

### Startup Scripts

#### `start.bat` (Windows)
- Checks Python installation
- Creates virtual environment
- Installs dependencies
- Starts Flask server
- Opens browser automatically

#### `start.sh` (Linux/macOS)
- Same functionality as `start.bat`
- Bash script format
- Requires `chmod +x` to execute

### Container Files

#### `Dockerfile`
- Docker container configuration
- Based on Python 3.10
- Includes system dependencies
- Exposes port 5000
- Flexible for GPU support

#### `docker-compose.yml`
- Orchestrates Docker container
- Sets environment variables
- Mounts volumes for models
- Restart policy
- Optional GPU support

## 🚀 Usage Workflow

### Initial Setup
1. Modify `config.py` with your settings
2. Ensure model file exists at `MODEL_PATH`
3. Run startup script (Windows: `start.bat`, Others: `./start.sh`)

### Running the Application
```
[User runs startup script]
    ↓
[Python venv created and activated]
    ↓
[Dependencies installed]
    ↓
[Flask server starts on localhost:5000]
    ↓
[Browser opens to web interface]
    ↓
[User clicks Start Detection]
    ↓
[Webcam feed streams with real-time detection]
```

### File Modification for Customization

**To modify detection behavior:**
- Edit `config.py` (confidence threshold, image size, etc.)

**To change UI appearance:**
- Edit `frontend/css/style.css` (colors, fonts, layouts)

**To add new features:**
- Modify `frontend/js/main.js` for frontend
- Modify `backend/app.py` for backend logic

## 📊 Key Components

### Frontend Components

1. **Navigation Bar**
   - Logo and branding
   - Section links
   - Sticky positioning

2. **Hero Section**
   - Welcome message
   - Call-to-action button
   - Animated background

3. **Detection Panel**
   - Live video feed
   - Control buttons (Start, Stop, Snapshot)
   - Status indicator

4. **Statistics Panel**
   - Real-time metrics
   - Detected classes breakdown
   - System information

5. **Advanced Stats Section**
   - Feature showcase
   - Technology benefits

6. **About Section**
   - Project description
   - Technology stack
   - Key features list

### Backend Components

1. **Model Manager**
   - Loads YOLOv8 model
   - Handles model initialization
   - Error handling for missing models

2. **Frame Processor**
   - Captures frames from webcam
   - Runs inference
   - Draws bounding boxes
   - Calculates metrics

3. **Statistics Tracker**
   - FPS calculation
   - Inference time measurement
   - System resource monitoring
   - Detection counting

4. **API Server**
   - RESTful endpoints
   - Video streaming
   - Real-time statistics
   - Health checks

## 🔌 API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/start` | Start object detection |
| POST | `/api/stop` | Stop object detection |
| GET | `/api/stats` | Get current statistics |
| GET | `/api/health` | Server health check |
| GET | `/video_feed` | Stream video with detection |
| GET | `/` | Load main web interface |

## 🔧 Configuration Quick Reference

```python
# Model
MODEL_PATH = r"path\to\model.pt"
CONFIDENCE_THRESHOLD = 0.4  # 0-1

# Hardware
FRAME_WIDTH = 1280
FRAME_HEIGHT = 720
TARGET_FPS = 30

# Server
HOST = '0.0.0.0'
PORT = 5000

# Performance
JPEG_QUALITY = 80  # 1-100
IMG_SIZE = 640  # Detection model input
```

## 📈 Performance Optimization Tips

### For Better Speed
- Reduce `IMG_SIZE` in config
- Lower `JPEG_QUALITY`
- Use smaller model (yolov8n)
- Increase `FRAME_SKIP_INTERVAL`

### For Better Accuracy
- Increase `IMG_SIZE`
- Increase `CONFIDENCE_THRESHOLD`
- Use larger model (yolov8l)

## 🐳 Docker Deployment

**Build and run:**
```bash
docker-compose up --build
```

**Access at:** `http://localhost:5000`

## 📋 File Checklist

- [x] Backend Flask app (`app.py`)
- [x] Python dependencies (`requirements.txt`)
- [x] Frontend HTML (`index.html`)
- [x] CSS styling (`style.css`)
- [x] JavaScript logic (`main.js`)
- [x] Configuration file (`config.py`)
- [x] Documentation (`README.md`, `QUICKSTART.md`, `ADVANCED.md`)
- [x] Startup scripts (`start.bat`, `start.sh`)
- [x] Docker files (`Dockerfile`, `docker-compose.yml`)
- [x] Git configuration (`.gitignore`)
- [x] Project index (this file)

## 🔗 Related Files

Original webcam script integrated:
- Source: `d:\IBCRS\ml\webcam.py`
- Status: Core functionality extracted and enhanced for web application

## 📝 Version History

**v1.0.0** - Initial Release
- Full web interface integration
- Professional design with animations
- Complete API endpoints
- Comprehensive documentation
- Docker support
- Multi-platform startup scripts

## 🎯 Next Steps

1. Review `QUICKSTART.md` for immediate setup
2. Customize `config.py` with your settings
3. Run startup script to launch application
4. Visit `localhost:5000` in browser
5. Refer to `ADVANCED.md` for customization

---

**Project**: IBCRS (Intelligent Biometric & Crop Recognition System)
**Last Updated**: February 2026
**Status**: Production Ready
