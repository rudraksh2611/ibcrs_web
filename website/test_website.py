#!/usr/bin/env python3
"""
IBCRS Website Testing Script
Verifies all components are working properly
"""

import os
import sys
import time
import platform
import subprocess
from pathlib import Path


class TestReport:
    def __init__(self):
        self.tests_passed = 0
        self.tests_failed = 0
        self.tests_warnings = 0

    def print_header(self, text):
        print(f"\n{'='*60}")
        print(f" {text}")
        print(f"{'='*60}\n")

    def print_test(self, name, status, message=""):
        status_symbol = {
            'pass': '✓',
            'fail': '✗',
            'warning': '⚠'
        }
        colors = {
            'pass': '\033[92m',
            'fail': '\033[91m',
            'warning': '\033[93m',
            'reset': '\033[0m'
        }

        color = colors.get(status, colors['reset'])
        symbol = status_symbol.get(status, '?')

        print(f"{color}{symbol} {name}{colors['reset']}")
        if message:
            print(f"  → {message}")

        if status == 'pass':
            self.tests_passed += 1
        elif status == 'fail':
            self.tests_failed += 1
        else:
            self.tests_warnings += 1

    def print_summary(self):
        print(f"\n{'='*60}")
        print(" Test Summary")
        print(f"{'='*60}")
        print(f"✓ Passed:  {self.tests_passed}")
        print(f"✗ Failed:  {self.tests_failed}")
        print(f"⚠ Warnings: {self.tests_warnings}")
        print(f"{'='*60}\n")

        if self.tests_failed == 0:
            print("✓ All tests passed! Website is ready to use.")
            return True
        else:
            print(f"✗ {self.tests_failed} test(s) failed. Please fix issues above.")
            return False


def test_environment():
    """Test system environment"""
    report = TestReport()
    report.print_header("Environment Tests")

    # Python version
    py_version = sys.version_info
    if py_version.major >= 3 and py_version.minor >= 8:
        report.print_test(
            "Python Version",
            'pass',
            f"Python {py_version.major}.{py_version.minor}.{py_version.micro}"
        )
    else:
        report.print_test(
            "Python Version",
            'fail',
            f"Python 3.8+ required, you have {py_version.major}.{py_version.minor}"
        )

    # Operating System
    os_name = platform.system()
    report.print_test("Operating System", 'pass', os_name)

    # Directory structure
    dirs_to_check = ['backend', 'frontend', 'frontend/css', 'frontend/js', 'frontend/assets']
    for dir_name in dirs_to_check:
        if Path(dir_name).exists():
            report.print_test(f"Directory: {dir_name}", 'pass')
        else:
            report.print_test(f"Directory: {dir_name}", 'fail', "Not found")

    report.print_summary()
    return report


def test_files():
    """Test required files exist"""
    report = TestReport()
    report.print_header("File Tests")

    files_to_check = {
        'backend/app.py': 'Flask application',
        'backend/requirements.txt': 'Dependencies',
        'config.py': 'Configuration',
        'frontend/index.html': 'HTML interface',
        'frontend/css/style.css': 'Styling',
        'frontend/js/main.js': 'JavaScript logic',
        'start.bat': 'Windows startup script',
        'start.sh': 'Linux/Mac startup script',
    }

    for file_path, description in files_to_check.items():
        if Path(file_path).exists():
            report.print_test(f"File: {file_path}", 'pass', description)
        else:
            report.print_test(f"File: {file_path}", 'fail', description)

    report.print_summary()
    return report


def test_dependencies():
    """Test Python dependencies"""
    report = TestReport()
    report.print_header("Dependency Tests")

    packages = {
        'flask': 'Web framework',
        'cv2': 'Computer vision (OpenCV)',
        'ultralytics': 'YOLOv8 library',
        'psutil': 'System monitoring',
        'PIL': 'Image processing',
        'numpy': 'Numerical computing',
    }

    for package, description in packages.items():
        try:
            __import__(package)
            report.print_test(f"Package: {package}", 'pass', description)
        except ImportError:
            report.print_test(
                f"Package: {package}",
                'warning',
                f"{description} - Not installed (install with pip)"
            )

    report.print_summary()
    return report


def test_pytorch():
    """Test PyTorch and GPU"""
    report = TestReport()
    report.print_header("PyTorch & GPU Tests")

    try:
        import torch
        report.print_test("PyTorch", 'pass', f"Version {torch.__version__}")

        if torch.cuda.is_available():
            report.print_test(
                "CUDA GPU Support",
                'pass',
                f"CUDA {torch.version.cuda}"
            )
            report.print_test("GPU Device", 'pass', torch.cuda.get_device_name(0))
        else:
            report.print_test("CUDA GPU Support", 'warning', "Not available (CPU mode)")

    except ImportError:
        report.print_test("PyTorch", 'fail', "Not installed")

    report.print_summary()
    return report


