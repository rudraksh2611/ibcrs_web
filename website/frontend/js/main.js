// ============ CONFIGURATION ============
// API_BASE_URL is the server address for detection API calls. By default we use the
// current origin so that the frontend will talk to a backend hosted on the same
// domain (useful during local development or when deploying a full stack).
//
// When this page is served as a *static* site (e.g. GitHub Pages) there is no
// backend at the origin, so health checks will fail and the detection controls
// will be disabled. In that case you must run the Flask server locally or
// deploy it somewhere (Heroku, Railway, etc.) and update this value to point
// at that URL.
let API_BASE_URL = window.location.origin;

const STATS_UPDATE_INTERVAL = 500; // ms
let statsInterval = null;
let isDetectionRunning = false;
let mediaStream = null;
let frameCount = 0;
let detectionCount = 0;
let startTime = null;

// detection mode flags & local model handles
let useBackend = null;          // set after health check (true/false)
let localModel = null;          // ultralytics JS model instance
let localStream = null;         // MediaStream when using local webcam

let localLoopId = null;         // requestAnimationFrame id for local inference

// Equipment mapping for component pages
const equipmentMapping = {
    'Camera': 'component_cam.html',
    'Cam': 'component_cam.html',
    'camera': 'component_cam.html',
    'cam': 'component_cam.html',
    'Colorimeter': 'component_colorimeter.html',
    'colorimeter': 'component_colorimeter.html',
    'DroneRx': 'component_dronerx.html',
    'Drone': 'component_dronerx.html',
    'drone': 'component_dronerx.html',
    'dronerx': 'component_dronerx.html',
    'Magnetic Stirrer': 'component_magnetic_stirrer.html',
    'Stirrer': 'component_magnetic_stirrer.html',
    'stirrer': 'component_magnetic_stirrer.html',
    'pH Meter': 'component_ph_meter.html',
    'pH': 'component_ph_meter.html',
    'ph meter': 'component_ph_meter.html',
    'PIR': 'component_pir.html',
    'pir': 'component_pir.html',
    'Sonar': 'component_sonar.html',
    'sonar': 'component_sonar.html'
};

// ============ DOM ELEMENTS ============
let videoFeed;
let webcamFeed;
let detectionCanvas;
let startWebcamBtn;
let stopWebcamBtn;
let snapshotBtn;
let statusIndicator;
let statusText;
let detectionStatus;
let frameCountDisplay;
let detectionCountDisplay;
let fpsCounter;
let detectionResults;
let loadingSpinner;
let navLinks;

// ============ INITIALIZATION ============
function initializeDOMElements() {
    videoFeed = document.getElementById('video-feed');
    webcamFeed = document.getElementById('webcam-feed');
    detectionCanvas = document.getElementById('detection-canvas');
    startWebcamBtn = document.getElementById('start-webcam-btn');
    stopWebcamBtn = document.getElementById('stop-webcam-btn');
    snapshotBtn = document.getElementById('snapshot-btn');
    statusIndicator = document.getElementById('status-indicator');
    statusText = document.getElementById('status-text');
    detectionStatus = document.getElementById('detection-status');
    frameCountDisplay = document.getElementById('frame-count');
    detectionCountDisplay = document.getElementById('detection-count');
    fpsCounter = document.getElementById('fps-counter');
    detectionResults = document.getElementById('detection-results');
    loadingSpinner = document.getElementById('loading-spinner');
    navLinks = document.querySelectorAll('.nav-btn[data-tab], .nav-link');
}

// global error handlers: surface errors visibly on the static page so you can
// open the GitHub Pages link and see exactly why detection/model load failed.
window.addEventListener('error', function (ev) {
    const details = `${ev.message} at ${ev.filename}:${ev.lineno}:${ev.colno}`;
    const log = document.getElementById('js-error-log');
    const detailsEl = document.getElementById('js-error-details');
    if (detailsEl) detailsEl.textContent = details + '\n' + (ev.error && ev.error.stack ? ev.error.stack : '');
    if (log) log.style.display = 'block';
    console.error('Captured global error:', details, ev.error);
});

