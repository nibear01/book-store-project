from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

from pages.login.set_up import BookStopSetUp


class AdminCategoriesPage:
    SECTION = (By.NAME, "categories-manager")
    TITLE = (By.NAME, "categories-title")
    SUBTITLE = (By.NAME, "categories-subtitle")
    ADD_BTN = (By.NAME, "categories-add")

    TOOLBAR = (By.NAME, "categories-toolbar")
    SEARCH_INPUT = (By.NAME, "categories-search")
    SORT = (By.NAME, "categories-sort")
    RESULT_INFO = (By.NAME, "categories-result-info")

    TABLE_WRAPPER = (By.NAME, "categories-table-wrapper")
    TABLE = (By.NAME, "categories-table")
    HEADER = (By.NAME, "categories-header")
    ROWS = (By.CSS_SELECTOR, 'table[name="categories-table"] tbody tr')
    EDIT_BTNS = (By.CSS_SELECTOR, '[name^="categories-edit-"]')
    DELETE_BTNS = (By.CSS_SELECTOR, '[name^="categories-delete-"]')

    MODAL_OVERLAY = (By.NAME, "category-modal-overlay")
    MODAL = (By.NAME, "category-modal")
    MODAL_TITLE = (By.NAME, "category-modal-title")
    MODAL_CLOSE = (By.NAME, "category-modal-close")
    MODAL_FORM = (By.NAME, "category-modal-form")
    MODAL_NAME = (By.NAME, "category-name")
    MODAL_CANCEL = (By.NAME, "category-cancel")
    MODAL_SUBMIT = (By.NAME, "category-submit")

    PAGINATION = (By.NAME, "categories-pagination")
    PAGINATION_PREV = (By.NAME, "categories-pagination-prev")
    PAGINATION_NEXT = (By.NAME, "categories-pagination-next")

    def __init__(self, driver):
        self.d = driver

    def open(self, base_url):
        """Open the Admin Books page (Categories section lives here)."""
        try:
            link = WebDriverWait(self.d, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href*="/admin/books"]'))
            )
            link.click()
        except Exception:
            self.d.get(f"{base_url}/admin/books")
        return self

    def wait_loaded(self, timeout=20):
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.SECTION))
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.TABLE))
        return self

    def wait_by(self, locator, timeout=20):
        return WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(locator))

    def wait_clickable(self, locator, timeout=20):
        return WebDriverWait(self.d, timeout).until(EC.element_to_be_clickable(locator))

    def find_all(self, locator):
        return self.d.find_elements(*locator)

    def _press_escape(self):
        try:
            self.d.switch_to.active_element.send_keys(Keys.ESCAPE)
        except Exception:
            try:
                self.d.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
            except Exception:
                pass

    def _accept_alert_if_present(self, timeout=5):
        try:
            WebDriverWait(self.d, timeout).until(EC.alert_is_present())
            self.d.switch_to.alert.accept()
            return True
        except Exception:
            return False

    def search(self, term: str):
        el = self.wait_by(self.SEARCH_INPUT)
        el.clear(); el.send_keys(term)
        return self

    def clear_search(self):
        try:
            el = self.wait_by(self.SEARCH_INPUT)
            el.clear()
        except Exception:
            pass
        return self

    def set_sort(self, value: str):
        Select(self.wait_by(self.SORT)).select_by_value(value)
        return self

    def open_add_modal(self):
        self.wait_clickable(self.ADD_BTN).click()
        self.wait_by(self.MODAL)
        return self

    def add_category(self, name: str):
        self.open_add_modal()
        self.wait_by(self.MODAL_NAME).send_keys(name)
        self.wait_clickable(self.MODAL_SUBMIT).click()
        WebDriverWait(self.d, 30).until(EC.invisibility_of_element_located(self.MODAL_OVERLAY))
        self.search(name)
        WebDriverWait(self.d, 20).until(EC.presence_of_element_located(self.ROWS))
        self.clear_search()
        return self

    def add_category_unique(self, name_base: str):
        """Try to add a category; if modal stays open (likely duplicate), retry with a unique suffix."""
        import time as _t
        self.open_add_modal()
        name_input = self.wait_by(self.MODAL_NAME)
        name_input.send_keys(name_base)
        self.wait_clickable(self.MODAL_SUBMIT).click()
        try:
            WebDriverWait(self.d, 8).until(EC.invisibility_of_element_located(self.MODAL_OVERLAY))
            final_name = name_base
        except Exception:
            try:
                if not self.is_modal_open():
                    final_name = name_base
                else:
                    name_input = self.wait_by(self.MODAL_NAME)
                    try:
                        name_input.clear()
                    except Exception:
                        pass
                    final_name = f"{name_base}_{int(_t.time()*1000)}"
                    name_input.send_keys(final_name)
                    self.wait_clickable(self.MODAL_SUBMIT).click()
                    WebDriverWait(self.d, 30).until(EC.invisibility_of_element_located(self.MODAL_OVERLAY))
            except Exception:
                raise
        self.search(final_name)
        try:
            WebDriverWait(self.d, 20).until(EC.presence_of_element_located(self.ROWS))
        except Exception:
            pass
        self.clear_search()
        return final_name

    def open_first_edit(self):
        btns = self.find_all(self.EDIT_BTNS)
        if not btns:
            return False
        btns[0].click()
        self.wait_by(self.MODAL)
        return True

    def open_edit_for_row(self, row_el):
        try:
            edit_btn = row_el.find_element(By.CSS_SELECTOR, '[name^="categories-edit-"]')
            self.d.execute_script("arguments[0].scrollIntoView({block:'center'})", edit_btn)
            edit_btn.click()
            self.wait_by(self.MODAL)
            return True
        except Exception:
            return False

    def save_modal(self):
        self.wait_clickable(self.MODAL_SUBMIT).click()
        WebDriverWait(self.d, 30).until(EC.invisibility_of_element_located(self.MODAL_OVERLAY))
        return self

    def close_modal(self):
        try:
            self.wait_clickable(self.MODAL_CANCEL).click()
        except Exception:
            try:
                self.wait_clickable(self.MODAL_CLOSE).click()
            except Exception:
                self._press_escape()
        WebDriverWait(self.d, 20).until(EC.invisibility_of_element_located(self.MODAL_OVERLAY))
        return self

    def wait_rows(self, timeout=20):
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.ROWS))
        return self.find_all(self.ROWS)

    def find_row_by_name(self, name: str):
        rows = self.find_all(self.ROWS)
        for r in rows:
            try:
                # get first cell text
                tds = r.find_elements(By.TAG_NAME, "td")
                if tds and (tds[0].text or "").strip() == name:
                    return r
            except Exception:
                pass
        return None

    def count_rows_with_name(self, name: str, timeout=10):
        self.search(name)
        try:
            WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.ROWS))
        except Exception:
            pass
        rows = self.find_all(self.ROWS)
        cnt = 0
        for r in rows:
            try:
                tds = r.find_elements(By.TAG_NAME, "td")
                if tds and (tds[0].text or "").strip() == name:
                    cnt += 1
            except Exception:
                continue
        self.clear_search()
        return cnt

    def is_modal_open(self):
        try:
            WebDriverWait(self.d, 2).until(EC.presence_of_element_located(self.MODAL))
            return True
        except Exception:
            return False

    def wait_modal_closed(self, timeout=10):
        WebDriverWait(self.d, timeout).until(EC.invisibility_of_element_located(self.MODAL_OVERLAY))
        return True

    def set_modal_name(self, value: str):
        el = self.wait_by(self.MODAL_NAME)
        try:
            el.clear()
        except Exception:
            pass
        el.send_keys(value)
        return self

    def is_submit_disabled(self):
        btn = self.wait_by(self.MODAL_SUBMIT)
        # Selenium returns 'true' if attribute exists, else None
        attr = btn.get_attribute("disabled")
        return bool(attr)

    def get_visible_row_names(self):
        rows = self.find_all(self.ROWS)
        names = []
        for r in rows:
            try:
                tds = r.find_elements(By.TAG_NAME, "td")
                if tds:
                    names.append((tds[0].text or "").strip())
            except Exception:
                continue
        return names

    def delete_row_by_element(self, row_el):
        try:
            try:
                cells = row_el.find_elements(By.TAG_NAME, "td")
                name_text = (cells[0].text or "").strip() if cells else ""
            except Exception:
                name_text = ""

            del_btn = row_el.find_element(By.CSS_SELECTOR, '[name^="categories-delete-"]')
            if not del_btn.is_enabled():
                return False
            self.d.execute_script("arguments[0].scrollIntoView({block:'center'})", del_btn)
            del_btn.click()
            self._accept_alert_if_present(10)
            WebDriverWait(self.d, 20).until(lambda d: self.find_row_by_name(name_text) is None)
            return True
        except Exception:
            return False

    def delete_row_by_name(self, name: str):
        row = self.find_row_by_name(name)
        if not row:
            return False
        return self.delete_row_by_element(row)

    def delete_all_with_prefix(self, prefix: str):
        if not prefix:
            return self
        self.search(prefix)
        try:
            WebDriverWait(self.d, 5).until(EC.presence_of_element_located(self.ROWS))
        except Exception:
            pass
        attempts = 0
        while attempts < 50:
            attempts += 1
            rows = self.find_all(self.ROWS)
            target_row = None
            target_name = None
            for r in rows:
                try:
                    tds = r.find_elements(By.TAG_NAME, "td")
                    if tds:
                        nm = (tds[0].text or "").strip()
                        if nm.startswith(prefix):
                            target_row = r
                            target_name = nm
                            break
                except Exception:
                    continue
            if not target_row:
                break
            self.delete_row_by_element(target_row)
            try:
                WebDriverWait(self.d, 10).until(lambda d: self.find_row_by_name(target_name) is None)
            except Exception:
                pass
        self.clear_search()
        return self

    def pagination_exists(self):
        return len(self.find_all(self.PAGINATION)) > 0

    def pagination_next(self):
        try:
            self.wait_clickable(self.PAGINATION_NEXT).click()
            self.wait_by(self.TABLE)
            return True
        except Exception:
            return False

    def pagination_prev(self):
        try:
            self.wait_clickable(self.PAGINATION_PREV).click()
            self.wait_by(self.TABLE)
            return True
        except Exception:
            return False


class AdminCategoriesBaseTest(BookStopSetUp):
    def login_as_admin(self):
        super().login_as_admin()

    def open_categories_page(self):
        self.login_as_admin()
        page = AdminCategoriesPage(self.driver).open(self.BASE_URL).wait_loaded()
        return page
