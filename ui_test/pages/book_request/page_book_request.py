# ui_test/pages/book_request/book_request_page.py
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from ..login.set_up import BookStopSetUp
from ..utility.data_generator import unique_name, unique_email
from ..utility.mongo_helper import get_latest_otp, clear_otp_for_email


class BookRequestPage:
    """Page Object for the Book Request form."""
    
    # --- Locators ---
    H1_TITLE = (By.XPATH, "//h1[contains(normalize-space(),'Book Request')]")
    
    # Required fields
    NAME = (By.NAME, "name")
    EMAIL = (By.NAME, "email")
    TITLE = (By.NAME, "title")
    
    # Optional fields
    AUTHOR = (By.NAME, "author")
    ISBN = (By.NAME, "isbn")
    PUBLISHER = (By.NAME, "publisher")
    NOTES = (By.NAME, "notes")
    
    # OTP flow
    SEND_CODE_BTN = (
        By.XPATH,
        "//button[normalize-space()='Send Code' or contains(.,'Resend Code') or contains(.,'Resend in') or normalize-space()='Sending...']",
    )
    OTP_INPUT = (By.NAME, "otpCode")
    VERIFY_BTN = (
        By.XPATH,
        "//button[normalize-space()='Verify' or normalize-space()='Verifying...']",
    )
    
    # Submit and alerts
    SUBMIT_BTN = (By.XPATH, "//button[@type='submit']")
    ALERT = (By.CSS_SELECTOR, "[role='alert']")
    
    # Error messages
    ERROR_NAME = (By.ID, "err-name")
    ERROR_EMAIL = (By.ID, "err-email")
    ERROR_TITLE = (By.ID, "err-title")
    ERROR_EMAIL_VERIFIED = (By.ID, "err-emailVerified")
    
    # Success indicators
    EMAIL_VERIFIED = (By.XPATH, "//p[contains(text(),'Email verified.')]")
    
    def __init__(self, driver):
        self.d = driver
    
    # --- Navigation ---
    def open(self, url):
        self.d.get(url)
        return self
    
    def wait_loaded(self, timeout=20):
        WebDriverWait(self.d, timeout).until(
            EC.presence_of_element_located(self.H1_TITLE)
        )
        return self
    
    # --- Field interactions ---
    def fill_name(self, value):
        el = self.d.find_element(*self.NAME)
        el.clear()
        el.send_keys(value)
        return self
    
    def fill_email(self, value):
        el = self.d.find_element(*self.EMAIL)
        el.clear()
        el.send_keys(value)
        return self
    
    def fill_title(self, value):
        el = self.d.find_element(*self.TITLE)
        el.clear()
        el.send_keys(value)
        return self
    
    def fill_author(self, value):
        el = self.d.find_element(*self.AUTHOR)
        el.clear()
        el.send_keys(value)
        return self
    
    def fill_isbn(self, value):
        el = self.d.find_element(*self.ISBN)
        el.clear()
        el.send_keys(value)
        return self
    
    def fill_publisher(self, value):
        el = self.d.find_element(*self.PUBLISHER)
        el.clear()
        el.send_keys(value)
        return self
    
    def fill_notes(self, value):
        el = self.d.find_element(*self.NOTES)
        el.clear()
        el.send_keys(value)
        return self
    
    # --- OTP flow ---
    def wait_send_code_clickable(self, timeout=20):
        WebDriverWait(self.d, timeout).until(
            EC.element_to_be_clickable(self.SEND_CODE_BTN)
        )
        return self
    
    def click_send_code(self):
        btn = self.d.find_element(*self.SEND_CODE_BTN)
        try:
            btn.click()
        except Exception:
            # Fallback to JavaScript click if regular click is intercepted
            self.d.execute_script("arguments[0].click();", btn)
        return self
    
    def wait_otp_input_visible(self, timeout=20):
        WebDriverWait(self.d, timeout).until(
            EC.visibility_of_element_located(self.OTP_INPUT)
        )
        return self
    
    def fill_otp(self, value):
        el = self.d.find_element(*self.OTP_INPUT)
        el.clear()
        el.send_keys(value)
        return self
    
    def click_verify(self):
        btn = self.d.find_element(*self.VERIFY_BTN)
        try:
            btn.click()
        except Exception:
            # Fallback to JavaScript click if regular click is intercepted
            self.d.execute_script("arguments[0].click();", btn)
        return self
    
    def is_email_verified(self):
        try:
            return len(self.d.find_elements(*self.EMAIL_VERIFIED)) > 0
        except:
            return False
    
    # --- Submit actions ---
    def get_submit_button_text(self):
        try:
            return self.d.find_element(*self.SUBMIT_BTN).text
        except:
            return ""
    
    def is_submit_enabled(self):
        try:
            btn = self.d.find_element(*self.SUBMIT_BTN)
            btn_text = self.get_submit_button_text()
            return btn.is_enabled() and "Verify Email" not in btn_text
        except:
            return False
    
    def click_submit(self):
        btn = self.d.find_element(*self.SUBMIT_BTN)
        try:
            btn.click()
        except Exception:
            # Fallback to JavaScript click if regular click is intercepted
            self.d.execute_script("arguments[0].click();", btn)
        return self
    
    # --- Validation helpers ---
    def has_error(self, field):
        # Some validations run on blur; ensure inputs are blurred before checking
        try:
            self.d.find_element(By.TAG_NAME, "body").click()
        except Exception:
            pass
        error_locators = {
            'name': self.ERROR_NAME,
            'email': self.ERROR_EMAIL,
            'title': self.ERROR_TITLE,
            'email_verified': self.ERROR_EMAIL_VERIFIED
        }
        els = self.d.find_elements(*error_locators[field])
        if not els:
            # Small wait to allow render
            try:
                WebDriverWait(self.d, 2).until(
                    EC.presence_of_element_located(error_locators[field])
                )
                els = self.d.find_elements(*error_locators[field])
            except Exception:
                pass
        return len(els) > 0
    
    def get_error_text(self, field):
        try:
            self.d.find_element(By.TAG_NAME, "body").click()
        except Exception:
            pass
        error_locators = {
            'name': self.ERROR_NAME,
            'email': self.ERROR_EMAIL,
            'title': self.ERROR_TITLE,
            'email_verified': self.ERROR_EMAIL_VERIFIED
        }
        try:
            WebDriverWait(self.d, 2).until(
                EC.presence_of_element_located(error_locators[field])
            )
        except Exception:
            pass
        elements = self.d.find_elements(*error_locators[field])
        return elements[0].text if elements else ""
    
    def get_alert_message(self):
        elements = self.d.find_elements(*self.ALERT)
        return elements[0].text if elements else ""
    
    def wait_for_alert(self, timeout=10):
        WebDriverWait(self.d, timeout).until(
            EC.visibility_of_element_located(self.ALERT)
        )
        return self
    
    # --- Form state helpers ---
    def is_send_code_disabled(self):
        btn = self.d.find_element(*self.SEND_CODE_BTN)
        return not btn.is_enabled() or "cursor-not-allowed" in btn.get_attribute("class")