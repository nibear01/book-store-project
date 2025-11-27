import json
from pathlib import Path
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from .set_up import BookStopSetUp


class BookStopLoginTest(BookStopSetUp):

    def test_login(self):
        driver = self.driver
        driver.get("http://localhost:5173/login")

        email_box = driver.find_element(By.NAME, "email")
        password_box = driver.find_element(By.NAME, "password")
        email_box.send_keys("admin@gmail.com")
        password_box.send_keys("123456")

        original_url = driver.current_url
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        login_button.click()

        WebDriverWait(driver, 30).until(lambda d: d.current_url != original_url)

        WebDriverWait(driver, 30).until(
            EC.title_contains("BookStop")
        )
        WebDriverWait(driver, 10).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )

        self.assertIn("BookStop", driver.title)
        cookies = driver.get_cookies()
        out_path = Path(__file__).parent / ".." / "session_cookies.json"
        out_path = out_path.resolve()
        try:
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(cookies, f, indent=2)
        except Exception as e:
            print(f"Failed saving cookies: {e}")

