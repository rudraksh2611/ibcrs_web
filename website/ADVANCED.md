# IBCRS - Advanced Features & Customization

## 📡 API Integration

### Using cURL

**Start Detection:**
```bash
curl -X POST http://localhost:5000/api/start \
  -H "Content-Type: application/json"
```

**Stop Detection:**
```bash
curl -X POST http://localhost:5000/api/stop \
  -H "Content-Type: application/json"
```

**Get Statistics:**
```bash
curl http://localhost:5000/api/stats
```

**Response Example:**
```json
{
  "total_detections": 5,
  "inference_time": 12.34,
  "fps": 30,
  "cpu_usage": 45.2,
  "memory_usage": 60.1,
  "is_running": true,
  "detected_classes": {
    "person": 2,
    "car": 3
  }
}
```

---

## 🐍 Python Integration

### Using Requests Library

```python
import requests

API_URL = "http://localhost:5000"

# Start detection
response = requests.post(f"{API_URL}/api/start")
print(response.json())

# Get statistics
stats = requests.get(f"{API_URL}/api/stats").json()
print(f"FPS: {stats['fps']}")
print(f"Inference Time: {stats['inference_time']}ms")
print(f"Detections: {stats['total_detections']}")

# Stop detection
requests.post(f"{API_URL}/api/stop")
```

---

## 🎯 Custom Model Training

### Using YOLOv8 with Your Data

```python
from ultralytics import YOLO

# Load a pretrained model
model = YOLO('yolov8m.pt')

# Train on your custom dataset
results = model.train(
    data='dataset/data.yaml',
    epochs=100,
    imgsz=640,
    device=0,  # GPU device
    patience=20
)

# Save the trained model
model.save('custom_model.pt')
```

---

## 📊 Performance Optimization

### GPU Acceleration

**Check if GPU is available:**
```python
import torch
print(torch.cuda.is_available())
print(torch.cuda.get_device_name(0))
```

**Enable GPU in Flask app:**
```python
import torch
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = YOLO(MODEL_PATH).to(device)
```

### Model Optimization

**Quantization (reduce model size):**
```python
from ultralytics import YOLO

model = YOLO('yolov8m.pt')
model.export(format='tflite')  # Export as TFLite
model.export(format='onnx')    # Export as ONNX
```

---

## 🎬 Video File Input

Modify `backend/app.py` to process video files:

```python
def process_video_file(video_path):
    cap = cv2.VideoCapture(video_path)
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        # Process frame
        results = model(frame, conf=CONFIDENCE_THRESHOLD)[0]
        # ... rest of processing
        
    cap.release()
```

---

## 📹 Multi-Webcam Support

**Access different cameras:**
```python
# Camera 0 (default)
cap = cv2.VideoCapture(0)

# Camera 1
cap = cv2.VideoCapture(1)

# Network camera (IP webcam)
cap = cv2.VideoCapture('http://192.168.1.100:8080/video')
```

---

## 💾 Recording and Playback

### Record Detection Output

```python
import cv2

def setup_recorder(frame_width, frame_height, fps=30):
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(
        'output.mp4',
        fourcc,
        fps,
        (frame_width, frame_height)
    )
    return out

# In detection loop:
out.write(annotated_frame)

# Clean up:
out.release()
```

---

## 🔍 Advanced Analytics

### Track Objects Across Frames

```python
from collections import defaultdict

object_tracks = defaultdict(list)

for detection in detections:
    # Calculate centroid
    cx = (x1 + x2) // 2
    cy = (y1 + y2) // 2
    
    # Track object
    object_id = find_matching_track(cx, cy)
    object_tracks[object_id].append((cx, cy))
```

### Generate Reports

```python
import json
from datetime import datetime

report = {
    'timestamp': datetime.now().isoformat(),
    'total_frames_processed': frame_count,
    'average_fps': total_fps / frame_count,
    'total_detections': total_detections,
    'detected_classes': detected_classes,
    'session_duration': elapsed_time
}

with open('detection_report.json', 'w') as f:
    json.dump(report, f, indent=4)
```

---

## 🔐 Authentication & Security

### Add Flask Authentication

```python
from flask_httpauth import HTTPBasicAuth

auth = HTTPBasicAuth()

users = {
    "admin": "secure_password_here"
}

@auth.verify_password
def verify_password(username, password):
    if username in users and users[username] == password:
        return username
    return False

@app.route('/api/stats')
@auth.login_required
def get_stats():
    # Protected endpoint
    return jsonify(detection_stats)
```

---

## 🌐 Deployment Options

### Heroku Deployment

1. Create `Procfile`:
```
web: python backend/app.py
```

2. Create `.env`:
```
FLASK_ENV=production
PORT=5000
```

3. Deploy:
```bash
heroku login
heroku create your-app-name
git push heroku main
```

### AWS EC2

1. SSH into instance
2. Install Python and dependencies
3. Run with gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 backend.app:app
```

### Local Network Access

Modify `app.py`:
```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)  # Accessible from network
```

Access from other computers: `http://<your-ip>:5000`

---

## 📱 Mobile App Integration

### REST API Call Example (JavaScript)

```javascript
const apiUrl = 'http://your-server:5000';

async function getDetectionStats() {
    const response = await fetch(`${apiUrl}/api/stats`);
    const stats = await response.json();
    return stats;
}

// Use in React/Vue/Angular app
const [stats, setStats] = useState(null);
useEffect(() => {
    const interval = setInterval(async () => {
        const data = await getDetectionStats();
        setStats(data);
    }, 1000);
    
    return () => clearInterval(interval);
}, []);
```

---

## 🧪 Testing

### Unit Tests

```python
import unittest
from backend.app import app

class TestDetectionAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
    
    def test_health_check(self):
        response = self.app.get('/api/health')
        assert response.status_code == 200
    
    def test_start_detection(self):
        response = self.app.post('/api/start')
        assert response.status_code == 200

if __name__ == '__main__':
    unittest.main()
```

Run tests:
```bash
python -m unittest tests/test_api.py
```

---

## 📈 Monitoring and Logging

### Enable Detailed Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ibcrs.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)
```

### Monitor System Resources

```python
import psutil
import time

def monitor_system():
    while True:
        cpu = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory().percent
        
        logger.info(f"CPU: {cpu}% | Memory: {memory}%")
        time.sleep(60)
```

---

## 🚀 Performance Benchmarking

### Benchmark Different Models

```python
import time
from ultralytics import YOLO

models = ['yolov8n.pt', 'yolov8s.pt', 'yolov8m.pt']

for model_name in models:
    model = YOLO(model_name)
    
    start = time.time()
    results = model(frame)
    inference_time = (time.time() - start) * 1000
    
    print(f"{model_name}: {inference_time:.2f}ms")
```

---

## 💡 Tips & Tricks

1. **Reduce Latency**: Use smaller model (yolov8n) with lower resolution
2. **Improve Accuracy**: Use larger model (yolov8l) with higher confidence threshold
3. **Save Bandwidth**: Reduce JPEG quality to 60-70
4. **Multi-GPU**: Distribute processing across multiple GPUs
5. **Caching**: Cache frequently used frames to reduce processing

---

## 📚 Additional Resources

- **YOLOv8 Docs**: https://docs.ultralytics.com/
- **OpenCV Docs**: https://docs.opencv.org/
- **Flask Documentation**: https://flask.palletsprojects.com/
- **PyTorch Documentation**: https://pytorch.org/docs/

---

**Last Updated**: February 2026
