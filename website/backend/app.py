"""
IBCRS Live Object Detection Web Application
Flask backend for real-time YOLOv8 object detection from webcam
"""

from flask import Flask, render_template, send_from_directory, request, jsonify
from flask_cors import CORS
import os
import base64
import json

# Get the base directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
PROJECT_ROOT = os.path.dirname(BASE_DIR)
EQUIPMENT_JSON = os.path.join(BASE_DIR, 'frontend', 'equipment.json')

# Check multiple paths for custom model (priority order)
MODEL_CANDIDATES = [
    os.path.join(PROJECT_ROOT, 'model', 'best.pt'),
    os.path.join(PROJECT_ROOT, 'best (4).pt'),
    os.path.join(PROJECT_ROOT, 'best.pt'),
]

app = Flask(__name__, template_folder=FRONTEND_DIR, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

# Lazy-load model
_model = None
_model_name = None  # 'IBCRS Custom' or 'YOLOv8n (COCO)'
_equipment_db = {}

def get_model():
    global _model, _model_name
    if _model is None:
        try:
            from ultralytics import YOLO
            import cv2
            custom_path = None
            for p in MODEL_CANDIDATES:
                if os.path.exists(p):
                    custom_path = p
                    break
            if custom_path:
                _model = YOLO(custom_path)
                _model_name = 'IBCRS Custom (Backend)'
            else:
                _model = YOLO('yolov8n.pt')  # COCO fallback
                _model_name = 'YOLOv8n COCO (fallback)'
        except Exception as e:
            raise RuntimeError(f"Model load failed: {e}")
    return _model

def load_equipment():
    global _equipment_db
    if not _equipment_db and os.path.exists(EQUIPMENT_JSON):
        with open(EQUIPMENT_JSON, 'r', encoding='utf-8') as f:
            _equipment_db = {k.lower(): v for k, v in json.load(f).items()}
    return _equipment_db

@app.route('/api/health')
def api_health():
    try:
        get_model()
        return jsonify({
            "status": "ok",
            "model_loaded": True,
            "model_name": _model_name or "IBCRS Custom (Backend)"
        })
    except Exception as e:
        return jsonify({"status": "error", "model_loaded": False, "message": str(e)})

@app.route('/api/detect', methods=['POST'])
def api_detect():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "Missing image"}), 400
        import cv2
        import numpy as np
        img_b64 = data['image']
        if ',' in img_b64:
            _, img_b64 = img_b64.split(',', 1)
        raw = base64.b64decode(img_b64)
        arr = np.frombuffer(raw, dtype=np.uint8)
        frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if frame is None:
            return jsonify({"error": "Invalid image"}), 400
        model = get_model()
        results = model(frame, conf=0.3)
        equip = load_equipment()
        detections = []
        if results and len(results) > 0:
            r = results[0]
            for box in r.boxes:
                cls_id = int(box.cls[0])
                label = r.names.get(cls_id, f"class_{cls_id}")
                conf = float(box.conf[0])
                details = equip.get(label.lower())
                detections.append({
                    "class": label, "label": label, "confidence": conf,
                    "details": details
                })
        return jsonify(detections)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    """Serve main page"""
    return render_template('index.html')

@app.route('/about.html')
def about():
    """Serve about page"""
    return render_template('about.html')

@app.route('/about')
def about_redirect():
    """Redirect to about.html"""
    return render_template('about.html')

# Component pages
@app.route('/component_cam.html')
def component_cam():
    return render_template('component_cam.html')

@app.route('/component_colorimeter.html')
def component_colorimeter():
    return render_template('component_colorimeter.html')

@app.route('/component_dronerx.html')
def component_dronerx():
    return render_template('component_dronerx.html')

@app.route('/component_magnetic_stirrer.html')
def component_magnetic_stirrer():
    return render_template('component_magnetic_stirrer.html')

@app.route('/component_ph_meter.html')
def component_ph_meter():
    return render_template('component_ph_meter.html')

@app.route('/component_pir.html')
def component_pir():
    return render_template('component_pir.html')

@app.route('/component_sonar.html')
def component_sonar():
    return render_template('component_sonar.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files and other assets"""
    file_path = os.path.join(FRONTEND_DIR, filename)
    
    # Check if file exists
    if os.path.isfile(file_path):
        return send_from_directory(FRONTEND_DIR, filename)
    
    # If file not found, return 404
    return "File not found", 404

if __name__ == '__main__':
    print("Starting IBCRS Server...")
    print(f"Frontend directory: {FRONTEND_DIR}")
    app.run(debug=True, host='localhost', port=5000, threaded=True)
