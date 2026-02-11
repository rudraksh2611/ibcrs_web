Installing PyTorch (torch) on Windows

Because PyTorch provides platform- and Python-version-specific wheels, follow the official instructions below to install a matching `torch` and `torchvision` for your environment.

1) Check Python version

Open PowerShell in `d:\IBCRS\website` and run:

```powershell
.\venv\Scripts\python.exe --version
```

2) Use the official PyTorch install selector

Visit https://pytorch.org/get-started/locally/ and select:
- OS: Windows
- Package: Pip
- Compute Platform: CUDA (if you have NVIDIA GPU and CUDA installed) or CPU
- Python: the version shown in step 1

The site will show the exact `pip` command to run. Example commands below.

3) Example commands

CPU-only (Windows):

```powershell
# Activate venv first
.\venv\Scripts\activate
# Install CPU-only PyTorch (example)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

CUDA (example for CUDA 12.2; adjust per selector):

```powershell
.\venv\Scripts\activate
pip install --index-url https://download.pytorch.org/whl/cu122 torch torchvision
```

4) Verify installation

```powershell
python -c "import torch; print(torch.__version__); print(torch.cuda.is_available())"
```

5) After installing torch/torchvision

Install the rest of the requirements:

```powershell
pip install -r backend\requirements.txt
```

Notes
- If you see errors about no matching wheel, double-check your Python version and the CUDA version selected.
- If using Python 3.12 and an older torch wheel is not yet available, consider using Python 3.11 virtual environment or use the CPU wheel if available.