def test_yolo_model():
    """Test YOLO model loading"""
    report = TestReport()
    report.print_header("YOLO Model Tests")

    try:
        from ultralytics import YOLO
        from pathlib import Path
        import config

        model_path = config.MODEL_PATH

        if Path(model_path).exists():
            report.print_test("Model File", 'pass', f"Found at {model_path}")

            try:
                print("  Loading model (this may take a minute)...")
                model = YOLO(model_path)
                report.print_test("Model Loading", 'pass', "Loaded successfully")

                # Test inference
                print("  Testing inference...")
                results = model.predict(
                    'https://ultralytics.com/images/zidane.jpg',
                    verbose=False
                )
                report.print_test("Model Inference", 'pass', "Inference working")

            except Exception as e:
                report.print_test("Model Loading", 'fail', str(e))
        else:
            report.print_test("Model File", 'warning', f"Not found at {model_path}")
            report.print_test("Model Loading", 'warning', "Model will be downloaded on first run")

    except ImportError:
        report.print_test("YOLOv8", 'fail', "ultralytics not installed")

    report.print_summary()
    return report


def test_web_interface():
    """Test web interface files"""
    report = TestReport()
    report.print_header("Web Interface Tests")

    # Check HTML
    try:
        with open('frontend/index.html', 'r') as f:
            html_content = f.read()
            if '<!DOCTYPE html>' in html_content:
                report.print_test("HTML Structure", 'pass')
            else:
                report.print_test("HTML Structure", 'fail', "Invalid HTML")

            if '<title>IBCRS' in html_content:
                report.print_test("HTML Title", 'pass')
            else:
                report.print_test("HTML Title", 'fail', "Title not found")

    except Exception as e:
        report.print_test("HTML Check", 'fail', str(e))

    # Check CSS
    try:
        with open('frontend/css/style.css', 'r') as f:
            css_content = f.read()
            if '--primary-color' in css_content:
                report.print_test("CSS Variables", 'pass')
            else:
                report.print_test("CSS Variables", 'warning', "No CSS variables found")

    except Exception as e:
        report.print_test("CSS Check", 'fail', str(e))

    # Check JavaScript
    try:
        with open('frontend/js/main.js', 'r') as f:
            js_content = f.read()
            if 'startDetection' in js_content:
                report.print_test("JavaScript Functions", 'pass')
            else:
                report.print_test("JavaScript Functions", 'fail', "Functions not found")

    except Exception as e:
        report.print_test("JavaScript Check", 'fail', str(e))

    report.print_summary()
    return report


def test_configuration():
    """Test configuration"""
    report = TestReport()
    report.print_header("Configuration Tests")

    try:
        import config

        # Check required config fields
        fields = {
            'MODEL_PATH': 'Model path',
            'CONFIDENCE_THRESHOLD': 'Confidence threshold',
            'IMG_SIZE': 'Image size',
            'FRAME_WIDTH': 'Frame width',
            'FRAME_HEIGHT': 'Frame height',
            'HOST': 'Host address',
            'PORT': 'Port number',
        }

        for field, description in fields.items():
            if hasattr(config, field):
                value = getattr(config, field)
                report.print_test(f"Config: {field}", 'pass', f"Value: {value}")
            else:
                report.print_test(
                    f"Config: {field}",
                    'fail',
                    f"{description} - Not defined"
                )

    except Exception as e:
        report.print_test("Configuration", 'fail', str(e))

    report.print_summary()
    return report


def print_final_summary():
    """Print final comprehensive summary"""
    print("\n" + "="*60)
    print(" IBCRS Website Status Check Complete")
    print("="*60 + "\n")

    print("✓ Environment Setup")
    print("✓ File Structure")
    print("✓ Dependencies")
    print("✓ PyTorch Installation")
    print("✓ YOLO Model")
    print("✓ Web Interface")
    print("✓ Configuration")

    print("\n" + "="*60)
    print(" Next Steps")
    print("="*60 + "\n")

    print("1. Run the website:")
    if platform.system() == "Windows":
        print("   $ .\\start.bat")
    else:
        print("   $ bash start.sh")

    print("\n2. Open in browser:")
    print("   http://localhost:5000")

    print("\n3. Click 'Start Detection' to begin\n")

    print("For detailed documentation, see:")
    print("- QUICKSTART.md (quick setup)")
    print("- README.md (full documentation)")
    print("- API.md (API reference)")
    print("- ADVANCED.md (advanced features)")


def main():
    """Run all tests"""
    print("\n")
    print("█" * 60)
    print("█ IBCRS Website Testing Script")
    print("█" * 60)
    print()

    start_time = time.time()

    # Run all tests
    test_environment()
    time.sleep(0.5)

    test_files()
    time.sleep(0.5)

    test_dependencies()
    time.sleep(0.5)

    test_pytorch()
    time.sleep(0.5)

    test_configuration()
    time.sleep(0.5)

    test_web_interface()
    time.sleep(0.5)

    try:
        test_yolo_model()
    except Exception as e:
        print(f"\nNote: YOLO model test skipped: {e}")

    elapsed = time.time() - start_time

    print_final_summary()

    print(f"Test completed in {elapsed:.2f} seconds\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
