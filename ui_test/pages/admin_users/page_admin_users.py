from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import UnexpectedAlertPresentException, WebDriverException
import time

from ..login.set_up import BookStopSetUp


class AdminUsersPage:
    """Page Object for Admin Users management page."""

    # Page-level locators
    TITLE = (By.NAME, "users-page-title")
    REFRESH_BTN = (By.NAME, "users-refresh-btn")
    SEARCH_INPUT = (By.NAME, "users-search-input")
    ROLE_FILTER = (By.NAME, "users-role-filter")
    STATUS_FILTER = (By.NAME, "users-status-filter")
    SORT_FILTER = (By.NAME, "users-sort-filter")
    ADD_BTN = (By.NAME, "users-add-btn")
    TABLE = (By.NAME, "users-table")
    ROWS_CSS = (By.CSS_SELECTOR, '[name^="user-row-"]')

    # Action buttons (per-row)
    APPROVE_BTNS = (By.CSS_SELECTOR, '[name^="user-approve-btn-"]')
    BAN_BTNS = (By.CSS_SELECTOR, '[name^="user-ban-btn-"]')
    EDIT_BTNS = (By.CSS_SELECTOR, '[name^="user-edit-btn-"]')
    CHANGE_PW_BTNS = (By.CSS_SELECTOR, '[name^="user-change-pw-btn-"]')
    DELETE_BTNS = (By.CSS_SELECTOR, '[name^="user-delete-btn-"]')

    # Pagination
    PAGINATION_NEXT = (By.NAME, "users-pagination-next")
    PAGINATION_PREV = (By.NAME, "users-pagination-prev")

    # Add User Modal
    ADD_MODAL = (By.NAME, "add-user-modal")
    ADD_MODAL_REQUIRED_ELEMENTS = [
        (By.NAME, "add-user-title"),
        (By.NAME, "add-user-name"),
        (By.NAME, "add-user-email"),
        (By.NAME, "add-user-phone"),
        (By.NAME, "add-user-address"),
        (By.NAME, "add-user-password"),
        (By.NAME, "add-user-roles"),
        (By.NAME, "add-user-status"),
        (By.NAME, "add-user-cancel"),
        (By.NAME, "add-user-submit"),
    ]

    # Edit User Modal
    EDIT_MODAL = (By.NAME, "edit-user-modal")
    EDIT_MODAL_ELEMENTS = [
        (By.NAME, "edit-user-title"),
        (By.NAME, "edit-user-name"),
        (By.NAME, "edit-user-email"),
        (By.NAME, "edit-user-roles"),
        (By.NAME, "edit-user-status"),
        (By.NAME, "edit-user-cancel"),
        (By.NAME, "edit-user-save"),
    ]

    # Change Password Modal
    CHANGE_PW_MODAL = (By.NAME, "change-pw-modal")
    CHANGE_PW_ELEMENTS = [
        (By.NAME, "change-pw-title"),
        (By.NAME, "change-pw-prev"),
        (By.NAME, "change-pw-new"),
        (By.NAME, "change-pw-confirm"),
        (By.NAME, "change-pw-cancel"),
        (By.NAME, "change-pw-submit"),
    ]

    # Delete Modal
    DELETE_MODAL = (By.NAME, "delete-user-modal")
    DELETE_MODAL_ELEMENTS = [
        (By.NAME, "delete-modal-close-btn"),
        (By.NAME, "delete-modal-cancel-btn"),
        (By.NAME, "delete-modal-confirm-btn"),
    ]

    # Mobile
    MOBILE_CARD_CSS = (By.CSS_SELECTOR, '[name^="user-card-"]')

    def __init__(self, driver):
        self.d = driver

    # --- navigation ---
    def open(self, base_url):
      
        try:
            # Try to click a nav/link that leads to /admin/users
            link = WebDriverWait(self.d, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href*="/admin/users"]'))
            )
            link.click()
        except Exception:
            # Fallback to direct navigation
            self.d.get(f"{base_url}/admin/users")
        return self

    def wait_loaded(self, timeout=20):
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.TITLE))
        return self

    # --- helpers ---
    def wait_by(self, locator, timeout=20):
        return WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(locator))

    def wait_clickable(self, locator, timeout=20):
        return WebDriverWait(self.d, timeout).until(EC.element_to_be_clickable(locator))

    def find_all(self, locator):
        return self.d.find_elements(*locator)

    def _robust_click(self, locator, timeout=10):
        """Click an element with retries and JS fallback to avoid focus/overlay issues."""
        end = time.time() + timeout
        last_exc = None
        while time.time() < end:
            try:
                el = self.wait_clickable(locator, timeout=2)
                # Try normal click first
                el.click()
                return True
            except Exception as e:
                last_exc = e
                # Try JS click fallback if element exists
                try:
                    el = self.d.find_element(*locator)
                    self.d.execute_script("arguments[0].click();", el)
                    return True
                except Exception:
                    # Try dismissing alert or pressing ESC then retry
                    self._dismiss_any_alert(timeout=0.5)
                    self._press_escape()
                    time.sleep(0.2)
        if last_exc:
            raise last_exc
        return False

    def _dismiss_any_alert(self, timeout=2):
        try:
            WebDriverWait(self.d, timeout).until(EC.alert_is_present())
            alert = self.d.switch_to.alert
            text = None
            try:
                text = alert.text
            except Exception:
                pass
            try:
                alert.accept()
            except Exception:
                try:
                    alert.dismiss()
                except Exception:
                    pass
            return text
        except Exception:
            return None

    def _wait_invisible_safely(self, locator, timeout=10):
        end_time = time.time() + timeout
        while time.time() < end_time:
            try:
                if WebDriverWait(self.d, min(3, max(1, int(end_time - time.time())))).until(
                    EC.invisibility_of_element_located(locator)
                ):
                    return True
            except UnexpectedAlertPresentException as e:
                last_exc = e
                self._dismiss_any_alert(timeout=1)
                time.sleep(0.2)
                continue
            except WebDriverException as e:
                last_exc = e
                # Clear any alert and retry
                self._dismiss_any_alert(timeout=1)
                time.sleep(0.2)
                continue
            except Exception as e:
                last_exc = e
                # Try to directly check display state as a fallback
                try:
                    el = self.d.find_element(*locator)
                    if not el.is_displayed():
                        return True
                except Exception:
                    # Not found also counts as invisible
                    return True
                time.sleep(0.2)
                continue
        # Give a final best-effort check
        try:
            el = self.d.find_element(*locator)
            return not el.is_displayed()
        except Exception:
            return True

    def _press_escape(self):
        try:
            self.d.switch_to.active_element.send_keys(Keys.ESCAPE)
            time.sleep(0.2)
        except Exception:
            try:
                body = self.d.find_element(By.TAG_NAME, "body")
                body.send_keys(Keys.ESCAPE)
                time.sleep(0.2)
            except Exception:
                pass

    # --- actions ---
    def refresh(self):
        self._robust_click(self.REFRESH_BTN)
        self.wait_by(self.TABLE)
        return self

    def search(self, term):
        # Ensure focus is on body to avoid unexpected global key handlers
        try:
            self.d.find_element(By.TAG_NAME, "body").click()
        except Exception:
            pass
        el = self.wait_by(self.SEARCH_INPUT)
        el.clear(); el.send_keys(term)
        return self

    def select_role(self, visible_text):
        Select(self.wait_by(self.ROLE_FILTER)).select_by_visible_text(visible_text)
        return self

    def select_status_by_value(self, value):
        Select(self.wait_by(self.STATUS_FILTER)).select_by_value(value)
        return self

    def wait_rows(self, timeout=20):
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.ROWS_CSS))
        return self.find_all(self.ROWS_CSS)

    # --- Add User modal ---
    def open_add_user_modal(self):
        self._robust_click(self.ADD_BTN)
        self.wait_by(self.ADD_MODAL)
        return self

    def add_modal_elements_visible(self):
        for loc in self.ADD_MODAL_REQUIRED_ELEMENTS:
            self.wait_by(loc)
        return True

    def close_add_user_modal(self):
        cancel = self.wait_by((By.NAME, "add-user-cancel"))
        cancel.click()
        self._dismiss_any_alert(timeout=1)
        if not self._wait_invisible_safely(self.ADD_MODAL, timeout=10):
            self._press_escape()
            self._wait_invisible_safely(self.ADD_MODAL, timeout=5)
        return self

    def open_first_edit_modal_if_available(self):
        btns = self.find_all(self.EDIT_BTNS)
        if not btns:
            return False
        try:
            btns[0].click()
        except Exception:
            try:
                self.d.execute_script("arguments[0].click();", btns[0])
            except Exception:
                self._press_escape()
                time.sleep(0.2)
                btns[0].click()
        self.wait_by(self.EDIT_MODAL)
        return True

    def edit_modal_elements_visible(self):
        for loc in self.EDIT_MODAL_ELEMENTS:
            self.wait_by(loc)
        return True

    def close_edit_modal(self):
        cancel = self.wait_by((By.NAME, "edit-user-cancel"))
        cancel.click()
        self._dismiss_any_alert(timeout=1)
        if not self._wait_invisible_safely(self.EDIT_MODAL, timeout=10):
            self._press_escape()
            self._wait_invisible_safely(self.EDIT_MODAL, timeout=5)
        return self

    def open_first_change_pw_modal_if_available(self):
        btns = self.find_all(self.CHANGE_PW_BTNS)
        if not btns:
            return False
        try:
            btns[0].click()
        except Exception:
            try:
                self.d.execute_script("arguments[0].click();", btns[0])
            except Exception:
                self._press_escape()
                time.sleep(0.2)
                btns[0].click()
        self.wait_by(self.CHANGE_PW_MODAL)
        return True

    def change_pw_elements_visible(self):
        for loc in self.CHANGE_PW_ELEMENTS:
            self.wait_by(loc)
        return True

    def close_change_pw_modal(self):
        cancel = self.wait_by((By.NAME, "change-pw-cancel"))
        cancel.click()
        self._dismiss_any_alert(timeout=1)
        if not self._wait_invisible_safely(self.CHANGE_PW_MODAL, timeout=10):
            self._press_escape()
            self._wait_invisible_safely(self.CHANGE_PW_MODAL, timeout=5)
        return self

    def open_first_delete_modal_if_available(self):
        btns = self.find_all(self.DELETE_BTNS)
        if not btns:
            return False
        try:
            btns[0].click()
        except Exception:
            try:
                self.d.execute_script("arguments[0].click();", btns[0])
            except Exception:
                self._press_escape()
                time.sleep(0.2)
                btns[0].click()
        self.wait_by(self.DELETE_MODAL)
        return True

    def delete_modal_elements_visible(self):
        for loc in self.DELETE_MODAL_ELEMENTS:
            self.wait_by(loc)
        return True

    def close_delete_modal(self):
        cancel = self.wait_by((By.NAME, "delete-modal-cancel-btn"))
        cancel.click()
        self._dismiss_any_alert(timeout=1)
        if not self._wait_invisible_safely(self.DELETE_MODAL, timeout=10):
            try:
                close_btns = self.find_all((By.NAME, "delete-modal-close-btn"))
                if close_btns:
                    close_btns[0].click()
                    self._dismiss_any_alert(timeout=1)
            except Exception:
                pass
            self._press_escape()
            self._wait_invisible_safely(self.DELETE_MODAL, timeout=5)
        return self

    def pagination_exists(self):
        return bool(self.find_all(self.PAGINATION_NEXT)) and bool(self.find_all(self.PAGINATION_PREV))

    def pagination_next_enabled(self):
        els = self.find_all(self.PAGINATION_NEXT)
        if not els:
            return False
        cls = els[0].get_attribute("class") or ""
        return "disabled" not in cls

    def click_pagination_next(self):
        self._robust_click(self.PAGINATION_NEXT)
        self.wait_by(self.TABLE)
        return self

    def set_mobile_view(self):
        self.d.set_window_size(375, 667)
        return self

    def reset_window(self):
        self.d.maximize_window()
        return self


class AdminUsersBaseTest(BookStopSetUp):
    def login_as_admin(self):
        self.driver.get(f"{self.BASE_URL}/login")
        WebDriverWait(self.driver, 20).until(EC.presence_of_element_located((By.NAME, "email")))

        email = self.driver.find_element(By.NAME, "email")
        password = self.driver.find_element(By.NAME, "password")
        email.clear(); email.send_keys("admin@gmail.com")
        password.clear(); password.send_keys("123456")

        btns = self.driver.find_elements(By.NAME, "login-submit-btn")
        if btns:
            btns[0].click()
        else:
            self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

        WebDriverWait(self.driver, 30).until(EC.url_contains("/admin/dashboard"))

    def open_users_page(self):
        self.login_as_admin()
        page = AdminUsersPage(self.driver).open(self.BASE_URL).wait_loaded()
        return page
