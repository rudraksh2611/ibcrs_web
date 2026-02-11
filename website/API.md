# IBCRS API Documentation

Complete REST API reference for IBCRS backend.

## Base URL
```
http://localhost:5000
```

---

## Endpoints

### 1. Video Feed Stream

**Endpoint:** `/video_feed`  
**Method:** GET  
**Returns:** MJPEG stream

**Description:** Streams live video frames with real-time object detection.

**Example:**
```html
<img src="http://localhost:5000/video_feed" alt="Live Feed">
```

**JavaScript:**
```javascript
const videoFeed = document.getElementById('video-feed');
videoFeed.src = 'http://localhost:5000/video_feed';
```

---

### 2. Start Detection

**Endpoint:** `/api/start`  
**Method:** POST  
**Content-Type:** application/json

**Description:** Starts the object detection process.

**Request:**
```bash
curl -X POST http://localhost:5000/api/start \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "status": "started"
}
```

**JavaScript:**
```javascript
fetch('http://localhost:5000/api/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(response => response.json())
.then(data => console.log(data));
```

---

### 3. Stop Detection

**Endpoint:** `/api/stop`  
**Method:** POST  
**Content-Type:** application/json

**Description:** Stops the object detection process.

**Request:**
```bash
curl -X POST http://localhost:5000/api/stop \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "status": "stopped"
}
```

---

### 4. Get Statistics

**Endpoint:** `/api/stats`  
**Method:** GET

**Description:** Returns current detection statistics and performance metrics.

**Request:**
```bash
curl http://localhost:5000/api/stats
```

**Response (Example):**
```json
{
  "total_detections": 5,
  "inference_time": 15.23,
  "fps": 30,
  "cpu_usage": 45.2,
  "memory_usage": 62.1,
  "is_running": true,
  "detected_classes": {
    "person": 2,
    "car": 1,
    "plant": 2
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| total_detections | int | Number of objects detected in current frame |
| inference_time | float | Time taken for detection (milliseconds) |
| fps | int | Frames processed per second |
| cpu_usage | float | CPU usage percentage (0-100) |
| memory_usage | float | Memory usage percentage (0-100) |
| is_running | boolean | Whether detection is active |
| detected_classes | object | Count of each detected object class |

**JavaScript:**
```javascript
async function getStats() {
  try {
    const response = await fetch('http://localhost:5000/api/stats');
    const stats = await response.json();
    console.log(stats);
    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

// Update every 500ms
setInterval(getStats, 500);
```

---

### 5. Health Check

**Endpoint:** `/api/health`  
**Method:** GET

**Description:** Returns server health status and component information.

**Request:**
```bash
curl http://localhost:5000/api/health
```

**Response (Example):**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "detection_running": false
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| status | string | Server status ("healthy" or "error") |
| model_loaded | boolean | Whether YOLOv8 model is loaded |
| detection_running | boolean | Whether detection is currently active |

**JavaScript:**
```javascript
async function checkHealth() {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const health = await response.json();
    
    if (health.status === 'healthy') {
      console.log('✓ Server is healthy');
    } else {
      console.log('✗ Server has issues');
    }
    
    return health;
  } catch (error) {
    console.error('Server unavailable:', error);
  }
}
```

---

## Complete Python Example

```python
import requests
import time
import json

API_BASE = "http://localhost:5000"

class IBCRSClient:
    def __init__(self, base_url=API_BASE):
        self.base_url = base_url
    
    def start_detection(self):
        """Start detection"""
        response = requests.post(f"{self.base_url}/api/start")
        return response.json()
    
    def stop_detection(self):
        """Stop detection"""
        response = requests.post(f"{self.base_url}/api/stop")
        return response.json()
    
    def get_stats(self):
        """Get current statistics"""
        response = requests.get(f"{self.base_url}/api/stats")
        return response.json()
    
    def get_health(self):
        """Check server health"""
        response = requests.get(f"{self.base_url}/api/health")
        return response.json()
    
    def get_video_feed_url(self):
        """Get video feed URL"""
        return f"{self.base_url}/video_feed"

# Usage Example
if __name__ == "__main__":
    client = IBCRSClient()
    
    # Check health
    print("Checking server health...")
    health = client.get_health()
    print(json.dumps(health, indent=2))
    
    # Start detection
    print("\nStarting detection...")
    result = client.start_detection()
    print(json.dumps(result, indent=2))
    
    time.sleep(2)
    
    # Get statistics
    print("\nFetching statistics...")
    stats = client.get_stats()
    print(json.dumps(stats, indent=2))
    
    # Stop detection
    print("\nStopping detection...")
    result = client.stop_detection()
    print(json.dumps(result, indent=2))
```

---

## Complete JavaScript Example

```javascript
class IBCRSClient {
    constructor(baseUrl = 'http://localhost:5000') {
        this.baseUrl = baseUrl;
    }

    async startDetection() {
        const response = await fetch(`${this.baseUrl}/api/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    }

    async stopDetection() {
        const response = await fetch(`${this.baseUrl}/api/stop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return await response.json();
    }

    async getStats() {
        const response = await fetch(`${this.baseUrl}/api/stats`);
        return await response.json();
    }

    async getHealth() {
        const response = await fetch(`${this.baseUrl}/api/health`);
        return await response.json();
    }

    getVideoFeedUrl() {
        return `${this.baseUrl}/video_feed`;
    }
}

// Usage Example
async function main() {
    const client = new IBCRSClient();

    // Check health
    console.log('Checking server health...');
    const health = await client.getHealth();
    console.log(health);

    // Start detection
    console.log('Starting detection...');
    const result = await client.startDetection();
    console.log(result);

    // Get video feed
    const videoFeed = document.getElementById('video-feed');
    videoFeed.src = client.getVideoFeedUrl();

    // Update stats every 500ms
    const statsInterval = setInterval(async () => {
        const stats = await client.getStats();
        console.log(stats);
    }, 500);

    // Stop detection after 10 seconds
    setTimeout(async () => {
        clearInterval(statsInterval);
        const result = await client.stopDetection();
        console.log(result);
    }, 10000);
}

main();
```

---

## Error Handling

### 404 - Not Found
```json
{
  "error": "Not found"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Internal server error"
}
```

### Connection Errors
When the server is not running:
```
Connection refused - Make sure the server is running on port 5000
```

---

## CORS Configuration

The API has CORS enabled for cross-origin requests. Configured in `config.py`:

```python
CORS_ORIGINS = '*'  # Allow all origins (configure in production)
```

---

## Rate Limiting

Currently no rate limiting is implemented. Configure in `config.py` if needed for production:

```python
# Future enhancement
RATE_LIMIT = 100  # requests per minute
```

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Testing Endpoints

### Using Postman

1. Open Postman
2. Create requests for each endpoint
3. Set method (GET/POST)
4. Add headers if needed
5. Test with localhost:5000

### Using Command Line

```bash
# Test health
curl http://localhost:5000/api/health

# Start detection
curl -X POST http://localhost:5000/api/start

# Get stats
curl http://localhost:5000/api/stats

# Stop detection
curl -X POST http://localhost:5000/api/stop
```

---

## Webhook Integration (Future)

Planned feature to send detection results to external URLs:

```python
# Example (not yet implemented)
WEBHOOK_URL = "https://your-api.com/detection"
WEBHOOK_ENABLED = False
```

---

**Last Updated:** February 2026  
**API Version:** 1.0.0