window.addEventListener('unhandledrejection', function (ev) {
    const details = 'Unhandled Rejection: ' + (ev.reason && ev.reason.message ? ev.reason.message : JSON.stringify(ev.reason));
    const log = document.getElementById('js-error-log');
    const detailsEl = document.getElementById('js-error-details');
    if (detailsEl) detailsEl.textContent = details + '\n' + (ev.reason && ev.reason.stack ? ev.reason.stack : '');
    if (log) log.style.display = 'block';
    console.error('Captured unhandledrejection:', ev.reason);
});

document.addEventListener('DOMContentLoaded', function() {
    initializeDOMElements();
    initializeEventListeners();
    checkServerHealth();
    setupNavigation();
});

// ============ EVENT LISTENERS ============
function initializeEventListeners() {
    if (startWebcamBtn) startWebcamBtn.addEventListener('click', startWebcam);
    if (stopWebcamBtn) stopWebcamBtn.addEventListener('click', stopWebcam);
    if (snapshotBtn) snapshotBtn.addEventListener('click', captureSnapshot);
}

function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // determine target tab: support `data-tab` (buttons) or `href` anchors (links)
            const tab = this.getAttribute('data-tab') || (this.getAttribute('href') || '').replace(/^.*#/, '');
            if (tab) showSection(tab);

            // Update active state across both button/link variants
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Update active link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const tab = link.getAttribute('data-tab') || (link.getAttribute('href') || '').replace(/^.*#/, '');
        if (tab === current) {
            link.classList.add('active');
        }
    });
}

