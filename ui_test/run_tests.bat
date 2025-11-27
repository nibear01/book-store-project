@echo off
REM Universal test runner for Windows

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Activate virtual environment if it exists
if exist "%SCRIPT_DIR%venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call "%SCRIPT_DIR%venv\Scripts\activate.bat"
)

REM Run the test runner
python "%SCRIPT_DIR%run_tests.py" %*
