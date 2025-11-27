import os
import unittest
from playwright.sync_api import sync_playwright


class CategoriesBaseTest(unittest.TestCase):
    BASE_URL = os.environ.get("BASE_URL", "http://localhost:5173")
    CATEGORIES_URL = f"{BASE_URL}/categories"

    @classmethod
    def setUpClass(cls):
        cls._pw = sync_playwright().start()
        # Always use real Firefox (headed) for these UI tests as requested.
        slow_mo = int(os.environ.get("SLOW_MO", "0"))  # optional slow motion for debugging
        cls._browser = cls._pw.firefox.launch(headless=False, slow_mo=slow_mo)

    @classmethod
    def tearDownClass(cls):
        try:
            cls._browser.close()
        finally:
            cls._pw.stop()

    def setUp(self):
        self.context = self._browser.new_context()
        # Keep the same attribute name used across other tests
        self.driver = self.context.new_page()

    def tearDown(self):
        self.context.close()
