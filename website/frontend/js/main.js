// ============ CONFIGURATION ============
// Determine a base URL for API calls that respects the current path. We
// default to the current origin plus the path portion of the URL. This avoids
// GitHub Pages (or any repo-hosted site) resolving "/api/..." at the domain
// root instead of under the repo path.
//
// Examples:
// - Locally on http://localhost:5000/           -> API_BASE_URL = "http://localhost:5000/"
// - GitHub Pages at https://user.github.io/IBCRS/ -> API_BASE_URL = "https://user.github.io/IBCRS/"
// - Vercel at https://ibcrs.vercel.app/        -> API_BASE_URL = "https://ibcrs.vercel.app/"
//
let API_BASE_URL;
{
    let path = window.location.pathname || '/';
    // strip filename if present (index.html or similar)
    path = path.replace(/index\.html?$/, '');
    // For Vercel, use the root path (no subdirectory)
    if (window.location.hostname.includes('vercel.app')) {
        API_BASE_URL = window.location.origin + '/';
    } else {
        // For GitHub Pages and local, include the path
        if (!path.endsWith('/')) path += '/';
        API_BASE_URL = window.location.origin + path;
    }
}
// Note: use relative paths if you ever need to override this manually later.

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
let imageUploadInput;
let imageDetectBtn;
let uploadedPreview;

let lastUploadedDataUrl = null;

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
    imageUploadInput = document.getElementById('image-upload');
    imageDetectBtn = document.getElementById('image-detect-btn');
    uploadedPreview = document.getElementById('uploaded-preview');

    // If video or canvas elements are missing on some deployed pages, create fallbacks
    const wrapper = document.getElementById('video-wrapper') || document.querySelector('.video-display-area') || document.querySelector('.video-wrapper');
    if (!webcamFeed && wrapper) {
        const v = document.createElement('video');
        v.id = 'webcam-feed';
        v.autoplay = true;
        v.muted = true;
        v.playsInline = true;
        v.style.width = '100%';
        v.style.height = '100%';
        wrapper.insertBefore(v, wrapper.firstChild);
        webcamFeed = v;
    }
    if (!detectionCanvas && wrapper) {
        const c = document.createElement('canvas');
        c.id = 'detection-canvas';
        c.style.width = '100%';
        c.style.height = '100%';
        wrapper.appendChild(c);
        detectionCanvas = c;
    }
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
    // If the page was opened with a hash (e.g. index.html#team) or a ?tab= query,
    // show that section immediately so external links work from GitHub Pages.
    try {
        const hash = (window.location.hash || '').replace(/^#/, '');
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        const section = hash || tabParam;
        if (section) {
            // small timeout to ensure DOM is ready
            setTimeout(() => {
                // Support a special logical section name 'detection' which lives inside the Home tab.
                if (section === 'detection') {
                    showSection('home');
                    // scroll to the detection panel and auto-start webcam if possible
                    setTimeout(() => {
                        const wrapper = document.getElementById('video-wrapper');
                        if (wrapper) wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // attempt to start detection (user will still need to allow camera)
                        if (typeof startWebcam === 'function') {
                            // do not block page load; try to start after a tiny delay
                            setTimeout(() => {
                                try { startWebcam(); } catch (e) { console.warn('Auto-start failed', e); }
                            }, 300);
                        }
                    }, 120);
                    return;
                }
                showSection(section);
            }, 50);
        }
    } catch (e) {
        console.warn('Error handling initial hash/tab param', e);
    }
});

