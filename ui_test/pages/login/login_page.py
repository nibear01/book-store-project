from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class LoginPage:
    EMAIL = (By.NAME, "email")
    PASSWORD = (By.NAME, "password")
    SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")
    
    def __init__(self, driver):
        self.d = driver
    
    def open(self, url):
        self.d.get(url)
        return self
    
    def wait_loaded(self, timeout=20):
        WebDriverWait(self.d, timeout).until(
            EC.presence_of_element_located(self.EMAIL)
        )
        return self
    
    def fill_email(self, email):
        el = self.d.find_element(*self.EMAIL)
        el.clear()
        el.send_keys(email)
        return self
    
    def fill_password(self, password):
        el = self.d.find_element(*self.PASSWORD)
        el.clear()
        el.send_keys(password)
        return self
    
    def click_submit(self):
        self.d.find_element(*self.SUBMIT).click()
        return self
