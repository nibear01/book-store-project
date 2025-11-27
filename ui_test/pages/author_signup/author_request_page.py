import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

from ..login.set_up import BookStopSetUp
from ..utility.data_generator import unique_name, unique_email, unique_phone
from ..utility.mongo_helper import get_latest_otp, clear_otp_for_email


class AuthorRequestPage:
    """Page Object for the /authorrequest form.

    Methods mirror form fields and simple actions with at most one argument each.
    """

    # --- Locators ---
    H1_TITLE = (By.XPATH, "//h1[contains(normalize-space(),'Author Request')]")

    # Basic fields
    FULL_NAME = (By.NAME, "fullName")
    EMAIL = (By.NAME, "email")
    PHONE = (By.NAME, "phone")

    # Address fields
    ADDRESS_STREET = (By.NAME, "addressStreet")
    ADDRESS_CITY = (By.NAME, "addressCity")
    ADDRESS_STATE = (By.NAME, "addressState")
    ADDRESS_ZIP = (By.NAME, "addressZip")
    ADDRESS_COUNTRY = (By.NAME, "addressCountry")

    # Work/metadata
    AFFILIATION = (By.NAME, "affiliation")
    TITLE = (By.NAME, "title")
    TYPE_OF_WORK = (By.NAME, "typeOfWork")
    CATEGORY_TYPE = (By.NAME, "categoryType")
    ABSTRACT = (By.NAME, "abstract")

    # Agreements
    RIGHTS_ORIGINAL = (By.NAME, "rightsOriginal")
    RIGHTS_PUBLISH = (By.NAME, "rightsPublish")
    AGREE_EDITORIAL = (By.NAME, "agreeEditorial")

    # Misc
    ADDITIONAL_REQ = (By.NAME, "additionalRequests")
    SIGNATURE = (By.NAME, "signature")
    DATE = (By.NAME, "date")

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
    SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")
    EMAIL_VERIFY_ERROR = (By.ID, "err-emailVerified")
    ALERT = (By.CSS_SELECTOR, "[role='alert']")

    def __init__(self, driver):
        self.d = driver

    # --- navigation / waits ---
    def open(self, url):
        self.d.get(url)
        return self

    def wait_loaded(self, timeout=20):
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.H1_TITLE))
        return self

    # --- field fills (single-arg methods) ---
    def fill_full_name(self, value):
        el = self.d.find_element(*self.FULL_NAME)
        el.clear(); el.send_keys(value)
        return self

    def fill_email(self, value):
        el = self.d.find_element(*self.EMAIL)
        el.clear(); el.send_keys(value)
        return self

    def fill_phone(self, value):
        el = self.d.find_element(*self.PHONE)
        el.clear(); el.send_keys(value)
        return self

    def fill_address_street(self, value):
        el = self.d.find_element(*self.ADDRESS_STREET)
        el.clear(); el.send_keys(value)
        return self

    def fill_address_city(self, value):
        el = self.d.find_element(*self.ADDRESS_CITY)
        el.clear(); el.send_keys(value)
        return self

    def fill_address_state(self, value):
        el = self.d.find_element(*self.ADDRESS_STATE)
        el.clear(); el.send_keys(value)
        return self

    def fill_address_zip(self, value):
        el = self.d.find_element(*self.ADDRESS_ZIP)
        el.clear(); el.send_keys(value)
        return self

    def fill_address_country(self, value):
        el = self.d.find_element(*self.ADDRESS_COUNTRY)
        el.clear(); el.send_keys(value)
        return self

    def fill_affiliation(self, value):
        el = self.d.find_element(*self.AFFILIATION)
        el.clear(); el.send_keys(value)
        return self

    def fill_title(self, value):
        el = self.d.find_element(*self.TITLE)
        el.clear(); el.send_keys(value)
        return self

    def select_type_of_work(self, visible_text):
        Select(self.d.find_element(*self.TYPE_OF_WORK)).select_by_visible_text(visible_text)
        return self

    def select_category_type(self, visible_text):
        Select(self.d.find_element(*self.CATEGORY_TYPE)).select_by_visible_text(visible_text)
        return self

    def fill_abstract(self, value):
        el = self.d.find_element(*self.ABSTRACT)
        el.clear(); el.send_keys(value)
        return self

    def toggle_rights_original(self):
        self.d.find_element(*self.RIGHTS_ORIGINAL).click()
        return self

    def toggle_rights_publish(self):
        self.d.find_element(*self.RIGHTS_PUBLISH).click()
        return self

    def toggle_agree_editorial(self):
        self.d.find_element(*self.AGREE_EDITORIAL).click()
        return self

    def fill_additional_requests(self, value):
        el = self.d.find_element(*self.ADDITIONAL_REQ)
        el.clear(); el.send_keys(value)
        return self

    def fill_signature(self, value):
        el = self.d.find_element(*self.SIGNATURE)
        el.clear(); el.send_keys(value)
        return self

    def set_date(self, yyyy_mm_dd):
        el = self.d.find_element(*self.DATE)
        el.clear(); el.send_keys(yyyy_mm_dd)
        return self

    # --- OTP actions ---
    def wait_send_code_clickable(self, timeout=20):
        WebDriverWait(self.d, timeout).until(EC.element_to_be_clickable(self.SEND_CODE_BTN))
        return self

    def click_send_code(self):
        self.d.find_element(*self.SEND_CODE_BTN).click()
        return self

    def wait_otp_or_alert(self, timeout=20):
        """Waits for either the OTP input to appear OR an alert message (e.g., error).
        Returns a string indicating what was found: 'otp' or 'alert'.
        """
        wait = WebDriverWait(self.d, timeout)
        try:
            return wait.until(lambda d: 'otp' if d.find_elements(*self.OTP_INPUT) else ('alert' if d.find_elements(*self.ALERT) else False))
        except Exception:
            return None

    def fill_otp(self, value):
        el = self.d.find_element(*self.OTP_INPUT)
        el.clear(); el.send_keys(value)
        return self

    def click_verify(self):
        self.d.find_element(*self.VERIFY_BTN).click()
        return self

    # --- Submit ---
    def submit_text(self):
        return self.d.find_element(*self.SUBMIT).text

    def submit_requires_verify(self):
        """Returns True when the submit CTA indicates verification is required."""
        return "Verify Email" in self.submit_text()

    def click_submit(self):
        self.d.find_element(*self.SUBMIT).click()
        return self

    # --- errors ---
    def has_email_verify_error(self):
        return bool(self.d.find_elements(*self.EMAIL_VERIFY_ERROR))

    def wait_email_verify_error(self, timeout=10):
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.EMAIL_VERIFY_ERROR))
        return self


