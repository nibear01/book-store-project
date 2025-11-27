import os
import unittest
import urllib.parse
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class NavbarLinksTest(unittest.TestCase):
    def setUp(self):
        # Base URL of the running frontend app, e.g. http://localhost:3000
        self.base_url = os.getenv("BASE_URL", "http://localhost:5173")
        headless_env = os.getenv("HEADLESS", "1").lower()
        options = Options()
        options.headless = headless_env in ("1", "true", "yes")
        # Ensure geckodriver is in PATH or specify executable_path if needed
        self.driver = webdriver.Firefox(options=options)
        self.wait = WebDriverWait(self.driver, 10)

    def tearDown(self):
        if getattr(self, "driver", None):
            self.driver.quit()

    def test_navbar_links_navigate_correctly(self):
        # Mapping of visible link text -> expected path
        links = {
            "Home": "/",
            "About": "/about",
            "Categories": "/categories",
            "Shop": "/shop",
            "Terms": "/terms",
            "Contact": "/contact",
            # Auth links (visible when not authenticated)
            "Login": "/login",
            "Sign Up": "/signup",
        }

        for text, expected_path in links.items():
            # Load base fresh to have predictable state
            self.driver.get(self.base_url)
            # Wait for link to be present and clickable
            try:
                el = self.wait.until(EC.element_to_be_clickable((By.LINK_TEXT, text)))
            except Exception as e:
                self.fail(f"Link with text '{text}' not found or not clickable: {e}")

            # Click and wait for navigation
            el.click()

            if expected_path == "/":
                # For home, compare full base URL (avoid matching '/' in all URLs)
                def url_is_base(d):
                    return d.current_url.rstrip("/") == self.base_url.rstrip("/")
                try:
                    self.wait.until(url_is_base)
                except Exception:
                    self.fail(f"After clicking '{text}', expected URL to be base '{self.base_url}', got '{self.driver.current_url}'")
            else:
                # Wait until the expected path is contained in URL
                try:
                    self.wait.until(EC.url_contains(expected_path))
                except Exception:
                    self.fail(f"After clicking '{text}', expected path '{expected_path}' in URL but got '{self.driver.current_url}'")

            # Wait 5 seconds on the loaded page
            time.sleep(5)

            # Basic sanity assertion
            current = self.driver.current_url
            parsed_expected = urllib.parse.urljoin(self.base_url, expected_path)
            if expected_path == "/":
                self.assertEqual(current.rstrip("/"), parsed_expected.rstrip("/"),
                                 msg=f"'{text}' did not navigate to home as expected. URL: {current}")
            else:
                self.assertIn(expected_path, current,
                              msg=f"'{text}' did not navigate to '{expected_path}'. URL: {current}")

if __name__ == "__main__":
    # Run the tests: configure BASE_URL and HEADLESS via environment if needed
    # Example: BASE_URL=http://localhost:3000 HEADLESS=1 python navbar.py
    unittest.main()