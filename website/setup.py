#!/usr/bin/env python
"""
IBCRS Setup Script
Helps with initial project setup and configuration
"""

import os
import sys
import platform
import subprocess
from pathlib import Path


def main():
    print("=" * 60)
    print("IBCRS - Intelligent Biometric & Crop Recognition System")
    print("Initial Setup Script")
    print("=" * 60)
    print()

    # Detect OS
    current_os = platform.system()
    print(f"Detected OS: {current_os}")
    print()

    # Check Python version
    print("Checking Python installation...")
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print(f"❌ Python 3.8+ is required. You have Python {python_version.major}.{python_version.minor}")
        return False
    print(f"✓ Python {python_version.major}.{python_version.minor}.{python_version.micro}")
    print()

    # Create virtual environment if it doesn't exist
    venv_path = Path("venv")
    if not venv_path.exists():
        print("Creating virtual environment...")
        try:
            subprocess.check_call([sys.executable, "-m", "venv", "venv"])
            print("✓ Virtual environment created")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to create virtual environment: {e}")
            return False
    else:
        print("✓ Virtual environment already exists")
    print()

    # Determine pip path
    if current_os == "Windows":
        pip_path = venv_path / "Scripts" / "pip"
    else:
        pip_path = venv_path / "bin" / "pip"

    # Upgrade pip
    print("Upgrading pip...")
    try:
        subprocess.check_call([str(pip_path), "install", "--upgrade", "pip", "setuptools", "wheel"])
        print("✓ pip upgraded")
    except subprocess.CalledProcessError as e:
        print(f"⚠ Warning: Failed to upgrade pip: {e}")
    print()

    # Install PyTorch with specific instructions
    print("=" * 60)
    print("Installing PyTorch")
    print("=" * 60)
    print("""
Choose your PyTorch installation:

1. CPU only (no GPU required)
2. CUDA 11.8 (NVIDIA GPU support)
3. CUDA 12.1 (NVIDIA GPU support - Latest)

If you're unsure, select option 1 (CPU only)
""")

    while True:
        choice = input("Enter your choice (1-3): ").strip()
        if choice in ['1', '2', '3']:
            break
        print("Invalid choice. Please enter 1, 2, or 3.")

    pytorch_commands = {
        '1': [str(pip_path), "install", "torch", "torchvision", "torchaudio", "--index-url",
              "https://download.pytorch.org/whl/cpu"],
        '2': [str(pip_path), "install", "torch", "torchvision", "torchaudio", "--index-url",
              "https://download.pytorch.org/whl/cu118"],
        '3': [str(pip_path), "install", "torch", "torchvision", "torchaudio", "--index-url",
              "https://download.pytorch.org/whl/cu121"],
    }

    print("\nInstalling PyTorch... This may take a few minutes...")
    try:
        subprocess.check_call(pytorch_commands[choice])
        print("✓ PyTorch installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install PyTorch: {e}")
        return False
    print()

    # Install other dependencies
    print("Installing other dependencies...")
    try:
        subprocess.check_call([str(pip_path), "install", "-r", "backend/requirements.txt"])
        print("✓ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False
    print()

    # Final summary
    print("=" * 60)
    print("✓ Setup completed successfully!")
    print("=" * 60)
    print()
    print("Next steps:")
    if current_os == "Windows":
        print("1. Run: .\\start.bat")
    else:
        print("1. Run: bash start.sh")
    print("2. Open: http://localhost:5000 in your web browser")
    print("3. Click 'Start Detection' to begin")
    print()

    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
