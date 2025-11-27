# Bookstore UI Tests

This folder contains cross-platform UI tests using Selenium. It follows industry-standard Python packaging so tests run on Windows, Linux, and macOS without modifying `sys.path`.

Key points:
- `ui_test/` is a proper Python package (has `__init__.py`).
- Tests are discovered by pytest/unittest without any local bootstrap files.
- Imports use package-relative style inside `ui_test` (e.g., `from ..login.set_up import BookStopSetUp`).
- A `pytest.ini` at the repository root ensures consistent discovery across platforms.

## Quick start

1. Create/activate a virtual environment.
2. Install dependencies:
   - Windows PowerShell: `pip install -r ui_test/requirements.txt`
3. Run tests from the repository root or the `ui_test` folder:
   - `python ui_test/run_tests.py` (preferred)
   - or `pytest -q ui_test`

## Why no sys.path manipulation?

Altering `sys.path` in test files can hide import problems and is considered bad practice in many teams. Instead, rely on:
- A real package layout with `__init__.py` files.
- Running tests from the repository root or via `pytest.ini` so imports resolve consistently.

## Notes

- Browser setup is handled in `ui_test/pages/login/set_up.py`. It chooses the right Firefox binary and geckodriver per OS.
- To run headless, set `HEADLESS = True` in `BookStopSetUp`.
// for writing UI test
1. page object model
2. selenium & python
3. locator = xpath

junit reporting 
junit xml file  (important)
testng


only use assertTrue

test types:
1) sanity test / functional test
2) smoke test /functional test
3) integration test
4) regression test / functional test
5) edge case test
6) end to end (e-to-e)

// research
.ini file


# Count lines in tracked files only run this in git bash
git ls-files | grep -E '\.(py|js|jsx|ts|tsx|html|css|json)$' | xargs wc -l


# command to see how many test codes are there in a test file
"D:/imranslab/imranslab github/bookstore-app/ui_test/venv/Scripts/python.exe" -m pytest -q ui_test/pages/book_request/test_book_request.py::TestBookRequestSubmission --collect-only

# dont use id directly, use Page object model programming pattern, use name, value or data-testid


# for running the test for admin/users
& 'D:\imranslab\imranslab github\bookstore-app\ui_test\venv\Scripts\python.exe' 'ui_test/run_tests.py' 'ui_test/pages/admin_users/test_admin_users.py' -v --skip-validation

# for running the test of admin books page
& 'D:/imranslab/imranslab github/bookstore-app/ui_test/venv/Scripts/python.exe' 'D:/imranslab/imranslab github/bookstore-app/ui_test/run_tests.py' 'ui_test/pages/admin_books/test_admin_books.py' -v --skip-validation

# for running the test of user dashboard
& "D:/imranslab/imranslab github/bookstore-app/ui_test/venv/Scripts/python.exe" "D:/imranslab/imranslab github/bookstore-app/ui_test/run_tests.py" "ui_test/pages/userdashboard/test_userdashboard.py" -v --skip-validation

error:
============================================================== short test summary info ==============================================================
FAILED ui_test\pages\userdashboard\test_userdashboard.py::TestUserDashboard::test_14_password_change_successful - selenium.common.exceptions.TimeoutException: Message:
FAILED ui_test\pages\userdashboard\test_userdashboard.py::TestUserDashboard::test_15_verification_sections_present - selenium.common.exceptions.TimeoutException: Message:
FAILED ui_test\pages\userdashboard\test_userdashboard.py::TestUserDashboard::test_16_profile_data_persists_after_refresh - selenium.common.exceptions.TimeoutException: Message:
FAILED ui_test\pages\userdashboard\test_userdashboard.py::TestUserDashboard::test_17_single_password_change_with_auto_revert - selenium.common.exceptions.TimeoutException: Message:
FAILED ui_test\pages\userdashboard\test_userdashboard.py::TestUserDashboard::test_18_password_change_then_immediate_operations - selenium.common.exceptions.TimeoutException: Message:
FAILED ui_test\pages\userdashboard\test_userdashboard.py::TestUserDashboard::test_19_verify_original_password_always_works - selenium.common.exceptions.InvalidSessionIdException: Message: WebDriver session does not exist, or is not active; For documentation on this erro...
FAILED ui_test\pages\userdashboard\test_userdashboard.py::TestUserDashboard::test_20_password_tracking_integrity - selenium.common.exceptions.InvalidSessionIdException: Message: WebDriver session does not exist, or is not active; For documentation on this erro...
===================================================== 7 failed, 13 passed 

