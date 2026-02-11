"""
IBCRS Configuration Template
Copy this file to config.py and customize for your setup
"""

# =============== MODEL CONFIGURATION ===============

# Path to your YOLOv8 model file
# Available models: yolov8n.pt, yolov8s.pt, yolov8m.pt, yolov8l.pt, yolov8x.pt
# Or use custom trained models
MODEL_PATH = r"D:\IBCRS\yolo8bestfile.pt"

# Detection confidence threshold (0.0 to 1.0)
# Higher value = fewer detections but higher confidence
# Lower value = more detections but lower confidence
CONFIDENCE_THRESHOLD = 0.4

# Model input size (width and height should be multiples of 32)
# Smaller size = faster but less accurate
# Larger size = slower but more accurate
# Common values: 416, 512, 640, 1024
IMG_SIZE = 640

# =============== WEBCAM CONFIGURATION ===============

# Webcam device index (usually 0 for default camera)
WEBCAM_INDEX = 0

# Camera resolution in pixels
FRAME_WIDTH = 1280
FRAME_HEIGHT = 720

# Target frames per second
TARGET_FPS = 30

# =============== SERVER CONFIGURATION ===============

# Server host address
# Use '0.0.0.0' for network access (current setting)
# Use '127.0.0.1' for localhost only
HOST = '0.0.0.0'

# Server port
PORT = 5000

# Enable debug mode (set to False in production)
DEBUG = False

# =============== VIDEO ENCODING ===============

# JPEG quality for streaming (1-100)
# Higher quality = larger file size and more bandwidth
JPEG_QUALITY = 80

# =============== STATISTICS UPDATE ===============

# Interval for updating statistics (in milliseconds)
STATS_UPDATE_INTERVAL = 500

# =============== PERFORMANCE TUNING ===============

# Enable multi-threading (recommended)
MULTI_THREADED = True

# Maximum frame buffer size
FRAME_BUFFER_SIZE = 1

# =============== LOGGING ===============

# Log level: 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
LOG_LEVEL = 'INFO'

# Enable file logging
FILE_LOGGING = False

# Log file path
LOG_FILE = 'ibcrs.log'

# =============== CORS CONFIGURATION ===============

# Allow CORS from these origins
# Use '*' to allow all origins (NOT recommended for production)
CORS_ORIGINS = '*'

# =============== HARDWARE ACCELERATION ===============

# Use GPU if available (requires CUDA)
USE_GPU = True

# =============== ADVANCED ===============

# Number of detection threads
DETECTION_THREADS = 1

# Frame skip interval (process every Nth frame)
# Set to 1 to process every frame, 2 to skip every other, etc.
FRAME_SKIP_INTERVAL = 1

# Maximum workers for concurrent tasks
MAX_WORKERS = 4