// ============ DETECTION FUNCTIONS ============
async function startDetection() {
    try {
        showLoading(true);
        
        // Start video feed
        videoFeed.src = `${API_BASE_URL}/video_feed`;
        
        // Send start command to server
        const response = await fetch(`${API_BASE_URL}/api/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to start detection');
        }

        // Update UI
        isDetectionRunning = true;
        updateUIState();
        
        // Update status
        setState('Running', 'active');
        
        // Start stats update
        startStatsUpdate();
        
        // Hide loading after video loads
        videoFeed.addEventListener('loadstart', () => showLoading(true), { once: true });
        videoFeed.addEventListener('canplay', () => showLoading(false), { once: true });
        
    } catch (error) {
        console.error('Error starting detection:', error);
        showAlert('Failed to start detection. Make sure the server is running.', 'error');
        showLoading(false);
    }
}

async function stopDetection() {
    try {
        showLoading(true);
        
        // Send stop command to server
        const response = await fetch(`${API_BASE_URL}/api/stop`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to stop detection');
        }

        // Stop video feed
        videoFeed.src = '';
        
        // Clear stats update
        if (statsInterval) {
            clearInterval(statsInterval);
            statsInterval = null;
        }

        // Update UI
        isDetectionRunning = false;
        updateUIState();
        
        // Update status
        setState('Stopped', 'inactive');
        
        showLoading(false);
        
    } catch (error) {
        console.error('Error stopping detection:', error);
        showAlert('Failed to stop detection.', 'error');
        showLoading(false);
    }
}

function captureSnapshot() {
    const src = webcamFeed && webcamFeed.srcObject ? webcamFeed : (videoFeed && videoFeed.src ? videoFeed : null);
    if (!src || !isDetectionRunning) {
        showAlert('Start detection first to capture a snapshot.', 'warning');
        return;
    }
    try {
        const c = document.createElement('canvas');
        c.width = src.videoWidth || 1280;
        c.height = src.videoHeight || 720;
        c.getContext('2d').drawImage(src, 0, 0);
        c.toBlob((blob) => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'ibcrs-snapshot-' + Date.now() + '.jpg';
            a.click();
            URL.revokeObjectURL(a.href);
        });
        showAlert('Snapshot captured!', 'success');
    } catch (e) {
        showAlert('Failed to capture snapshot.', 'error');
    }
}

// ============ STATS UPDATE ============
function startStatsUpdate() {
    if (statsInterval) {
        clearInterval(statsInterval);
    }

    statsInterval = setInterval(updateStats, STATS_UPDATE_INTERVAL);
    updateStats(); // Initial update
}

async function updateStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/stats`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }

        const stats = await response.json();

        // Update metrics
        document.getElementById('inference-time').textContent = `${stats.inference_time.toFixed(2)} ms`;
        document.getElementById('fps').textContent = stats.fps;
        document.getElementById('cpu-usage').textContent = `${stats.cpu_usage.toFixed(1)}%`;
        document.getElementById('memory-usage').textContent = `${stats.memory_usage.toFixed(1)}%`;
        document.getElementById('total-detections').textContent = stats.total_detections;

        // Update detected classes
        updateDetectedClasses(stats.detected_classes);

        // Update status indicator
        if (stats.is_running) {
            statusIndicator.classList.add('active');
        } else {
            statusIndicator.classList.remove('active');
        }

    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

function updateDetectedClasses(classes) {
    const container = document.getElementById('detected-classes');
    
    // Clear existing badges
    container.innerHTML = '';

    // Add new badges
    if (Object.keys(classes).length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">No detections yet</p>';
        return;
    }

    for (const [className, count] of Object.entries(classes)) {
        const badge = document.createElement('div');
        badge.className = 'class-badge';
        
        const classNameEl = document.createElement('span');
        classNameEl.className = 'class-name';
        classNameEl.textContent = className;
        
        const countEl = document.createElement('span');
        countEl.className = 'class-count';
        countEl.textContent = count;
        
        badge.appendChild(classNameEl);
        badge.appendChild(countEl);
        container.appendChild(badge);
    }
}

// ============ UI HELPERS ============
function updateUIState() {
    if (isDetectionRunning) {
        if (startWebcamBtn) { startWebcamBtn.disabled = true; startWebcamBtn.style.display = 'none'; }
        if (stopWebcamBtn) { stopWebcamBtn.disabled = false; stopWebcamBtn.style.display = 'flex'; }
        if (snapshotBtn) snapshotBtn.disabled = false;
    } else {
        if (startWebcamBtn) { startWebcamBtn.disabled = false; startWebcamBtn.style.display = 'flex'; }
        if (stopWebcamBtn) { stopWebcamBtn.disabled = true; stopWebcamBtn.style.display = 'none'; }
        if (snapshotBtn) snapshotBtn.disabled = true;
    }
}

function setState(text, state) {
    if (statusText) statusText.textContent = text;
    if (statusIndicator) {
        if (state === 'active') statusIndicator.classList.add('active');
        else statusIndicator.classList.remove('active');
    }
}

function showLoading(show) {
    if (loadingSpinner) loadingSpinner.style.display = show ? 'flex' : 'none';
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        backdrop-filter: blur(10px);
    `;

    // Set background color based on type
    const colors = {
        'success': 'rgba(16, 185, 129, 0.9)',
        'error': 'rgba(239, 68, 68, 0.9)',
        'warning': 'rgba(245, 158, 11, 0.9)',
        'info': 'rgba(0, 102, 255, 0.9)'
    };

    alert.style.background = colors[type] || colors['info'];
    alert.textContent = message;

    document.body.appendChild(alert);

    // Remove after 3 seconds
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(alert);
        }, 300);
    }, 3000);
}

// ============ WEBCAM DETECTION FUNCTIONS ============
async function startWebcam() {
    try {
        console.log('Starting webcam...');
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('Webcam not supported');
            showAlert('Webcam not supported in this browser', 'error');
            return;
        }

        // If backend is not available we may run a local model; ensure it's loaded
        if (useBackend === false) {
            try {
                await initLocalModel();
                showServerWarning('Using client-side model for detection');
            } catch (e) {
                // initLocalModel already showed warning/disabled controls
                return;
            }
        }

        console.log('Requesting camera access...');
        // Request camera access
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        });

        console.log('Camera access granted, setting srcObject...');
        // Set video source
        if (!webcamFeed) {
            console.error('webcamFeed element not found');
            showAlert('Error: Video element not found', 'error');
            return;
        }
        
        webcamFeed.srcObject = mediaStream;
        const wrapper = document.getElementById('video-wrapper');
        if (wrapper) wrapper.classList.add('has-feed');
        
        // Wait for video to be ready
        await new Promise((resolve) => {
            webcamFeed.onloadedmetadata = () => {
                console.log('Video metadata loaded');
                resolve();
            };
        });
        
        // Update UI
        isDetectionRunning = true;
        if (startWebcamBtn) { startWebcamBtn.disabled = true; startWebcamBtn.style.display = 'none'; }
        if (stopWebcamBtn) { stopWebcamBtn.disabled = false; stopWebcamBtn.style.display = 'flex'; }
        
        if (detectionStatus) {
            detectionStatus.innerHTML = '<span style="color: #10b981;"><i class="fas fa-circle"></i> Online</span>';
        }

        startTime = Date.now();
        frameCount = 0;
        detectionCount = 0;
        
        console.log('Webcam ready, starting frame processing...');
        showAlert('Webcam started. Processing frames...', 'success');
        
        // Start detection loop (backend or client)
        if (useBackend === false) {
            // client-side inference
            if (localModel && localModel.type === 'ultralytics' && typeof localModel.model.track === 'function') {
                // Ultralytics provides a `track` helper which can draw on the video element
                localModel.model.track(webcamFeed, {
                    camera: true,
                    callback: (res) => {
                        const dets = convertLocalResults(res);
                        displayDetections(dets);
                        detectionCount = dets.length;
                        if (detectionCountDisplay) detectionCountDisplay.textContent = detectionCount;
                    }
                });
            } else {
                // fallback to frame polling (works for COCO-SSD and Ultralytics predict)
                processFrames();
            }
        } else {
            processFrames();
        }
        
    } catch (error) {
        console.error('Error accessing webcam:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        let errorMsg = error.message;
        
        // Handle common webcam access errors
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            errorMsg = 'Webcam access denied. Please check:1) Browser permissions, 2) Site is trusted, 3) No other app is using the camera';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            errorMsg = 'No camera device found. Make sure your webcam is connected.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            errorMsg = 'Camera is in use by another application. Close other apps using the camera.';
        } else if (error.name === 'SecurityError') {
            errorMsg = 'Security error: Website must be served over HTTPS or localhost to access webcam.';
        }
        
        showAlert('Error accessing webcam: ' + errorMsg, 'error');
        isDetectionRunning = false;
    }
}

function stopWebcam() {
    // stop camera stream
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }

    // if using localModel.track, attempt to stop it
    if (localModel && typeof localModel.stop === 'function') {
        try {
            localModel.stop();
        } catch(e) {
            console.warn('Error stopping local model tracking', e);
        }
    }
    if (localLoopId) {
        cancelAnimationFrame(localLoopId);
        localLoopId = null;
    }

    const wrapper = document.getElementById('video-wrapper');
    if (wrapper) wrapper.classList.remove('has-feed');
    
    isDetectionRunning = false;
    if (startWebcamBtn) { startWebcamBtn.disabled = false; startWebcamBtn.style.display = 'flex'; }
    if (stopWebcamBtn) { stopWebcamBtn.disabled = true; stopWebcamBtn.style.display = 'none'; }
    
    if (detectionStatus) {
        detectionStatus.innerHTML = '<span style="color: #ef4444;"><i class="fas fa-circle"></i> Offline</span>';
    }
    
    showAlert('Webcam stopped', 'info');
}

async function processFrames() {
    if (!isDetectionRunning || !webcamFeed.srcObject) {
        console.log('Processing stopped: isDetectionRunning=' + isDetectionRunning + ', srcObject=' + (webcamFeed.srcObject ? 'set' : 'null'));
        return;
    }

    try {
        // Get canvas context
        if (!detectionCanvas) {
            console.log('Canvas not found, retrying...');
            setTimeout(processFrames, 100);
            return;
        }

        detectionCanvas.width = webcamFeed.videoWidth;
        detectionCanvas.height = webcamFeed.videoHeight;
        
        if (detectionCanvas.width === 0 || detectionCanvas.height === 0) {
            console.log('Video dimensions not ready: ' + detectionCanvas.width + 'x' + detectionCanvas.height);
            setTimeout(processFrames, 100);
            return;
        }

        const ctx = detectionCanvas.getContext('2d');
        ctx.drawImage(webcamFeed, 0, 0);
        
        if (useBackend === false) {
            // client-side inference
            if (localModel) {
                if (localModel.type === 'coco' && localModel.model && typeof localModel.model.detect === 'function') {
                    const results = await localModel.model.detect(detectionCanvas);
                    const dets = convertLocalResults(results);
                    displayDetections(dets);
                } else if (localModel.type === 'ultralytics' && localModel.model) {
                    if (typeof localModel.model.predict === 'function') {
                        const results = await localModel.model.predict(detectionCanvas, {conf:0.3});
                        const dets = convertLocalResults(results);
                        displayDetections(dets);
                    }
                }
            }
        } else {
            // Convert to base64 JPEG
            const imageData = detectionCanvas.toDataURL('image/jpeg', 0.8);
            // Send to API
            await detectFrame(imageData);
        }
        
        frameCount++;
        if (frameCountDisplay) frameCountDisplay.textContent = frameCount;
        
        // Update FPS
        const elapsed = (Date.now() - startTime) / 1000;
        if (fpsCounter && elapsed > 0) {
            fpsCounter.textContent = Math.round(frameCount / elapsed);
        }
        
        // Continue processing
        setTimeout(processFrames, 100); // Process every 100ms
        
    } catch (error) {
        console.error('Error processing frame:', error);
        if (isDetectionRunning) {
            setTimeout(processFrames, 100);
        }
    }
}

async function detectFrame(imageData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/detect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: imageData })
        });

        if (!response.ok) {
            if (response.status === 404) {
                // Try alternative endpoint
                return detectFrameAltEndpoint(imageData);
            }
            throw new Error(`API returned status ${response.status}`);
        }

        const detections = await response.json();
        
        if (detections && detections.length > 0) {
            displayDetections(detections);
        }
        
    } catch (error) {
        console.error('Detection error:', error);
    }
}

async function detectFrameAltEndpoint(imageData) {
    try {
        // Try the endpoint from Flask backend
        const response = await fetch(`${API_BASE_URL}/api/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: imageData })
        });

        if (response.ok) {
            const detections = await response.json();
            if (detections && detections.length > 0) {
                displayDetections(detections);
            }
        }
    } catch (error) {
        console.error('Alt endpoint error:', error);
    }
}