# for running the test of admin author request
& "D:/imranslab/imranslab github/bookstore-app/ui_test/venv/Scripts/python.exe" "D:/imranslab/imranslab github/bookstore-app/ui_test/run_tests.py" "ui_test/pages/admin_author_request/test_admin_author_request.py" -v --skip-validation

# for running the test of admin book request
& "D:/imranslab/imranslab github/bookstore-app/ui_test/venv/Scripts/python.exe" "D:/imranslab/imranslab github/bookstore-app/ui_test/run_tests.py" "ui_test/pages/admin_book_request/test_admin_book_request.py" -v --skip-validation


error for pytest.ini: 

pytest -m sanity -v
>>
================================================================ test session starts ================================================================
platform win32 -- Python 3.13.1, pytest-8.3.3, pluggy-1.6.0 -- D:\imranslab\imranslab github\bookstore-app\ui_test\venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: D:\imranslab\imranslab github\bookstore-app
configfile: pytest.ini
collected 34 items / 6 errors / 34 deselected / 0 selected                                                                                           

====================================================================== ERRORS =======================================================================
_________________________________________ ERROR collecting ui_test/pages/admin_author/test_admin_author.py __________________________________________ 
ImportError while importing test module 'D:\imranslab\imranslab github\bookstore-app\ui_test\pages\admin_author\test_admin_author.py'.
Hint: make sure your test modules/packages have valid Python names.
Traceback:
C:\Python313\Lib\importlib\__init__.py:88: in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
ui_test\pages\admin_author\test_admin_author.py:4: in <module>
    from pages.admin_author.page_admin_author import AdminAuthorBaseTest, AdminAuthorPage
E   ModuleNotFoundError: No module named 'pages'
_________________________________ ERROR collecting ui_test/pages/admin_author_request/test_admin_author_request.py __________________________________ 
ImportError while importing test module 'D:\imranslab\imranslab github\bookstore-app\ui_test\pages\admin_author_request\test_admin_author_request.py'.
Hint: make sure your test modules/packages have valid Python names.
Traceback:
C:\Python313\Lib\importlib\__init__.py:88: in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
ui_test\pages\admin_author_request\test_admin_author_request.py:3: in <module>
    from pages.admin_author_request.page_admin_author_request import AdminAuthorRequestBaseTest, AdminAuthorRequestPage
E   ModuleNotFoundError: No module named 'pages'
___________________________________ ERROR collecting ui_test/pages/admin_book_request/test_admin_book_request.py ____________________________________ 
ImportError while importing test module 'D:\imranslab\imranslab github\bookstore-app\ui_test\pages\admin_book_request\test_admin_book_request.py'.    
Hint: make sure your test modules/packages have valid Python names.
Traceback:
C:\Python313\Lib\importlib\__init__.py:88: in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
ui_test\pages\admin_book_request\test_admin_book_request.py:4: in <module>
    from pages.admin_book_request.page_admin_book_request import AdminBookRequestBaseTest, AdminBookRequestPage
