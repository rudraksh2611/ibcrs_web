<div align="center">

# IBCRS

### Intelligent BioTech Component Recognition System

**Real-time AI-powered biotech laboratory equipment detection using custom-trained YOLOv8**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deployment](https://img.shields.io/badge/Vercel-Deployed-000?logo=vercel)](https://ibcrs-web.vercel.app/)
[![Python 3.8+](https://img.shields.io/badge/Python-3.8+-3776ab?logo=python&logoColor=white)](https://python.org)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Custom_Trained-00FFFF?logo=yolo)](https://docs.ultralytics.com/)
[![ONNX Runtime](https://img.shields.io/badge/ONNX_Runtime-Web-gray?logo=onnx)](https://onnxruntime.ai/)

[Live Demo](https://ibcrs-web.vercel.app/) · [Report Bug](https://github.com/rudraksh2611/ibcrs_web/issues) · [Request Feature](https://github.com/rudraksh2611/ibcrs_web/issues)

---

</div>

## About

IBCRS is an advanced AI-powered platform that identifies, classifies, and catalogs biotech laboratory equipment in real-time. The system uses a **custom-trained YOLOv8 model** capable of recognizing **7 distinct biotech components** through a live webcam feed — directly in the browser, with no server required.

The model was trained specifically on biotech laboratory equipment and exported to **ONNX format** for high-performance, cross-platform inference. On deployed platforms (Vercel/GitHub Pages), the model runs entirely client-side using **ONNX Runtime Web**, ensuring zero-latency detection and full data privacy.

<br>

## Key Features

| Feature | Description |
|---------|-------------|
| **Real-Time Detection** | Live webcam feed with ~10 FPS inference using a custom YOLOv8 ONNX model |
| **Client-Side ML** | Full model inference in the browser via ONNX Runtime Web — no backend required |
| **Auto-Save History** | Detected components are automatically saved to a persistent panel with confidence scores, timestamps, and detection counts |
| **Component Encyclopedia** | Dedicated detail pages for each component with specifications, advantages/disadvantages, working principles, and tutorial videos |
| **Dual-Mode Architecture** | Runs with a Flask + YOLOv8 backend locally, or as a fully static site with client-side ONNX inference when deployed |
| **Snapshot Capture** | Download the current detection frame as a JPEG image |
| **Performance Dashboard** | Live FPS counter, frame count, detection count, and full system stats (CPU/memory) when running locally |
| **Responsive Design** | Optimized for desktop, tablet, and mobile devices |

<br>

## Detected Components

The custom YOLOv8 model recognizes the following biotech laboratory components:

| # | Component | Code | Category | Description |
|---|-----------|------|----------|-------------|
| 1 | **ESP32-CAM** | CAM-001 | Imaging | Image capturing module for IoT surveillance |
| 2 | **Drone Receiver** | DRX-001 | RF | RF receiver for wireless control and data transmission |
| 3 | **PIR Sensor** | PIR-001 | Sensors | Passive infrared motion detection sensor |
| 4 | **Sonar Sensor** | SON-001 | Sensors | Ultrasonic distance measurement module |
| 5 | **Colorimeter** | CLR-001 | Analytics | Color measurement and spectral analysis instrument |
| 6 | **Magnetic Stirrer** | STIR-001 | Lab Equipment | Laboratory magnetic mixing equipment |
| 7 | **pH Meter** | PH-001 | Analytics | pH measurement instrument for chemical solutions |

<br>

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        IBCRS Platform                           │
├──────────────────────────┬──────────────────────────────────────┤
│   LOCAL (Flask Backend)  │      DEPLOYED (Vercel / Static)      │
│                          │                                      │
│  ┌──────────┐            │            ┌──────────────────┐      │
│  │  Webcam  │────┐       │  ┌──────── │     Webcam       │      │
│  └──────────┘    │       │  │         └──────────────────┘      │
│                  ▼       │  ▼                                   │
│  ┌──────────────────┐    │  ┌──────────────────────────────┐    │
│  │  Flask API        │   │  │  Browser (ONNX Runtime Web)  │    │
│  │  ┌──────────────┐ │   │  │  ┌────────────────────────┐  │    │
│  │  │ YOLOv8 (.pt) │ │   │  │  │  YOLOv8 (.onnx)       │  │    │
│  │  │ PyTorch      │ │   │  │  │  WASM Backend          │  │    │
│  │  │ OpenCV       │ │   │  │  │  Letterbox Preprocess  │  │    │
│  │  └──────────────┘ │   │  │  │  NMS Postprocess       │  │    │
│  └────────┬─────────┘    │  │  └────────────┬───────────┘  │    │
│           ▼              │  │               ▼              │    │
│  ┌──────────────────┐    │  │  ┌────────────────────────┐  │    │
│  │ JSON Detections  │    │  │  │  Detections + History  │  │    │
│  └──────────────────┘    │  │  └────────────────────────┘  │    │
│                          │  └──────────────────────────────┘    │
└──────────────────────────┴──────────────────────────────────────┘
```

<br>

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript, Font Awesome 6 |
| **Client-Side ML** | ONNX Runtime Web 1.17.0, Custom YOLOv8 ONNX model |
| **Backend (Local)** | Python 3.8+, Flask, Flask-CORS |
| **ML / Computer Vision** | Ultralytics YOLOv8, PyTorch, OpenCV, NumPy |
| **Deployment** | Vercel (static + serverless), GitHub Pages |
| **Model Format** | ONNX (Open Neural Network Exchange) |

<br>

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Webcam access
- For local development: **Python 3.8+** with pip

### Option 1: Use the Live Demo (Recommended)

Visit **[ibcrs-web.vercel.app](https://ibcrs-web.vercel.app/)**, click **Start Detection**, allow webcam access, and point your camera at a supported biotech component.

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/rudraksh2611/ibcrs_web.git
cd ibcrs_web

# Install Python dependencies
pip install -r website/backend/requirements.txt

# Start the Flask server
python website/backend/app.py
```

Open **http://localhost:5000** in your browser.

### Option 3: One-Click Start (Windows)

```bash
cd website
start.bat
```

This script automatically creates a virtual environment, installs all dependencies, and launches the server.

<br>

## Project Structure

```
IBCRS/
├── README.md                          # This file
├── vercel.json                        # Root Vercel deployment config
├── .vercelignore                      # Vercel build exclusions
├── api/
│   └── health.js                      # Serverless health check endpoint
│
└── website/
    ├── package.json                   # Project metadata
    ├── vercel.json                    # Website-level Vercel config
    ├── start.bat                      # Windows startup script
    ├── start.sh                       # Linux/macOS startup script
    ├── setup.py                       # Interactive setup wizard
    │
    ├── backend/
    │   ├── app.py                     # Flask application (routes, detection API)
    │   └── requirements.txt           # Python dependencies
    │
    ├── api/
    │   └── health.js                  # Serverless health check (website-level)
    │
    └── frontend/
        ├── index.html                 # Main SPA (Home, Detection, About, etc.)
        ├── about.html                 # Standalone about page
        ├── equipment.json             # Component metadata database
        ├── component_cam.html         # ESP32-CAM detail page
        ├── component_colorimeter.html # Colorimeter detail page
        ├── component_dronerx.html     # Drone Receiver detail page
        ├── component_magnetic_stirrer.html
        ├── component_ph_meter.html    # pH Meter detail page
        ├── component_pir.html         # PIR Sensor detail page
        ├── component_sonar.html       # Sonar Sensor detail page
        ├── css/
        │   └── style.css              # Global styles (~1,400 lines)
        ├── js/
        │   └── main.js                # Core detection logic (~1,150 lines)
        ├── models/
        │   └── best.onnx              # Custom-trained YOLOv8 ONNX model
        └── assets/
            ├── logo.svg               # IBCRS logo
            └── screenshots/           # UI screenshots (SVG)
```

<br>

## API Reference

### Vercel (Deployed)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Returns `503` to signal client-side detection mode |

### Flask (Local)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check and model status |
| `POST` | `/api/detect` | Send a base64 frame for YOLOv8 detection |
| `POST` | `/api/start` | Start streaming detection |
| `POST` | `/api/stop` | Stop streaming detection |
| `GET` | `/api/stats` | Real-time stats (FPS, inference time, CPU, memory) |
| `GET` | `/video_feed` | MJPEG video stream with detection overlays |

<br>

## How It Works

### Client-Side Detection Pipeline (Deployed)

```
Webcam Frame
    │
    ▼
Canvas Capture (raw pixels)
    │
    ▼
Letterbox Preprocessing
├── Resize maintaining aspect ratio
├── Pad to 640×640 with gray borders
└── Normalize to [0, 1] Float32 NCHW tensor
    │
    ▼
ONNX Runtime Web Inference
├── WASM backend
├── YOLOv8 forward pass
└── Output: [1, 11, 8400] tensor
    │
    ▼
Postprocessing
├── Transpose to [8400, 11] (per-anchor)
├── Extract class scores + bounding boxes
├── Apply confidence threshold (0.25)
└── Non-Maximum Suppression (IoU 0.45)
    │
    ▼
Display Results
├── Live Detections panel (real-time)
├── Saved Components panel (auto-saved)
└── Toast notification on new detection
```

### Model Details

| Property | Value |
|----------|-------|
| Architecture | YOLOv8 (Ultralytics) |
| Input Size | 640 × 640 px |
| Output Shape | [1, 11, 8400] |
| Classes | 7 (Cam, DroneRx, PIR, Sonar, Colorimeter, Magnetic Stirrer, pH meter) |
| Format | ONNX (exported from PyTorch .pt) |
| Confidence Threshold | 0.25 |
| IoU Threshold (NMS) | 0.45 |
| Preprocessing | Letterbox (aspect-ratio preserving) |

<br>

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Google Chrome | Fully Supported |
| Mozilla Firefox | Fully Supported |
| Microsoft Edge | Fully Supported |
| Safari | Fully Supported |

> WebAssembly (WASM) support is required for client-side ONNX inference. All modern browsers support this.

<br>

## Troubleshooting

<details>
<summary><strong>Webcam permission denied</strong></summary>

1. Check browser privacy settings and allow camera access for the site
2. Ensure the site is served over HTTPS (or localhost)
3. Close other applications that may be using the camera
4. Try an incognito/private browsing window
</details>

<details>
<summary><strong>Detection seems slow</strong></summary>

- Client-side inference speed depends on your device hardware
- Close GPU-intensive tabs or applications
- Use Chrome for best WASM performance
- For faster inference, run locally with the Flask backend and a GPU
</details>

<details>
<summary><strong>Model not loading on deployed site</strong></summary>

- Hard refresh the page (`Ctrl + Shift + R`) to bypass browser cache
- Check browser console for errors (`F12` → Console tab)
- Verify the `models/best.onnx` file is accessible at `/models/best.onnx`
</details>

<details>
<summary><strong>"No backend available" message</strong></summary>

This is expected behavior on Vercel/GitHub Pages. The system automatically falls back to client-side ONNX detection. No action needed.
</details>

<br>

## Authors

<table>
  <tr>
    <td align="center">
      <strong>Jagriti Arora</strong><br>
      4th Year Undergraduate<br>
      <em>AI/ML · Python · Computer Vision</em>
    </td>
    <td align="center">
      <strong>Rudraksh Singh Bhadauria</strong><br>
      4th Year Undergraduate<br>
      <em>AI/ML · Backend · Full Stack</em>
    </td>
  </tr>
</table>

<br>

## Contact

- **Email**: [skai.futureishere@gmail.com](mailto:skai.futureishere@gmail.com)
- **Website**: [skaitech.vercel.app](https://skaitech.vercel.app/)

<br>

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**Built with YOLOv8 and ONNX Runtime Web**

If this project helped you, consider giving it a star.

</div>
