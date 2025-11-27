#!/usr/bin/env python3
"""
Universal Cross-Platform Test Runner
Runs UI tests securely on Windows, Linux, and macOS
"""
import pytest
import sys
import os
import platform
import subprocess
from pathlib import Path
from typing import List, Optional

# ANSI color codes (work on most terminals)
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'

def print_colored(message: str, color: str = RESET):
    """Print colored text (works on Windows 10+, Linux, macOS)"""
    print(f"{color}{message}{RESET}")

def get_project_root() -> Path:
    """Get the project root directory"""
    # This file is in ui_test/, so project root is parent
    return Path(__file__).resolve().parent.parent

def ensure_playwright_browsers() -> bool:
    """Ensure Playwright browsers (firefox) are installed. Returns True if ok or not needed."""
    try:
        import playwright  # noqa: F401
    except ImportError:
        return True  # Not using Playwright tests

    try:
        print_colored("\n📦 Ensuring Playwright browsers are installed (firefox)...", BLUE)
        # Use current Python to run the module; idempotent if already installed
        result = subprocess.run(
            [sys.executable, "-m", "playwright", "install", "firefox"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            cwd=str(get_project_root()),
        )
        if result.returncode == 0:
            print_colored("   ✅ Playwright firefox installed/ready", GREEN)
            return True
        else:
            print_colored("   ⚠️  Playwright install returned a non-zero exit code", YELLOW)
            print(result.stdout)
            return False
    except Exception as e:
        print_colored(f"   ❌ Failed to run Playwright install: {e}", RED)
        return False

def validate_environment() -> bool:
    """Validate that the environment is set up correctly"""
    project_root = get_project_root()
    
    print_colored(f"\n{'='*70}", BLUE)
    print_colored(f"{BOLD}🔍 Environment Validation", BLUE)
    print_colored(f"{'='*70}", BLUE)
    
    checks_passed = True
    
    # Check Python version
    py_version = sys.version_info
    print(f"\n📌 Python Version: {py_version.major}.{py_version.minor}.{py_version.micro}")
    if py_version.major < 3 or (py_version.major == 3 and py_version.minor < 8):
        print_colored("   ❌ Python 3.8+ required", RED)
        checks_passed = False
    else:
        print_colored("   ✅ Python version OK", GREEN)
    
    # Check platform
    system = platform.system()
    print(f"\n📌 Operating System: {system} ({platform.platform()})")
    if system in ['Windows', 'Linux', 'Darwin']:
        print_colored(f"   ✅ Platform supported", GREEN)
    else:
        print_colored(f"   ⚠️  Platform might not be fully supported", YELLOW)
    
    # Check virtual environment
    in_venv = sys.prefix != sys.base_prefix
    print(f"\n📌 Virtual Environment: {'Active' if in_venv else 'Not Active'}")
    if in_venv:
        print_colored(f"   ✅ Running in virtual environment", GREEN)
    else:
        print_colored(f"   ⚠️  Not in virtual environment (recommended)", YELLOW)
    
    # Check project structure
    print(f"\n📌 Project Structure:")
    required_dirs = [
        project_root / "ui_test",
        project_root / "ui_test" / "pages",
        project_root / "ui_test" / "pages" / "login",
        project_root / "ui_test" / "pages" / "signup",
        project_root / "ui_test" / "pages" / "book_request",
    ]
    
    for dir_path in required_dirs:
        if dir_path.exists():
            print_colored(f"   ✅ {dir_path.relative_to(project_root)}", GREEN)
        else:
            print_colored(f"   ❌ {dir_path.relative_to(project_root)} not found", RED)
            checks_passed = False
    
    # Check __init__.py files
    print(f"\n📌 Package Structure:")
    init_files = [
        project_root / "ui_test" / "__init__.py",
        project_root / "ui_test" / "pages" / "__init__.py",
        project_root / "ui_test" / "pages" / "login" / "__init__.py",
        project_root / "ui_test" / "pages" / "signup" / "__init__.py",
        project_root / "ui_test" / "pages" / "book_request" / "__init__.py",
    ]
    
    for init_file in init_files:
        if init_file.exists():
            print_colored(f"   ✅ {init_file.relative_to(project_root)}", GREEN)
        else:
            print_colored(f"   ⚠️  {init_file.relative_to(project_root)} missing", YELLOW)
    
    # Check dependencies
    print(f"\n📌 Dependencies:")
    required_packages = ['selenium', 'pymongo']
    
    for package in required_packages:
        try:
            __import__(package)
            print_colored(f"   ✅ {package} installed", GREEN)
        except ImportError:
            print_colored(f"   ❌ {package} not installed", RED)
            checks_passed = False
    
    print_colored(f"\n{'='*70}\n", BLUE)
    return checks_passed

def run_tests(test_path: Optional[str] = None, verbose: bool = True) -> int:
    """
    Run tests using pytest or unittest
    
    Args:
        test_path: Optional path to specific test file or directory
        verbose: Enable verbose output
    
    Returns:
        Exit code (0 = success, non-zero = failure)
    """
    project_root = get_project_root()
    
    # Change to project root
    os.chdir(project_root)
    
    # Determine what to test
    if test_path:
        test_target = test_path
    else:
        test_target = "ui_test"
    
    print_colored(f"\n{'='*70}", BLUE)
    print_colored(f"{BOLD}🚀 Running Tests", BLUE)
    print_colored(f"{'='*70}", BLUE)
    print(f"\n📁 Working Directory: {project_root}")
    print(f"🎯 Test Target: {test_target}")
    print(f"🔧 Python: {sys.executable}\n")
    
    # Try pytest first (preferred)
    try:
        
        print_colored("Using pytest runner...\n", GREEN)
        
        args = [test_target]
        if verbose:
            args.append("-v")
        args.extend(["--tb=short", "--color=yes"])
        
        return pytest.main(args)
    
    except ImportError:
        # Fallback to unittest
        print_colored("pytest not found, using unittest runner...\n", YELLOW)
        
        cmd = [sys.executable, "-m", "unittest", "discover"]
        cmd.extend(["-s", test_target, "-p", "test_*.py"])
        if verbose:
            cmd.append("-v")
        
        result = subprocess.run(cmd, cwd=project_root)
        return result.returncode

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Universal Cross-Platform Test Runner for Bookstore UI Tests"
    )
    parser.add_argument(
        "test_path",
        nargs="?",
        help="Path to test file or directory (default: all tests)"
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Verbose output"
    )
    parser.add_argument(
        "--skip-validation",
        action="store_true",
        help="Skip environment validation"
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List available test files"
    )
    
    args = parser.parse_args()
    
    # Print header
    print_colored(f"\n{'='*70}", BLUE)
    print_colored(f"{BOLD}📚 Bookstore UI Test Suite", BLUE)
    print_colored(f"   Cross-Platform Test Runner", BLUE)
    print_colored(f"{'='*70}\n", BLUE)
    
    # List tests if requested
    if args.list:
        project_root = get_project_root()
        test_files = list((project_root / "ui_test" / "pages").rglob("test_*.py"))
        
        print_colored("Available Test Files:", BOLD)
        for test_file in sorted(test_files):
            rel_path = test_file.relative_to(project_root)
            print(f"  • {rel_path}")
        print()
        return 0
    
    # Validate environment
    if not args.skip_validation:
        if not validate_environment():
            print_colored("❌ Environment validation failed!", RED)
            print_colored("   Fix the issues above or use --skip-validation to proceed anyway.\n", YELLOW)
            return 1
        print_colored("✅ Environment validation passed!\n", GREEN)

        # Best-effort ensure Playwright browsers are present if tests use Playwright
        ensure_playwright_browsers()
    
    # Run tests
    exit_code = run_tests(args.test_path, args.verbose)
    
    # Print summary
    print_colored(f"\n{'='*70}", BLUE)
    if exit_code == 0:
        print_colored(f"{BOLD}✅ Tests Passed!", GREEN)
    else:
        print_colored(f"{BOLD}❌ Tests Failed!", RED)
    print_colored(f"{'='*70}\n", BLUE)
    
    return exit_code

if __name__ == "__main__":
    sys.exit(main())
