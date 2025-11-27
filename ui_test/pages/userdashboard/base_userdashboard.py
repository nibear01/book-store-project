from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class UserDashboardHelperMixin:
    
    def _initialize_password_tracking(self):
        self.ORIGINAL_PASSWORD = "Naved@123"
        self.current_password = self.ORIGINAL_PASSWORD
        self.password_changed = False

    def _login_with_current_password(self):
        self.page.login(self.TEST_USER_EMAIL, self.current_password)

    def _safe_password_change(self, new_password):
        self.page.switch_to_tab('security')
        self.page.change_password(self.current_password, new_password)
        
        if self.page.is_toast_visible("success", timeout=10):
            self.current_password = new_password
            self.password_changed = True
            return True
        return False

    def _revert_to_original_password(self):
        if self.current_password == self.ORIGINAL_PASSWORD:
            return True
            
        self.page.navigate_to_logout()
        self.page.login(self.TEST_USER_EMAIL, self.current_password)
        
        self.page.switch_to_tab('security')
        self.page.change_password(self.current_password, self.ORIGINAL_PASSWORD)
        
        if self.page.is_toast_visible("success", timeout=10):
            self.current_password = self.ORIGINAL_PASSWORD
            self.password_changed = False
            return True
        return False

    def assert_element_visible(self, locator, timeout=10):
        element = WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located(locator)
        )
        self.assertTrue(element.is_displayed())

    def assert_element_present(self, locator, timeout=10):
        element = WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located(locator)
        )
        self.assertTrue(element is not None)

    def assert_on_account_page(self, timeout=10):
        WebDriverWait(self.driver, timeout).until(
            lambda driver: "/account" in driver.current_url
        )
        self.assertTrue("/account" in self.driver.current_url)

    def assert_toast_appears(self, page, toast_type="success", timeout=15):
        toast = page.wait_for_toast(toast_type, timeout)
        self.assertTrue(toast is not None)

    def assert_password_change_success(self):
        success = self.page.is_toast_visible("success", timeout=10)
        self.assertTrue(success)

    def assert_password_change_failed(self):
        error = self.page.is_toast_visible("error", timeout=10)
        self.assertTrue(error)

    def assert_login_with_current_password(self):
        self._login_with_current_password()
        self.assert_on_account_page()
        self.assertTrue(True)