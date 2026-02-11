"""
IBCRS Live Object Detection Web Application
Flask backend for real-time YOLOv8 object detection from webcam
"""

from flask import Flask, render_template, Response, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import threading
import time
from ultralytics import YOLO
import os
import psutil
import sys

# Import configuration from config.py
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config

app = Flask(__name__, template_folder='../frontend', static_folder='../frontend')
CORS(app)

# ============ CONFIGURATION ============
MODEL_PATH = config.MODEL_PATH
CONFIDENCE_THRESHOLD = config.CONFIDENCE_THRESHOLD
IMG_SIZE = config.IMG_SIZE
FRAME_WIDTH = config.FRAME_WIDTH
FRAME_HEIGHT = config.FRAME_HEIGHT
WEBCAM_INDEX = config.WEBCAM_INDEX
TARGET_FPS = config.TARGET_FPS
JPEG_QUALITY = config.JPEG_QUALITY

# ============ GLOBAL VARIABLES ============
model = None
cap = None
frame_lock = threading.Lock()
current_frame = None
detection_stats = {
    'total_detections': 0,
    'inference_time': 0.0,
    'fps': 0.0,
    'cpu_usage': 0.0,
    'memory_usage': 0.0,
    'is_running': False,
    'detected_classes': {}
}
frame_count = 0
fps_start_time = time.time()
fps_counter = 0

# ============ ERROR HANDLING ============
class DetectionError(Exception):
    """Custom exception for detection errors"""
    pass

# ============ HELPER FUNCTIONS ============
def load_model():
    """Load YOLOv8 model"""
    global model
    try:
        if not os.path.exists(MODEL_PATH):
            raise DetectionError(f"Model not found at {MODEL_PATH}")
        model = YOLO(MODEL_PATH)
        return True
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        return False

def update_system_stats():
    """Update CPU and memory usage"""
    detection_stats['cpu_usage'] = psutil.cpu_percent(interval=0.1)
    detection_stats['memory_usage'] = psutil.virtual_memory().percent

def process_frame(frame):
    """Process a single frame with YOLOv8"""
    global detection_stats, frame_count, fps_counter, fps_start_time
    
    try:
        start_time = time.time()
        
        # Run inference
        results = model(
            frame,
            conf=CONFIDENCE_THRESHOLD,
            imgsz=IMG_SIZE,
            verbose=False
        )[0]
        
        inference_ms = (time.time() - start_time) * 1000
        detection_stats['inference_time'] = inference_ms
        
        # Reset detected classes
        detection_stats['detected_classes'] = {}
        detection_stats['total_detections'] = 0
        
        # Draw detections
        annotated_frame = frame.copy()
        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            class_name = model.names[cls_id]
            
            # Update stats
            detection_stats['total_detections'] += 1
            if class_name not in detection_stats['detected_classes']:
                detection_stats['detected_classes'][class_name] = 0
            detection_stats['detected_classes'][class_name] += 1
            
            # Draw bounding box
            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Draw label
            label = f"{class_name} {conf:.2f}"
            cv2.putText(
                annotated_frame,
                label,
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 0),
                2
            )
        
        # Draw inference time
        cv2.putText(
            annotated_frame,
            f"Inference: {inference_ms:.2f}ms",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 255),
            2
        )
        
        # Draw FPS counter
        frame_count += 1
        fps_counter += 1
        current_time = time.time()
        if current_time - fps_start_time >= 1.0:
            detection_stats['fps'] = fps_counter
            fps_counter = 0
            fps_start_time = current_time
        
        cv2.putText(
            annotated_frame,
            f"FPS: {detection_stats['fps']}",
            (10, 70),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 0, 0),
            2
        )
        
        return annotated_frame
        
    except Exception as e:
        print(f"Error processing frame: {str(e)}")
        return frame

def generate_frames():
    """Generate frames from webcam with detection"""
    global current_frame, detection_stats
    
    try:
        cap = cv2.VideoCapture(WEBCAM_INDEX)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)
        cap.set(cv2.CAP_PROP_FPS, 30)
        
        detection_stats['is_running'] = True
        
        while detection_stats['is_running']:
            ret, frame = cap.read()
            
            if not ret:
                break
            
            # Process frame
            annotated_frame = process_frame(frame)
            
            # Update system stats
            update_system_stats()
            
            # Store current frame
            with frame_lock:
                current_frame = annotated_frame.copy()
            
            # Encode frame to JPEG
            ret, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            frame_bytes = buffer.tobytes()
            
            # Yield frame in streaming format
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n'
                   b'Content-Length: ' + str(len(frame_bytes)).encode() + b'\r\n\r\n'
                   + frame_bytes + b'\r\n')
    
    except Exception as e:
        print(f"Error in frame generation: {str(e)}")
        detection_stats['is_running'] = False
    finally:
        cap.release()
        detection_stats['is_running'] = False

# ============ ROUTES ============

@app.route('/')
def index():
    """Serve main page"""
    return render_template('index.html')

@app.route('/component_cam')
def component_cam():
    """Serve camera component page"""
    return render_template('component_cam.html')

@app.route('/component_dronerx')
def component_dronerx():
    """Serve drone receiver component page"""
    return render_template('component_dronerx.html')

@app.route('/component_pir')
def component_pir():
    """Serve PIR sensor component page"""
    return render_template('component_pir.html')

@app.route('/component_sonar')
def component_sonar():
    """Serve sonar sensor component page"""
    return render_template('component_sonar.html')

@app.route('/component_colorimeter')
def component_colorimeter():
    """Serve colorimeter component page"""
    return render_template('component_colorimeter.html')

@app.route('/component_magnetic_stirrer')
def component_magnetic_stirrer():
    """Serve magnetic stirrer component page"""
    return render_template('component_magnetic_stirrer.html')

@app.route('/component_ph_meter')
def component_ph_meter():
    """Serve pH meter component page"""
    return render_template('component_ph_meter.html')

@app.route('/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/stats')
def get_stats():
    """Get detection statistics"""
    return jsonify(detection_stats)

@app.route('/api/start', methods=['POST'])
def start_detection():
    """Start detection"""
    # Ensure model is loaded when starting detection; attempt lazy-load if necessary
    global model
    if model is None:
        loaded = load_model()
        if not loaded:
            return jsonify({'status': 'error', 'message': 'Failed to load model'}), 500

    detection_stats['is_running'] = True
    return jsonify({'status': 'started'})

@app.route('/api/stop', methods=['POST'])
def stop_detection():
    """Stop detection"""
    detection_stats['is_running'] = False
    return jsonify({'status': 'stopped'})

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'detection_running': detection_stats['is_running']
    })

# ============ ERROR HANDLERS ============

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

# ============ INITIALIZATION ============

def initialize_app():
    """Initialize the application"""
    print("Attempting to load YOLOv8 model...")
    loaded = load_model()
    if loaded:
        print("Model loaded successfully!")
    else:
        print("Model not loaded. Server will continue and you can attempt to load the model via the /api/start endpoint.")
    return loaded

# ============ MAIN ============

if __name__ == '__main__':
    # Try to load model, but do not prevent server startup if model loading fails
    initialize_app()
    print("Starting IBCRS Live Detection Server...")
    print("Access the application at: http://localhost:5000")
    app.run(debug=False, host='0.0.0.0', port=5000, threaded=True)