// ============ EVENT LISTENERS ============
function initializeEventListeners() {
    if (startWebcamBtn) startWebcamBtn.addEventListener('click', startWebcam);
    if (stopWebcamBtn) stopWebcamBtn.addEventListener('click', stopWebcam);
    if (snapshotBtn) snapshotBtn.addEventListener('click', captureSnapshot);
    if (imageUploadInput) imageUploadInput.addEventListener('change', onImageSelected);
    if (imageDetectBtn) imageDetectBtn.addEventListener('click', onImageDetect);
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
        
        // When backend is not available, skip the backend-based detection
        // and go directly to webcam mode
        if (!useBackend) {
            showLoading(false);
            await startWebcam();
            return;
        }
        
        // Start video feed (local Flask backend only)
        videoFeed.src = `${API_BASE_URL}video_feed`;
        
        // Send start command to server
        const response = await fetch(`${API_BASE_URL}api/start`, {
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
        
        // Skip backend call if not available
        if (useBackend) {
            // Send stop command to server
            const response = await fetch(`${API_BASE_URL}api/stop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to stop detection');
            }
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

function onImageSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        showAlert('Please select an image file.', 'warning');
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        lastUploadedDataUrl = reader.result;
        if (uploadedPreview) {
            uploadedPreview.src = lastUploadedDataUrl;
            uploadedPreview.style.display = 'block';
        }
        const placeholder = document.getElementById('uploaded-placeholder');
        if (placeholder) placeholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function onImageDetect() {
    if (!lastUploadedDataUrl) {
        showAlert('Please choose an image first.', 'warning');
        return;
    }
    try {
        showLoading(true);
        const img = new Image();
        img.onload = async () => {
            if (!detectionCanvas) {
                showLoading(false);
                return;
            }
            detectionCanvas.width = img.width;
            detectionCanvas.height = img.height;
            const ctx = detectionCanvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            try {
                await runSingleImageDetection();
            } finally {
                showLoading(false);
            }
        };
        img.onerror = () => {
            showLoading(false);
            showAlert('Could not load the selected image.', 'error');
        };
        img.src = lastUploadedDataUrl;
    } catch (e) {
        console.error('Image detect error:', e);
        showAlert('Detection on image failed.', 'error');
        showLoading(false);
    }
}

async function runSingleImageDetection() {
    // If backend is available, use it
    if (useBackend) {
        const imageData = detectionCanvas.toDataURL('image/jpeg', 0.8);
        await detectFrame(imageData);
        return;
    }
    // Otherwise, fall back to client-side model
    try {
        if (!localModel) {
            await initLocalModel();
        }
        if (!localModel) {
            showAlert('Detection model is not ready yet.', 'warning');
            return;
        }
        if (localModel.type === 'coco' && localModel.model && typeof localModel.model.detect === 'function') {
            const results = await localModel.model.detect(detectionCanvas);
            const dets = convertLocalResults(results);
            displayDetections(dets);
        } else if (localModel.type === 'ultralytics' && localModel.model) {
            if (typeof localModel.model.predict === 'function') {
                const results = await localModel.model.predict(detectionCanvas, { conf: 0.3 });
                const dets = convertLocalResults(results);
                displayDetections(dets);
            }
        }
    } catch (e) {
        console.error('Client-side image detection failed', e);
        showAlert('Client-side detection failed.', 'error');
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
        // Skip stats on Vercel - stats only work with backend
        if (window.location.hostname.includes('vercel.app') || !useBackend) {
            return;
        }

        const response = await fetch(`${API_BASE_URL}api/stats`);
        
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
                showServerWarning('Using IBCRS custom model for detection');
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
        if (stopWebcamBtn) { stopWebcamBtn.disabled = false; stopWebcamBtn.style.display = 'flex'; }        // show detection overlay canvas when running
        if (detectionCanvas) {
            detectionCanvas.style.display = 'block';
        }        
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
    // hide detection canvas when stopped
    if (detectionCanvas) {
        detectionCanvas.style.display = 'none';
    }
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
            if (localModel && localModel.type === 'onnx') {
                const inputTensor = preprocessFrame(detectionCanvas);
                const feeds = {};
                const inputName = localModel.session.inputNames[0];
                feeds[inputName] = inputTensor;
                const results = await localModel.session.run(feeds);
                const outputName = localModel.session.outputNames[0];
                const output = results[outputName];
                const kept = postprocessYOLO(output.data, localModel.classNames.length);
                const dets = kept.map(d => ({
                    class: localModel.classNames[d.classIdx],
                    label: localModel.classNames[d.classIdx],
                    confidence: d.confidence
                }));
                displayDetections(dets);
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
        // Skip if backend is not available
        if (!useBackend) {
            return;
        }

        const response = await fetch(`${API_BASE_URL}api/detect`, {
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
        const response = await fetch(`${API_BASE_URL}api/predict`, {
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

let lastDetectionTime = 0;
let lastDetections = [];
const DETECTION_HOLD_MS = 3000;

function displayDetections(detections) {
    detectionCount = detections.length;
    if (detectionCountDisplay) detectionCountDisplay.textContent = detectionCount;

    if (detections.length > 0) {
        addToHistory(detections);
        lastDetections = detections;
        lastDetectionTime = Date.now();
    }

    const timeSinceLast = Date.now() - lastDetectionTime;
    const showDets = detections.length > 0 ? detections : (timeSinceLast < DETECTION_HOLD_MS ? lastDetections : []);
    
    if (detectionResults) {
        if (showDets.length === 0) {
            detectionResults.innerHTML = '<p style="color: #a0aec0; text-align: center; margin: 1rem 0;"><i class="fas fa-search"></i> Scanning for components...</p>';
            return;
        }

        const isFading = detections.length === 0;
        let html = '<div style="display: flex; flex-direction: column; gap: 0.6rem;' + (isFading ? ' opacity: 0.6;' : '') + '">';
        showDets.forEach(det => {
            const confidence = (det.confidence * 100).toFixed(1);
            const label = det.class || det.label || 'Unknown';
            html += `
                <div style="background: rgba(16, 185, 129, 0.2); padding: 0.6rem; border-radius: 6px; border-left: 3px solid #10b981;">
                    <div style="font-weight: 600; color: #10b981; font-size: 0.95rem;">
                        <i class="fas fa-check-circle"></i> ${label}
                        <span style="float: right; font-size: 0.75rem; color: #a0aec0;">${isFading ? 'saved' : 'live'}</span>
                    </div>
                    <div style="color: #a0aec0; font-size: 0.85rem;">Confidence: <strong style="color: #10b981;">${confidence}%</strong></div>
                </div>`;
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
    // Try to connect to the backend API (works on localhost, deployed servers, and Vercel with Python functions)
    console.log('Checking server health...');
    
    try {
        const response = await fetch(`${API_BASE_URL}api/health`);
        
        if (!response.ok) {
            console.warn('Server health check returned non-OK status:', response.status);
            useBackend = false;
            disableDetectionControls();
            showServerWarning('Backend not reachable – using IBCRS custom model for detection.');
            updateModelIndicator('Loading...');
            await initLocalModel();
            return false;
        }

        const health = await response.json();
        console.log('Server health:', health);
        
        if (health.status === 'ok' || health.model_loaded) {
            console.log('Backend is available -', health.model_name || 'YOLOv8');
            useBackend = true;
            updateModelIndicator(health.model_name || 'IBCRS Custom (Backend)');
            return true;
        } else {
            console.log('Backend not ready or degraded');
            useBackend = false;
            disableDetectionControls();
            const msg = health.message || 'Backend not available – trying client-side detection.';
            showServerWarning(msg);
            updateModelIndicator('Loading...');
            await initLocalModel();
            return false;
        }

    } catch (error) {
        console.error('Server health check failed:', error);
        useBackend = false;
            disableDetectionControls();
            showServerWarning('Cannot connect to backend – using IBCRS custom model for detection.');
            updateModelIndicator('Loading...');
        await initLocalModel();
        return false;
    }
}

// Update the model indicator shown at top of page
function updateModelIndicator(label) {
    const el = document.getElementById('model-indicator-text');
    if (el) el.textContent = 'Model: ' + label;
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
    // Keep the Start button enabled so users can always attempt client-side detection.
    if (stopWebcamBtn) stopWebcamBtn.disabled = true;
    if (snapshotBtn) snapshotBtn.disabled = true;
}
// Class names matching the custom YOLOv8 training order
const YOLO_CLASS_NAMES = ['Cam', 'DroneRx', 'PIR', 'Sonar', 'Colorimeter', 'Magnetic Stirrer', 'pH meter'];
const YOLO_INPUT_SIZE = 640;
const YOLO_CONF_THRESHOLD = 0.25;
const YOLO_IOU_THRESHOLD = 0.45;

// Detection history: persists across frames until user clears
let detectionHistory = [];

async function initLocalModel() {
    if (localModel) return;

    try {
        if (typeof ort === 'undefined') throw new Error('ONNX Runtime Web not loaded');

        showServerWarning('Loading IBCRS detection model... please wait.');
        // Use absolute URL so it works on Vercel (relative path can fail with SPA routing)
        const modelUrl = (typeof window !== 'undefined' && window.location)
            ? window.location.origin + '/models/best.onnx'
            : '/models/best.onnx';
        const session = await ort.InferenceSession.create(modelUrl, {
            executionProviders: ['wasm', 'webgl'],
            graphOptimizationLevel: 'all'
        });
        localModel = { type: 'onnx', session, classNames: YOLO_CLASS_NAMES };
        console.log('Loaded custom IBCRS ONNX model for client-side detection.');
        updateModelIndicator('IBCRS Custom (ONNX)');
        showServerWarning('IBCRS custom model loaded. Ready for detection.');
        if (startWebcamBtn) startWebcamBtn.disabled = false;
    } catch (err) {
        console.error('Failed to load ONNX model', err);
        updateModelIndicator('Unavailable');
        showServerWarning('Model load failed; detection unavailable. ' + err.message);
        if (stopWebcamBtn) stopWebcamBtn.disabled = true;
        if (snapshotBtn) snapshotBtn.disabled = true;
        throw err;
    }
}

// Letterbox pre-processing: maintain aspect ratio with gray padding for better accuracy
function preprocessFrame(canvas) {
    const srcW = canvas.width, srcH = canvas.height;
    const scale = Math.min(YOLO_INPUT_SIZE / srcW, YOLO_INPUT_SIZE / srcH);
    const newW = Math.round(srcW * scale), newH = Math.round(srcH * scale);
    const padX = (YOLO_INPUT_SIZE - newW) / 2, padY = (YOLO_INPUT_SIZE - newH) / 2;

    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = YOLO_INPUT_SIZE;
    tmpCanvas.height = YOLO_INPUT_SIZE;
    const tmpCtx = tmpCanvas.getContext('2d');
    tmpCtx.fillStyle = '#808080';
    tmpCtx.fillRect(0, 0, YOLO_INPUT_SIZE, YOLO_INPUT_SIZE);
    tmpCtx.drawImage(canvas, padX, padY, newW, newH);

    const imageData = tmpCtx.getImageData(0, 0, YOLO_INPUT_SIZE, YOLO_INPUT_SIZE);
    const pixels = imageData.data;
    const float32Data = new Float32Array(3 * YOLO_INPUT_SIZE * YOLO_INPUT_SIZE);
    const channelSize = YOLO_INPUT_SIZE * YOLO_INPUT_SIZE;
    for (let i = 0; i < channelSize; i++) {
        float32Data[i] = pixels[i * 4] / 255.0;
        float32Data[channelSize + i] = pixels[i * 4 + 1] / 255.0;
        float32Data[2 * channelSize + i] = pixels[i * 4 + 2] / 255.0;
    }
    return new ort.Tensor('float32', float32Data, [1, 3, YOLO_INPUT_SIZE, YOLO_INPUT_SIZE]);
}

function iou(a, b) {
    const x1 = Math.max(a[0], b[0]), y1 = Math.max(a[1], b[1]);
    const x2 = Math.min(a[2], b[2]), y2 = Math.min(a[3], b[3]);
    const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const areaA = (a[2] - a[0]) * (a[3] - a[1]);
    const areaB = (b[2] - b[0]) * (b[3] - b[1]);
    return inter / (areaA + areaB - inter);
}

function postprocessYOLO(outputData, numClasses) {
    const numDetections = 8400;
    const candidates = [];
    const data = outputData && typeof outputData.length === 'number' ? outputData : Array.from(outputData || []);

    for (let i = 0; i < numDetections; i++) {
        let maxScore = 0, maxIdx = 0;
        for (let c = 0; c < numClasses; c++) {
            let score = data[(4 + c) * numDetections + i];
            if (typeof score !== 'number' || isNaN(score)) score = 0;
            if (score < 0 || score > 1) score = 1 / (1 + Math.exp(-score));
            if (score > maxScore) { maxScore = score; maxIdx = c; }
        }
        if (maxScore < YOLO_CONF_THRESHOLD) continue;

        const cx = data[0 * numDetections + i];
        const cy = data[1 * numDetections + i];
        const w  = data[2 * numDetections + i];
        const h  = data[3 * numDetections + i];
        candidates.push({
            box: [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2],
            confidence: maxScore,
            classIdx: maxIdx
        });
    }

    candidates.sort((a, b) => b.confidence - a.confidence);

    const kept = [];
    const suppressed = new Set();
    for (let i = 0; i < candidates.length; i++) {
        if (suppressed.has(i)) continue;
        kept.push(candidates[i]);
        for (let j = i + 1; j < candidates.length; j++) {
            if (!suppressed.has(j) && iou(candidates[i].box, candidates[j].box) > YOLO_IOU_THRESHOLD) {
                suppressed.add(j);
            }
        }
    }
    return kept;
}

// ============ DETECTION HISTORY ============
function addToHistory(detections) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    let newItemAdded = false;
    detections.forEach(det => {
        const label = det.class || det.label || 'Unknown';
        const existing = detectionHistory.find(h => h.label === label);
        if (existing) {
            existing.confidence = Math.max(existing.confidence, det.confidence);
            existing.lastSeen = timeStr;
            existing.count++;
        } else {
            detectionHistory.push({
                label: label,
                confidence: det.confidence,
                firstSeen: timeStr,
                lastSeen: timeStr,
                count: 1
            });
            newItemAdded = true;
        }
    });
    renderHistory();
    if (newItemAdded) {
        showAlert('Component saved to history!', 'success');
        const container = document.getElementById('detection-history');
        if (container) container.scrollTop = container.scrollHeight;
    }
}

function clearHistory() {
    detectionHistory = [];
    renderHistory();
    showAlert('Detection history cleared', 'info');
}

function renderHistory() {
    const container = document.getElementById('detection-history');
    if (!container) return;

    if (detectionHistory.length === 0) {
        container.innerHTML = '<p style="color: #a0aec0; font-size: 0.9rem;">No components detected yet.</p>';
        return;
    }

    let html = '';
    detectionHistory.forEach(item => {
        const conf = (item.confidence * 100).toFixed(1);
        html += `
            <div style="background: rgba(0, 102, 255, 0.15); padding: 0.8rem; border-radius: 8px; border-left: 4px solid #10b981; cursor: pointer; transition: all 0.3s ease; margin-bottom: 0.6rem;"
                 onmouseover="this.style.background='rgba(0, 102, 255, 0.3)'; this.style.transform='translateX(4px)';"
                 onmouseout="this.style.background='rgba(0, 102, 255, 0.15)'; this.style.transform='none';"
                 onclick="openEquipmentDetail('${item.label}')">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                    <span style="font-weight: 700; color: #00d4ff; font-size: 1rem;">
                        <i class="fas fa-microchip"></i> ${item.label}
                    </span>
                    <span style="background: rgba(16,185,129,0.2); color: #10b981; padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.75rem; font-weight: 600;">
                        ${conf}%
                    </span>
                </div>
                <div style="color: #6b7a99; font-size: 0.78rem;">
                    <i class="fas fa-clock"></i> ${item.lastSeen} &middot; Detected ${item.count}x
                </div>
                <div style="color: #0066ff; font-size: 0.75rem; margin-top: 0.2rem;">
                    <i class="fas fa-external-link-alt"></i> Click to view details
                </div>
            </div>`;
    });
    container.innerHTML = html;
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
    // Support logical aliases: 'detection' lives inside the Home tab
    const aliasMap = {
        'detection': 'home',
        'innovators': 'team'
    };

    const resolved = aliasMap[sectionId] || sectionId;

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const target = document.getElementById(resolved);
    if (target) target.classList.add('active');

    // Mark the corresponding nav button active (if present)
    const btn = document.querySelector('.nav-btn[data-tab="' + sectionId + '"]') || document.querySelector('.nav-btn[data-tab="' + resolved + '"]');
    if (btn) btn.classList.add('active');

    // If the user asked for the detection alias, scroll the detection panel into view
    if (sectionId === 'detection') {
        const wrapper = document.getElementById('video-wrapper');
        if (wrapper) {
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // attempt to start webcam (user must still allow camera)
            if (typeof startWebcam === 'function') {
                setTimeout(() => { try { startWebcam(); } catch (e) { console.warn('Auto-start failed', e); } }, 250);
            }
        }
    } else {
        window.scrollTo(0, 0);
    }
}

// ============ INITIAL STATE ============
updateUIState();
setState('Ready', 'inactive');
