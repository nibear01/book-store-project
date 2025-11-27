from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class UserDashboardPage:
    PROFILE_HEADER = (By.CSS_SELECTOR, '[name="profile_header"]')
    PROFILE_NAME = (By.CSS_SELECTOR, '[name="profile_header_name"]')
    PROFILE_EMAIL = (By.CSS_SELECTOR, '[name="profile_header_email"]')
    
    ACCOUNT_OVERVIEW = (By.CSS_SELECTOR, '[name="account_overview_userdashboard"]')
    OVERVIEW_EMAIL = (By.CSS_SELECTOR, '[name="overview_email_value_userdashboard"]')
    
    TAB_OVERVIEW = (By.CSS_SELECTOR, '[name="tab_overview"]')
    TAB_PROFILE = (By.CSS_SELECTOR, '[name="tab_profile"]')
    TAB_VERIFICATION = (By.CSS_SELECTOR, '[name="tab_verification"]')
    TAB_SECURITY = (By.CSS_SELECTOR, '[name="tab_security"]')
    
    PROFILE_NAME_INPUT = (By.CSS_SELECTOR, '[name="profile_name"]')
    SAVE_PROFILE_BTN = (By.CSS_SELECTOR, '[name="btn_save_profile"]')
    CANCEL_PROFILE_BTN = (By.CSS_SELECTOR, '[name="btn_cancel_profile"]')
    
    EMAIL_VERIFICATION_SECTION = (By.CSS_SELECTOR, '[name="email_verification_section"]')
    PHONE_VERIFICATION_SECTION = (By.CSS_SELECTOR, '[name="phone_verification_section"]')
    
    SECURITY_FORM = (By.CSS_SELECTOR, '[name="form_security_tab"]')
    CURRENT_PASSWORD = (By.CSS_SELECTOR, '[name="currentPassword"]')
    NEW_PASSWORD = (By.CSS_SELECTOR, '[name="newPassword"]')
    CONFIRM_PASSWORD = (By.CSS_SELECTOR, '[name="confirmPassword"]')
    UPDATE_PASSWORD_BTN = (By.CSS_SELECTOR, '[name="btn_update_password"]')
    
    TOAST_SUCCESS = (By.CSS_SELECTOR, ".Toastify__toast--success")
    TOAST_ERROR = (By.CSS_SELECTOR, ".Toastify__toast--error")
    
    LOGIN_EMAIL = (By.NAME, "email")
    LOGIN_PASSWORD = (By.NAME, "password")
    LOGIN_SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")
    
    ACCOUNT_LINK = (By.CSS_SELECTOR, '[name="navbar_account_link_desktop"]')
    PROFILE_DROPDOWN = (By.CSS_SELECTOR, '[name="navbar_account_link"]')

    def __init__(self, driver, base_url):
        self.driver = driver
        self.BASE_URL = base_url

    def wait_loaded(self, timeout=30):
        WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located(self.PROFILE_HEADER)
        )
        return self

    def wait_visible(self, locator, timeout=20):
        return WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located(locator)
        )

    def wait_clickable(self, locator, timeout=20):
        return WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable(locator)
        )

    def wait_present(self, locator, timeout=20):
        return WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located(locator)
        )

    def wait_invisible(self, locator, timeout=20):
        WebDriverWait(self.driver, timeout).until(
            EC.invisibility_of_element_located(locator)
        )
        return True

    def login(self, email, password):
        self.driver.get(f"{self.BASE_URL}/login")
        self.wait_present(self.LOGIN_EMAIL)
        
        email_field = self.wait_clickable(self.LOGIN_EMAIL)
        email_field.clear()
        email_field.send_keys(email)
        
        password_field = self.wait_clickable(self.LOGIN_PASSWORD)
        password_field.clear()
        password_field.send_keys(password)
        
        submit_btn = self.wait_clickable(self.LOGIN_SUBMIT)
        submit_btn.click()
        
        WebDriverWait(self.driver, 30).until(
            lambda driver: "/login" not in driver.current_url
        )
        
        self.navigate_to_account()

    def navigate_to_account(self):
        try:
            account_link = self.wait_clickable(self.ACCOUNT_LINK, timeout=10)
            account_link.click()
        except:
            try:
                profile_dropdown = self.wait_clickable(self.PROFILE_DROPDOWN, timeout=10)
                profile_dropdown.click()
            except:
                self.driver.get(f"{self.BASE_URL}/account")
        
        WebDriverWait(self.driver, 30).until(
            lambda driver: "/account" in driver.current_url
        )
        self.wait_loaded()

    def navigate_to_logout(self):
        self.driver.get(f"{self.BASE_URL}/logout")
        WebDriverWait(self.driver, 10).until(
            lambda driver: "/login" in driver.current_url
        )

    def switch_to_tab(self, tab_name):
        if tab_name == 'overview':
            self.wait_clickable(self.TAB_OVERVIEW).click()
        elif tab_name == 'profile':
            self.wait_clickable(self.TAB_PROFILE).click()
        elif tab_name == 'verification':
            self.wait_clickable(self.TAB_VERIFICATION).click()
        elif tab_name == 'security':
            self.wait_clickable(self.TAB_SECURITY).click()
        
        WebDriverWait(self.driver, 5).until(
            lambda driver: driver.execute_script("return document.readyState") == "complete"
        )

    def is_tab_active(self, tab_name):
        try:
            if tab_name == 'overview':
                tab = self.wait_present(self.TAB_OVERVIEW, timeout=5)
            elif tab_name == 'profile':
                tab = self.wait_present(self.TAB_PROFILE, timeout=5)
            elif tab_name == 'verification':
                tab = self.wait_present(self.TAB_VERIFICATION, timeout=5)
            elif tab_name == 'security':
                tab = self.wait_present(self.TAB_SECURITY, timeout=5)
            return "bg-white" in tab.get_attribute("class")
        except:
            return False

    def get_header_name(self):
        return self.wait_visible(self.PROFILE_NAME).text.strip()

    def get_header_email(self):
        return self.wait_visible(self.PROFILE_EMAIL).text.strip()

    def get_overview_email(self):
        return self.wait_visible(self.OVERVIEW_EMAIL).text.strip()

    def set_profile_name(self, name):
        element = self.wait_visible(self.PROFILE_NAME_INPUT)
        element.clear()
        element.send_keys(name)

    def click_save_profile_button(self):
        self.wait_clickable(self.SAVE_PROFILE_BTN).click()

    def click_cancel_profile_button(self):
        self.wait_clickable(self.CANCEL_PROFILE_BTN).click()

    def set_current_password(self, password):
        element = self.wait_visible(self.CURRENT_PASSWORD)
        element.clear()
        element.send_keys(password)

    def set_new_password(self, password):
        element = self.wait_visible(self.NEW_PASSWORD)
        element.clear()
        element.send_keys(password)

    def set_confirm_password(self, password):
        element = self.wait_visible(self.CONFIRM_PASSWORD)
        element.clear()
        element.send_keys(password)

    def click_update_password_button(self):
        self.wait_clickable(self.UPDATE_PASSWORD_BTN).click()

    def change_password(self, current_password, new_password, confirm_password=None):
        if confirm_password is None:
            confirm_password = new_password
            
        self.set_current_password(current_password)
        self.set_new_password(new_password)
        self.set_confirm_password(confirm_password)
        self.click_update_password_button()

    def wait_for_toast(self, toast_type="success", timeout=10):
        locator = self.TOAST_SUCCESS if toast_type == "success" else self.TOAST_ERROR
        return WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located(locator)
        )

    def is_toast_visible(self, toast_type="success", timeout=5):
        try:
            self.wait_for_toast(toast_type, timeout)
            return True
        except:
            return False

    def is_login_page(self):
        return "/login" in self.driver.current_url

    def is_account_page(self):
        return "/account" in self.driver.current_url

    def refresh_page(self):
        self.driver.refresh()
        self.wait_loaded()