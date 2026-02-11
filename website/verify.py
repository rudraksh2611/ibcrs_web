#!/usr/bin/env python3
"""
IBCRS Website - Quick Verification
Run this to verify your website is ready to use
"""

import os
from pathlib import Path


def verify_structure():
    """Verify project structure"""
    required_files = [
        'backend/app.py',
        'backend/requirements.txt',
        'config.py',
        'frontend/index.html',
        'frontend/css/style.css',
        'frontend/js/main.js',
        'start.bat',
        'start.sh',
        'setup.py',
        'README.md',
        'QUICKSTART.md',
        'API.md',
    ]

    required_dirs = [
        'backend',
        'frontend',
        'frontend/css',
        'frontend/js',
        'frontend/assets',
    ]

    print("\n✓ IBCRS Website Verification")
    print("=" * 50)

    # Check directories
    print("\nDirectories:")
    all_dirs_ok = True
    for dir_name in required_dirs:
        if Path(dir_name).exists():
            print(f"  ✓ {dir_name}/")
        else:
            print(f"  ✗ {dir_name}/ - MISSING")
            all_dirs_ok = False

    # Check files
    print("\nCore Files:")
    all_files_ok = True
    for file_path in required_files:
        if Path(file_path).exists():
            size = Path(file_path).stat().st_size
            print(f"  ✓ {file_path} ({size:,} bytes)")
        else:
            print(f"  ✗ {file_path} - MISSING")
            all_files_ok = False

    # Summary
    print("\n" + "=" * 50)
    if all_dirs_ok and all_files_ok:
        print("✓ Website structure is COMPLETE!")
        print("\nNext steps:")
        print("  1. Run: python setup.py")
        print("  2. Run: .\\start.bat  (Windows) or bash start.sh (Linux/Mac)")
        print("  3. Open: http://localhost:5000")
        return True
    else:
        print("✗ Some files are missing!")
        return False


if __name__ == "__main__":
    verify_structure()