function displayDetections(detections) {
    detectionCount = detections.length;
    if (detectionCountDisplay) detectionCountDisplay.textContent = detectionCount;
    
    if (detectionResults) {
        if (detections.length === 0) {
            detectionResults.innerHTML = '<p style="color: #a0aec0; text-align: center; margin: 2rem 0;">No detections</p>';
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 0.8rem;">';
        
        detections.forEach(det => {
            const confidence = (det.confidence * 100).toFixed(1);
            const label = det.class || det.label || 'Unknown';
            
            html += `
                <div style="background: rgba(0, 102, 255, 0.2); padding: 0.8rem; border-radius: 6px; border-left: 3px solid #0066ff; cursor: pointer; transition: all 0.3s ease;" 
                     onmouseover="this.style.background='rgba(0, 102, 255, 0.4)';" 
                     onmouseout="this.style.background='rgba(0, 102, 255, 0.2)';"
                     onclick="openEquipmentDetail('${label}')">
                    <div style="font-weight: 600; color: #00d4ff; font-size: 1rem; margin-bottom: 0.3rem;"><i class="fas fa-check-circle"></i> ${label}</div>
                    <div style="color: #a0aec0; font-size: 0.9rem;">Confidence: <strong style="color: #10b981;">${confidence}%</strong></div>
                </div>
            `;
        });
        
        html += '</div>';
        detectionResults.innerHTML = html;
    }
}

// helper to convert results from the web model into the format expected by displayDetections
function convertLocalResults(results) {
    const out = [];
    if (!results) return out;

    // Case A: results is an array of COCO detections [{class, score, bbox}, ...]
    if (Array.isArray(results) && results.length > 0 && results[0].hasOwnProperty('class')) {
        results.forEach(d => {
            out.push({ class: d.class, label: d.class, confidence: d.score ?? d.confidence ?? 0 });
        });
        return out;
    }

    // Case B: Ultralytics-style result object or array containing a result
    const r = Array.isArray(results) ? results[0] : results;
    if (!r) return out;

    // r.boxes might be an array-like structure
    if (r.boxes) {
        let boxes = r.boxes;
        if (typeof boxes.array === 'function') boxes = boxes.array();
        if (Array.isArray(boxes)) {
            boxes.forEach(b => {
                const cls = b.cls !== undefined ? b.cls : (b[5] ?? null);
                const conf = b.conf !== undefined ? b.conf : (b[4] ?? 0);
                const label = (r.names && r.names[cls]) ? r.names[cls] : `class_${cls}`;
                out.push({ class: label, label: label, confidence: conf });
            });
        }
    } else if (r.classes) {
        for (let i = 0; i < r.classes.length; i++) {
            const cls = r.classes[i];
            const conf = r.scores ? r.scores[i] : 0;
            const label = (r.names && r.names[cls]) ? r.names[cls] : `class_${cls}`;
            out.push({ class: label, label: label, confidence: conf });
        }
    }

    return out;
}

function openEquipmentDetail(label) {
    // Find the matching component page and navigate
    const componentPage = equipmentMapping[label] || equipmentMapping[label.toLowerCase()];
    
    if (componentPage) {
        window.location.href = componentPage;
    } else {
        showAlert(`No component page found for ${label}`, 'warning');
    }
}

// ============ SERVER HEALTH CHECK ============
async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        
        if (!response.ok) {
            console.warn('Server health check returned non-OK status');
            useBackend = false;
            disableDetectionControls();
            showServerWarning('Backend not reachable – falling back to client-side detection.');
            await initLocalModel();
            return false;
        }

        const health = await response.json();
        console.log('Server health:', health);
        
        if (!health.model_loaded) {
            showAlert('Model failed to load. Check server logs.', 'warning');
        }

        useBackend = true;
        return true;

    } catch (error) {
        console.error('Server health check failed:', error);
        useBackend = false;
        disableDetectionControls();
        showServerWarning('Cannot connect to backend – trying client-side detection.');
        await initLocalModel();
        return false;
    }
}

