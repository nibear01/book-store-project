from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class SignupPage:
    H1_REGISTER = (By.XPATH, "//h1[normalize-space()='Register']")
    NAME = (By.NAME, "name")
    EMAIL = (By.NAME, "email")
    PHONE_TEL = (By.CSS_SELECTOR, ".phone-input-custom input[type='tel']")
    PASSWORD = (By.NAME, "password")
    CONFIRM = (By.NAME, "confirmPassword")
    ADDRESS = (By.NAME, "address")
    SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")
    # Error message shown under the Phone Number field in SignupPage.jsx
    # Structure: <label>Phone Number</label> <div class="phone-input-custom">...</div> <p class="text-red-500 ...">{errors.phone}</p>
    INVALID_PHONE_NUMBER = (
        By.XPATH,
        "//label[contains(normalize-space(),'Phone Number')]/following::div[contains(@class,'phone-input-custom')][1]/following-sibling::p[contains(@class,'text-red-500')]",
    )

    def __init__(self, driver):
        self.d = driver

    # --- navigation / waits ---
    def open(self, url):
        self.d.get(url)
        return self

    def wait_loaded(self, timeout=20):
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.H1_REGISTER))
        return self

    def fill_name(self, value):
        el = self.d.find_element(*self.NAME)
        el.clear(); el.send_keys(value)
        return self

    def fill_email(self, value):
        el = self.d.find_element(*self.EMAIL)
        el.clear(); el.send_keys(value)
        return self

    def fill_phone(self, value):
        el = self.d.find_element(*self.PHONE_TEL)
        el.clear()
        if value and not str(value).startswith(("+",)):
            el.send_keys(value)
        else:
            el.send_keys(value)
        return self

    def fill_password(self, value):
        el = self.d.find_element(*self.PASSWORD)
        el.clear(); el.send_keys(value)
        return self

    def fill_confirm(self, value):
        el = self.d.find_element(*self.CONFIRM)
        el.clear(); el.send_keys(value)
        return self

    def fill_address(self, value):
        el = self.d.find_element(*self.ADDRESS)
        el.clear(); el.send_keys(value)
        return self

    def wait_submit_clickable(self, timeout=20):
        WebDriverWait(self.d, timeout).until(EC.element_to_be_clickable(self.SUBMIT))
        return self

    def click_submit(self):
        self.d.find_element(*self.SUBMIT).click()
        return self
    
    def is_success_message_displayed(self):
        try:
            success_elements = self.d.find_elements(
                By.XPATH, 
                "//*[contains(@class, 'success') or contains(@class, 'toast') or "
                "contains(text(), 'Success') or contains(text(), 'success') or "
                "contains(text(), 'created') or contains(text(), 'registered')]"
            )
            return len(success_elements) > 0
        except Exception:
            return False