class AuthorRequestBaseTest(BookStopSetUp):
	AUTHOR_URL = f"{BookStopSetUp.BASE_URL}/authorrequest"

	def fill_required_fields(self, page):
		"""Fill the minimum required fields for the author request form."""
		name = unique_name()
		email = unique_email()
		phone = unique_phone()

		page.fill_full_name(name) \
			.fill_email(email) \
			.fill_phone(phone) \
			.fill_address_street("House-12, Road-3") \
			.fill_address_city("Dhaka") \
			.fill_address_state("Dhaka") \
			.fill_address_zip("1207") \
			.fill_address_country("Bangladesh") \
			.fill_title("Testing Manuscript") \
			.fill_abstract("This is a UI automation abstract for testing.") \
			.select_category_type("English") \
			.toggle_rights_original() \
			.toggle_rights_publish() \
			.toggle_agree_editorial() \
			.fill_signature("Test Automation")
		return email

	def verify_email(self, page, email):
		"""Handle the email verification process."""
		page.wait_send_code_clickable(10).click_send_code()
		time.sleep(3)  # Wait for OTP to be sent and processed

		appeared = page.wait_otp_or_alert(10)
		if appeared == "alert":
			self.skipTest("Backend not available or OTP send failed - cannot complete email verification test")

		otp_code = get_latest_otp(email)
		if otp_code is None:
			clear_otp_for_email(email)
			self.skipTest(f"OTP code not found in database for {email} - backend may not be running or using different DB")

		page.fill_otp(otp_code).click_verify()
		time.sleep(2)  # Wait for verification
		clear_otp_for_email(email)