// small helper functions used by health check
function showServerWarning(message) {
    const banner = document.getElementById('server-warning');
    if (banner) {
        banner.textContent = message;
        banner.style.display = 'block';
    }
}

function disableDetectionControls() {
    if (startWebcamBtn) startWebcamBtn.disabled = true;
    if (stopWebcamBtn) stopWebcamBtn.disabled = true;
    if (snapshotBtn) snapshotBtn.disabled = true;
}
// Initialize a client-side model. Try Ultralytics Web first, then fall back to COCO-SSD.
async function initLocalModel() {
    if (localModel) return;

    // Try Ultralytics Web (if available)
    try {
        const mod = await import('https://cdn.jsdelivr.net/npm/@ultralytics/web@latest/dist/ultralytics.min.js');
        const YOLO = mod && (mod.YOLO || mod.default?.YOLO || mod);
        if (YOLO && typeof YOLO.load === 'function') {
            try {
                const model = await YOLO.load('https://ultralytics.com/assets/models/yolov8n.pt');
                localModel = { type: 'ultralytics', model };
                console.log('Loaded Ultralytics web model for client-side detection.');
                if (startWebcamBtn) startWebcamBtn.disabled = false;
                return;
            } catch (e) {
                console.warn('Ultralytics model load failed, falling back to COCO-SSD:', e);
            }
        }
    } catch (err) {
        console.warn('Ultralytics web not available:', err);
    }

    // Fall back to coco-ssd (loaded via script tag)
    try {
        if (window.cocoSsd && typeof window.cocoSsd.load === 'function') {
            const model = await cocoSsd.load();
            localModel = { type: 'coco', model };
            console.log('Loaded COCO-SSD model for client-side detection.');
            if (startWebcamBtn) startWebcamBtn.disabled = false;
            return;
        } else {
            throw new Error('cocoSsd not available');
        }
    } catch (err) {
        console.error('Failed to load client-side models', err);
        showServerWarning('Client-side model load failed; detection unavailable.');
        // Keep start enabled so users can still view webcam, but disable detection controls
        if (stopWebcamBtn) stopWebcamBtn.disabled = true;
        if (snapshotBtn) snapshotBtn.disabled = true;
        throw err;
    }
}
}

// ============ CSS ANIMATIONS ============
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// ============ SECTION NAVIGATION ============
function showSection(sectionId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
    const btn = document.querySelector('.nav-btn[data-tab="' + sectionId + '"]');
    if (btn) btn.classList.add('active');
    window.scrollTo(0, 0);
}

// ============ INITIAL STATE ============
updateUIState();
setState('Ready', 'inactive');
