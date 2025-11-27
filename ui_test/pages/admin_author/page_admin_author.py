from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import time
import os

from pages.login.set_up import BookStopSetUp


class AdminAuthorPage:
    # Main page elements
    SECTION = (By.NAME, "authors-admin")
    HEADER = (By.NAME, "authors-header")
    TITLE = (By.NAME, "authors-title")
    SUBTITLE = (By.NAME, "authors-subtitle")
    ACTIONS = (By.NAME, "authors-actions")
    REFRESH_BTN = (By.NAME, "authors-refresh-btn")
    ADD_BTN = (By.NAME, "authors-add-btn")
    ERROR = (By.NAME, "authors-error")

    # Toolbar elements
    TOOLBAR = (By.NAME, "authors-toolbar")
    SEARCHBAR = (By.NAME, "authors-searchbar")
    SEARCH_INPUT = (By.NAME, "authors-search-input")
    SEARCH_CLEAR = (By.NAME, "authors-search-clear")
    SORT_SELECT = (By.NAME, "authors-sort-select")
    SEARCHBAR_COUNT = (By.NAME, "authors-searchbar-count")
    RESULTS_INFO = (By.NAME, "authors-results-info")

    # Table elements
    TABLE_WRAP = (By.NAME, "authors-table-wrap")
    TABLE = (By.NAME, "authors-table")
    ROWS = (By.CSS_SELECTOR, '[name^="authors-row-"]')
    EMPTY_STATE = (By.NAME, "authors-empty")
    EDIT_BTNS = (By.CSS_SELECTOR, '[name^="authors-edit-"]')
    MANAGE_BTNS = (By.CSS_SELECTOR, '[name^="authors-manage-"]')
    DELETE_BTNS = (By.CSS_SELECTOR, '[name^="authors-delete-"]')
    REMOVE_BOOK_BTNS = (By.CSS_SELECTOR, '[name^="authors-remove-book-"]')

    # Add Author Modal
    ADD_MODAL = (By.CSS_SELECTOR, '[role="dialog"]')
    ADD_MODAL_OVERLAY = (By.CSS_SELECTOR, '.fixed.inset-0.bg-black\\/40')
    ADD_NAME = (By.NAME, "add-author-name")
    ADD_TITLE = (By.NAME, "add-author-title")
    ADD_BIO = (By.NAME, "add-author-bio")
    ADD_DOB = (By.NAME, "add-author-dob")
    ADD_PHOTO = (By.NAME, "add-author-photo")
    ADD_CANCEL = (By.NAME, "add-author-cancel")
    ADD_SAVE = (By.NAME, "add-author-save")

    # Edit Author Modal
    EDIT_MODAL = (By.CSS_SELECTOR, '[role="dialog"]')
    EDIT_MODAL_OVERLAY = (By.CSS_SELECTOR, '.fixed.inset-0.bg-black\\/40')
    EDIT_NAME = (By.NAME, "edit-author-name")
    EDIT_TITLE = (By.NAME, "edit-author-title")
    EDIT_BIO = (By.NAME, "edit-author-bio")
    EDIT_DOB = (By.NAME, "edit-author-dob")
    EDIT_PHOTO = (By.NAME, "edit-author-photo")
    EDIT_CANCEL = (By.NAME, "edit-author-cancel")
    EDIT_SAVE = (By.NAME, "edit-author-save")

    # Delete Confirmation Modal
    DELETE_MODAL = (By.CSS_SELECTOR, '[role="dialog"]')
    DELETE_CANCEL = (By.NAME, "authors-delete-cancel")
    DELETE_CONFIRM = (By.NAME, "authors-delete-confirm")

    # Manage Books Modal
    MANAGE_MODAL = (By.CSS_SELECTOR, '[role="dialog"]')
    MANAGE_SEARCH = (By.NAME, "author-manage-books-search")
    MANAGE_SEARCH_BTN = (By.NAME, "author-manage-books-search-btn")
    MANAGE_CSV_INPUT = (By.NAME, "author-manage-books-csv-input")
    MANAGE_CSV_CLEAR = (By.NAME, "author-manage-books-csv-clear")
    MANAGE_CSV_IMPORT = (By.NAME, "author-manage-books-csv-import")
    MANAGE_DESELECT_ALL = (By.NAME, "author-manage-deselect-all")
    MANAGE_CANCEL = (By.NAME, "author-manage-cancel")
    MANAGE_ADD_SELECTED = (By.NAME, "author-manage-add-selected")
    MANAGE_BOOK_CHECKBOXES = (By.CSS_SELECTOR, '[name^="author-manage-select-"]')
    MANAGE_REMOVE_BTNS = (By.CSS_SELECTOR, '[name^="author-manage-remove-"]')

    def __init__(self, driver):
        self.d = driver

    def open(self, base_url):
        try:
            link = WebDriverWait(self.d, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href*="/admin/authors"]'))
            )
            link.click()
        except Exception:
            self.d.get(f"{base_url}/admin/authors")
        return self

    def wait_loaded(self, timeout=20):
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.SECTION))
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.TABLE))
        return self

    def wait_by(self, locator, timeout=20):
        return WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(locator))

    def wait_clickable(self, locator, timeout=20):
        return WebDriverWait(self.d, timeout).until(EC.element_to_be_clickable(locator))

    def wait_invisible(self, locator, timeout=20):
        WebDriverWait(self.d, timeout).until(EC.invisibility_of_element_located(locator))
        return True

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

    # =========================
    # Search & Filter Methods
    # =========================

    def search(self, term: str):
        el = self.wait_by(self.SEARCH_INPUT)
        el.clear()
        el.send_keys(term)
        WebDriverWait(self.d, 2).until(
            lambda d: True 
        )
        return self

    def clear_search(self):
        try:
            el = self.wait_by(self.SEARCH_INPUT)
            el.clear()
            WebDriverWait(self.d, 2).until(lambda d: True)
        except Exception:
            pass
        return self

    def click_clear_button(self):
        self.wait_clickable(self.SEARCH_CLEAR).click()
        WebDriverWait(self.d, 2).until(lambda d: True)
        return self

    def set_sort(self, value: str):
        Select(self.wait_by(self.SORT_SELECT)).select_by_value(value)
        WebDriverWait(self.d, 2).until(lambda d: True)
        return self

    def get_results_count(self):
        text = self.wait_by(self.RESULTS_INFO).text
        parts = text.split()
        if len(parts) >= 4:
            return int(parts[1]), int(parts[3])
        return 0, 0

    # =========================
    # Table Methods
    # =========================

    def get_all_rows(self):
        return self.find_all(self.ROWS)

    def find_row_by_name(self, name: str):
        rows = self.get_all_rows()
        for r in rows:
            try:
                # Name is in first cell
                tds = r.find_elements(By.TAG_NAME, "td")
                if tds:
                    name_cell = tds[0].text.strip()
                    # Name might be in a span within the cell
                    if name in name_cell:
                        return r
            except Exception:
                continue
        return None

    def count_visible_rows(self):
        return len(self.get_all_rows())

    def get_author_name_from_row(self, row_el):
        try:
            tds = row_el.find_elements(By.TAG_NAME, "td")
            if tds:
                # Parse name from first cell
                return tds[0].text.strip().split('\n')[0]
        except Exception:
            return ""

    def get_author_title_from_row(self, row_el):
        try:
            tds = row_el.find_elements(By.TAG_NAME, "td")
            if len(tds) > 1:
                return tds[1].text.strip()
        except Exception:
            return ""

    def get_book_count_from_row(self, row_el):
        try:
            tds = row_el.find_elements(By.TAG_NAME, "td")
            if len(tds) > 2:
                text = tds[2].text
                parts = text.split()
                for p in parts:
                    if p.isdigit():
                        return int(p)
        except Exception:
            pass
        return 0

    # =========================
    # Add Author Methods
    # =========================

    def click_add_author(self):
        self.wait_clickable(self.ADD_BTN).click()
        self.wait_by(self.ADD_MODAL)
        return self

    def fill_add_form(self, name: str, title: str, bio: str = "", dob: str = "", photo_path: str = ""):
        self.wait_by(self.ADD_NAME).send_keys(name)
        self.wait_by(self.ADD_TITLE).send_keys(title)
        if bio:
            self.wait_by(self.ADD_BIO).send_keys(bio)
        if dob:
            self.wait_by(self.ADD_DOB).send_keys(dob)
        if photo_path and os.path.exists(photo_path):
            self.wait_by(self.ADD_PHOTO).send_keys(os.path.abspath(photo_path))
        return self

    def click_add_save(self):
        self.wait_clickable(self.ADD_SAVE).click()
        return self

    def click_add_cancel(self):
        self.wait_clickable(self.ADD_CANCEL).click()
        return self

    def wait_add_modal_closed(self, timeout=20):
        self.wait_invisible(self.ADD_MODAL_OVERLAY, timeout)
        return True

    def add_author(self, name: str, title: str, bio: str = "", dob: str = "", photo_path: str = ""):
        self.click_add_author()
        self.fill_add_form(name, title, bio, dob, photo_path)
        self.click_add_save()
        self.wait_add_modal_closed()
        # Wait for table to update
        WebDriverWait(self.d, 3).until(lambda d: True)
        return self

    def add_author_unique(self, name_base: str, title: str = "Author"):
        self.click_add_author()
        self.wait_by(self.ADD_NAME).send_keys(name_base)
        self.wait_by(self.ADD_TITLE).send_keys(title)
        self.click_add_save()
        try:
            self.wait_add_modal_closed(timeout=8)
            final_name = name_base
        except Exception:
            name_input = self.wait_by(self.ADD_NAME)
            name_input.clear()
            final_name = f"{name_base}_{int(time.time()*1000)}"
            name_input.send_keys(final_name)
            self.click_add_save()
            self.wait_add_modal_closed()
        WebDriverWait(self.d, 3).until(lambda d: True)
        return final_name

    def is_add_save_disabled(self):
        btn = self.wait_by(self.ADD_SAVE)
        return bool(btn.get_attribute("disabled"))

    # =========================
    # Edit Author Methods
    # =========================

    def click_edit_for_row(self, row_el):
        try:
            edit_btn = row_el.find_element(By.CSS_SELECTOR, '[name^="authors-edit-"]')
            self.d.execute_script("arguments[0].scrollIntoView({block:'center'})", edit_btn)
            edit_btn.click()
            self.wait_by(self.EDIT_MODAL)
            return True
        except Exception:
            return False

    def click_edit_first(self):
        btns = self.find_all(self.EDIT_BTNS)
        if btns:
            btns[0].click()
            self.wait_by(self.EDIT_MODAL)
            return True
        return False

    def fill_edit_form(self, name: str = None, title: str = None, bio: str = None, dob: str = None, photo_path: str = None):
        if name is not None:
            el = self.wait_by(self.EDIT_NAME)
            el.clear()
            el.send_keys(name)
        if title is not None:
            el = self.wait_by(self.EDIT_TITLE)
            el.clear()
            el.send_keys(title)
        if bio is not None:
            el = self.wait_by(self.EDIT_BIO)
            el.clear()
            el.send_keys(bio)
        if dob is not None:
            el = self.wait_by(self.EDIT_DOB)
            el.clear()
            el.send_keys(dob)
        if photo_path and os.path.exists(photo_path):
            self.wait_by(self.EDIT_PHOTO).send_keys(os.path.abspath(photo_path))
        return self

    def click_edit_save(self):
        self.wait_clickable(self.EDIT_SAVE).click()
        return self

    def click_edit_cancel(self):
        self.wait_clickable(self.EDIT_CANCEL).click()
        return self

    def wait_edit_modal_closed(self, timeout=20):
        self.wait_invisible(self.EDIT_MODAL_OVERLAY, timeout)
        return True

    def edit_author(self, name: str = None, title: str = None, bio: str = None, dob: str = None):
        self.fill_edit_form(name, title, bio, dob)
        self.click_edit_save()
        self.wait_edit_modal_closed()
        WebDriverWait(self.d, 3).until(lambda d: True)
        return self

    # =========================
    # Delete Author Methods
    # =========================

    def click_delete_for_row(self, row_el):
        try:
            del_btn = row_el.find_element(By.CSS_SELECTOR, '[name^="authors-delete-"]')
            self.d.execute_script("arguments[0].scrollIntoView({block:'center'})", del_btn)
            del_btn.click()
            self.wait_by(self.DELETE_MODAL)
            return True
        except Exception:
            return False

    def confirm_delete(self):
        self.wait_clickable(self.DELETE_CONFIRM).click()
        WebDriverWait(self.d, 3).until(lambda d: True)
        return self

    def cancel_delete(self):
        self.wait_clickable(self.DELETE_CANCEL).click()
        return self

    def delete_author_by_name(self, name: str):
        row = self.find_row_by_name(name)
        if row:
            self.click_delete_for_row(row)
            self.confirm_delete()
            WebDriverWait(self.d, 3).until(lambda d: True)
            return True
        return False

    # =========================
    # Manage Books Methods
    # =========================

    def click_manage_for_row(self, row_el):
        try:
            manage_btn = row_el.find_element(By.CSS_SELECTOR, '[name^="authors-manage-"]')
            self.d.execute_script("arguments[0].scrollIntoView({block:'center'})", manage_btn)
            manage_btn.click()
            self.wait_by(self.MANAGE_MODAL)
            return True
        except Exception:
            return False

    def search_books_in_manage(self, term: str):
        el = self.wait_by(self.MANAGE_SEARCH)
        el.clear()
        el.send_keys(term)
        self.wait_clickable(self.MANAGE_SEARCH_BTN).click()
        WebDriverWait(self.d, 3).until(lambda d: True)
        return self

    def select_book_by_index(self, index: int):
        checkboxes = self.find_all(self.MANAGE_BOOK_CHECKBOXES)
        if 0 <= index < len(checkboxes):
            checkboxes[index].click()
        return self

    def click_add_selected_books(self):
        self.wait_clickable(self.MANAGE_ADD_SELECTED).click()
        WebDriverWait(self.d, 3).until(lambda d: True)
        return self

    def click_deselect_all_books(self):
        self.wait_clickable(self.MANAGE_DESELECT_ALL).click()
        return self

    def close_manage_modal(self):
        self.wait_clickable(self.MANAGE_CANCEL).click()
        return self

    def upload_csv_for_import(self, csv_path: str):
        if os.path.exists(csv_path):
            self.wait_by(self.MANAGE_CSV_INPUT).send_keys(os.path.abspath(csv_path))
            WebDriverWait(self.d, 2).until(lambda d: True)
        return self

    def click_import_csv(self):
        self.wait_clickable(self.MANAGE_CSV_IMPORT).click()
        WebDriverWait(self.d, 5).until(lambda d: True)  
        return self

    def click_clear_csv(self):
        self.wait_clickable(self.MANAGE_CSV_CLEAR).click()
        return self

    # Utility Methods
    def click_refresh(self):
        self.wait_clickable(self.REFRESH_BTN).click()
        WebDriverWait(self.d, 3).until(lambda d: True)
        return self

    def is_modal_open(self):
        try:
            WebDriverWait(self.d, 2).until(EC.presence_of_element_located((By.CSS_SELECTOR, '[role="dialog"]')))
            return True
        except Exception:
            return False

    def cleanup_authors_with_prefix(self, prefix: str):
        if not prefix:
            return self
        self.search(prefix)
        WebDriverWait(self.d, 3).until(lambda d: True)
        attempts = 0
        while attempts < 50:
            attempts += 1
            rows = self.get_all_rows()
            target_row = None
            for r in rows:
                name = self.get_author_name_from_row(r)
                if name.startswith(prefix):
                    target_row = r
                    break
            if not target_row:
                break
            self.click_delete_for_row(target_row)
            self.confirm_delete()
            WebDriverWait(self.d, 2).until(lambda d: True)
        self.clear_search()
        return self


class AdminAuthorBaseTest(BookStopSetUp):
    def login_as_admin(self):
        super().login_as_admin()

    def open_authors_page(self):
        self.login_as_admin()
        page = AdminAuthorPage(self.driver).open(self.BASE_URL).wait_loaded()
        return page
