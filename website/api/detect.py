import os
import base64
import json
from io import BytesIO
from PIL import Image
import sys

# Add ultralytics to path if needed
try:
    from ultralytics import YOLO
except ImportError:
    pass

# Model cache
_model = None

def get_model():
    global _model
    if _model is None:
        try:
            from ultralytics import YOLO
            # Try to load the custom model
            model_path = os.path.join(os.path.dirname(__file__), '..', 'model', 'best.pt')
            if os.path.exists(model_path):
                _model = YOLO(model_path)
            else:
                # Fallback to yolov8n if custom model not found
                _model = YOLO('yolov8n.pt')
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    return _model

def handler(request):
    """Handle detection requests"""
    # Check request method
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        }
    
    if request.method != 'POST':
        return {
            'statusCode': 405,
            'body': json.dumps({'error': 'Method not allowed'}),
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
        }
    
    try:
        # Parse request body
        body = json.loads(request.body) if isinstance(request.body, str) else request.body
        
        if 'image' not in body:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'No image provided'}),
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
            }
        
        # Decode base64 image
        image_data = body['image']
        if ',' in image_data:
            # Data URL format: data:image/jpeg;base64,...
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        
        # Load model
        model = get_model()
        
        # Run detection
        results = model(image, conf=0.25)
        
        # Extract detections
        detections = []
        if results and len(results) > 0:
            result = results[0]
            if result.boxes is not None:
                for box in result.boxes:
                    detection = {
                        'class': model.names[int(box.cls[0])],
                        'confidence': float(box.conf[0]),
                        'bbox': [float(x) for x in box.xyxy[0].tolist()]
                    }
                    detections.append(detection)
        
        return {
            'statusCode': 200,
            'body': json.dumps(detections),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}),
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
        }
