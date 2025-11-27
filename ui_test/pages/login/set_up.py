import os
import shutil
import platform
import unittest
import requests
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BookStopSetUp(unittest.TestCase):
    BASE_URL = "http://localhost:5173"
    SIGNUP_URL = f"{BASE_URL}/signup"
    REDIRECT_TIMEOUT = 500
    VISIBLE_DELAY_AFTER_SUCCESS = 1
    IMPLICIT_WAIT = 3  
    HEADLESS = False 
    ADMIN_EMAIL = os.environ.get("E2E_ADMIN_EMAIL", "admin@gmail.com")
    ADMIN_PASSWORD = os.environ.get("E2E_ADMIN_PASSWORD", "123456")


    def setUp(self):
        print(f"[BookStopSetUp] Starting setUp | BASE_URL={self.BASE_URL} | HEADLESS={self.HEADLESS}")
        # Clear any rogue env that might point to bad binaries
        for k in ("FIREFOX_BIN", "MOZ_FIREFOX_BIN", "MOZ_FIREFOX_BINARY"):
            os.environ.pop(k, None)

        opts = Options()
        if self.HEADLESS:
            opts.add_argument("--headless")
        # Faster page readiness for SPAs
        try:
            opts.page_load_strategy = "eager"
        except Exception:
            pass

        system = platform.system().lower()

        if system.startswith("win"):
            # Windows-specific setup
            program_files = os.environ.get("PROGRAMFILES", r"C:\\Program Files")
            program_files_x86 = os.environ.get("PROGRAMFILES(X86)", r"C:\\Program Files (x86)")
            local_app_data = os.environ.get("LOCALAPPDATA", r"C:\\Users\\%USERNAME%\\AppData\\Local")
            firefox_candidates = [
                fr"{program_files}\\Mozilla Firefox\\firefox.exe",
                fr"{program_files_x86}\\Mozilla Firefox\\firefox.exe",
                fr"{local_app_data}\\Mozilla Firefox\\firefox.exe",
            ]
            for path in firefox_candidates:
                if path and os.path.exists(path):
                    opts.binary_location = path
                    break

            gecko = shutil.which("geckodriver")
            service = Service(gecko) if gecko else Service()  # Selenium Manager fallback

            print("[Windows] Using Firefox:", getattr(opts, "binary_location", None))
            print("[Windows] Using geckodriver:", gecko or "Selenium Manager (auto)")

            self.driver = webdriver.Firefox(service=service, options=opts)
            try:
                self.driver.maximize_window()
            except Exception:
                pass
            self.driver.implicitly_wait(self.IMPLICIT_WAIT)
        else:
            # Ubuntu/Linux (make robust & prefer Selenium Manager for geckodriver)
            firefox_candidates = [
                "/snap/firefox/current/usr/lib/firefox/firefox",  # Snap Firefox real binary
                "/usr/lib/firefox/firefox",                       # DEB
                "/usr/bin/firefox",                               # wrapper
            ]
            for path in firefox_candidates:
                if os.path.exists(path):
                    opts.binary_location = path
                    break

            # Quick check: if frontend BASE_URL isn't reachable, skip tests early to avoid long hangs
            try:
                print("[Linux] Probing frontend reachability...", self.BASE_URL)
                requests.get(self.BASE_URL, timeout=3)
                print("[Linux] Frontend reachable ✅")
            except Exception:
                self.skipTest(f"Frontend not reachable at {self.BASE_URL}. Start the app and retry.")

            gecko = shutil.which("geckodriver")
            print("[Linux] Using Firefox:", getattr(opts, "binary_location", None))
            print("[Linux] Using geckodriver:", gecko or "Selenium Manager (auto)")
            try:
                service = Service(gecko) if gecko else Service()
                self.driver = webdriver.Firefox(service=service, options=opts)
            except Exception:
                # Fallback: let Selenium choose defaults entirely
                self.driver = webdriver.Firefox(options=opts)

            try:
                self.driver.maximize_window()
            except Exception:
                pass
            self.driver.implicitly_wait(self.IMPLICIT_WAIT)

    # --- helpers for derived tests ---
    def login_as_admin(self):
        self.driver.get(f"{self.BASE_URL}/login")
        # Wait for login form
        WebDriverWait(self.driver, 30).until(EC.presence_of_element_located((By.NAME, "email")))
        email = self.driver.find_element(By.NAME, "email")
        password = self.driver.find_element(By.NAME, "password")
        email.clear(); email.send_keys(self.ADMIN_EMAIL)
        password.clear(); password.send_keys(self.ADMIN_PASSWORD)
        btns = self.driver.find_elements(By.NAME, "login-submit-btn")
        if btns:
            btns[0].click()
        else:
            self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        # Wait until redirected to any admin route
        WebDriverWait(self.driver, 30).until(EC.url_contains("/admin"))

    def login_as_user(self):
        self.driver.get(f"{self.BASE_URL}/login")
        WebDriverWait(self.driver, 30).until(EC.presence_of_element_located((By.NAME, "email")))
        email = self.driver.find_element(By.NAME, "email")
        password = self.driver.find_element(By.NAME, "password")
        email.clear(); email.send_keys(self.ADMIN_EMAIL)
        password.clear(); password.send_keys(self.ADMIN_PASSWORD)
        btns = self.driver.find_elements(By.NAME, "login-submit-btn")
        if btns:
            btns[0].click()
        else:
            self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        WebDriverWait(self.driver, 30).until(EC.url_contains("/admin"))    

    def tearDown(self):
        if hasattr(self, "driver") and self.driver:
            self.driver.quit()
