# ui_test/pages/login/test_login.py
import os, shutil, unittest
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service

class BookStopLoginTest(unittest.TestCase):
    def setUp(self):
        # clear rogue env vars
        os.environ.pop("FIREFOX_BIN", None)
        os.environ.pop("MOZ_FIREFOX_BIN", None)
        os.environ.pop("MOZ_FIREFOX_BINARY", None)

        opts = Options()
        opts.add_argument("--headless")
        opts.binary_location = "/usr/bin/firefox"   # ✅ Firefox

        gecko = shutil.which("geckodriver") or "/snap/bin/geckodriver"
        service = Service(gecko)                    # ✅ geckodriver

        print("Using Firefox:", opts.binary_location)
        print("Using geckodriver:", gecko)

        self.driver = webdriver.Firefox(service=service, options=opts)
        self.addCleanup(self.driver.quit)