E   ModuleNotFoundError: No module named 'pages'
__________________________________________ ERROR collecting ui_test/pages/admin_books/test_admin_books.py ___________________________________________ 
ImportError while importing test module 'D:\imranslab\imranslab github\bookstore-app\ui_test\pages\admin_books\test_admin_books.py'.
Hint: make sure your test modules/packages have valid Python names.
Traceback:
C:\Python313\Lib\importlib\__init__.py:88: in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
ui_test\pages\admin_books\test_admin_books.py:8: in <module>
    from pages.admin_books.page_admin_books import AdminBooksBaseTest, AdminBooksPage
E   ModuleNotFoundError: No module named 'pages'
_____________________________________ ERROR collecting ui_test/pages/admin_categories/test_admin_categories.py ______________________________________ 
ImportError while importing test module 'D:\imranslab\imranslab github\bookstore-app\ui_test\pages\admin_categories\test_admin_categories.py'.        
Hint: make sure your test modules/packages have valid Python names.
Traceback:
C:\Python313\Lib\importlib\__init__.py:88: in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
ui_test\pages\admin_categories\test_admin_categories.py:4: in <module>
    from pages.admin_categories.page_admin_categories import AdminCategoriesBaseTest, AdminCategoriesPage
E   ModuleNotFoundError: No module named 'pages'
________________________________________ ERROR collecting ui_test/pages/userdashboard/test_userdashboard.py _________________________________________ 
ImportError while importing test module 'D:\imranslab\imranslab github\bookstore-app\ui_test\pages\userdashboard\test_userdashboard.py'.
Hint: make sure your test modules/packages have valid Python names.
Traceback:
C:\Python313\Lib\importlib\__init__.py:88: in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
ui_test\pages\userdashboard\test_userdashboard.py:2: in <module>
    from pages.userdashboard.page_userdashboard import UserDashboardPage
E   ModuleNotFoundError: No module named 'pages'
============================================================== short test summary info ============================================================== 
ERROR ui_test/pages/admin_author/test_admin_author.py
ERROR ui_test/pages/admin_author_request/test_admin_author_request.py
ERROR ui_test/pages/admin_book_request/test_admin_book_request.py
ERROR ui_test/pages/admin_books/test_admin_books.py
ERROR ui_test/pages/admin_categories/test_admin_categories.py
ERROR ui_test/pages/userdashboard/test_userdashboard.py
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Interrupted: 6 errors during collection !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 
E   ModuleNotFoundError: No module named 'pages'
============================================================== short test summary info ============================================================== 
ERROR ui_test/pages/admin_author/test_admin_author.py
ERROR ui_test/pages/admin_author_request/test_admin_author_request.py
ERROR ui_test/pages/admin_book_request/test_admin_book_request.py
ERROR ui_test/pages/admin_books/test_admin_books.py
ERROR ui_test/pages/admin_categories/test_admin_categories.py
ERROR ui_test/pages/userdashboard/test_userdashboard.py
E   ModuleNotFoundError: No module named 'pages'
============================================================== short test summary info ============================================================== 
ERROR ui_test/pages/admin_author/test_admin_author.py
ERROR ui_test/pages/admin_author_request/test_admin_author_request.py
E   ModuleNotFoundError: No module named 'pages'
============================================================== short test summary info ============================================================== 
E   ModuleNotFoundError: No module named 'pages'
E   ModuleNotFoundError: No module named 'pages'
============================================================== short test summary info ============================================================== 
ERROR ui_test/pages/admin_author/test_admin_author.py
============================================================== short test summary info ============================================================== 
ERROR ui_test/pages/admin_author/test_admin_author.py
ERROR ui_test/pages/admin_author_request/test_admin_author_request.py
ERROR ui_test/pages/admin_book_request/test_admin_book_request.py
ERROR ui_test/pages/admin_books/test_admin_books.py
ERROR ui_test/pages/admin_categories/test_admin_categories.py
ERROR ui_test/pages/userdashboard/test_userdashboard.py
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Interrupted: 6 errors during collection !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 
========================================================= 34 deselected, 6 errors in 0.86s