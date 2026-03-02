# IBCRS Website

> Frontend, backend, and deployment configuration for the IBCRS platform.

See the [main README](../README.md) for full documentation.

## Quick Start

### Deployed (Vercel)

Visit **[ibcrs-web.vercel.app](https://ibcrs-web.vercel.app/)** — detection runs entirely in your browser using the custom ONNX model.

### Local Development

```bash
pip install -r backend/requirements.txt
python backend/app.py
```

Open **http://localhost:5000** in your browser.

### Windows One-Click

```bash
start.bat
```

## Directory Layout

```
website/
├── frontend/          # Static site (HTML, CSS, JS, ONNX model)
│   ├── index.html     # Main SPA
│   ├── js/main.js     # Detection logic + ONNX inference
│   ├── models/        # Custom YOLOv8 ONNX model
│   └── component_*    # Equipment detail pages
├── backend/           # Flask API (local dev only)
│   ├── app.py
│   └── requirements.txt
├── api/               # Vercel serverless functions
└── vercel.json        # Vercel deployment config
```
