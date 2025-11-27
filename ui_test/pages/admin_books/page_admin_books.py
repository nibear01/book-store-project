from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import os

from ..login.set_up import BookStopSetUp


class AdminBooksPage:
    TITLE = (By.NAME, "books-page-title")
    REFRESH_BTN = (By.NAME, "books-refresh-btn")
    ADD_BTN = (By.NAME, "books-add-btn")

    SEARCH_INPUT = (By.NAME, "books-search-input")
    SEARCH_CLEAR_BTN = (By.NAME, "books-clear-search-btn")

    IMPORT_CSV_BTN = (By.NAME, "books-import-csv-btn")
    IMPORT_CSV_INPUT = (By.NAME, "books-import-csv-input")
    BULK_UPLOAD_BTN = (By.NAME, "books-bulk-upload-btn")
    BULK_MODAL = (By.NAME, "books-bulk-modal")
    BULK_CLOSE_BTN = (By.NAME, "books-bulk-close-btn")

    FILTER_GENRE = (By.NAME, "books-filter-genre")
    FILTER_SORT_PRICE = (By.NAME, "books-filter-sort-price")
    FILTER_STOCK = (By.NAME, "books-filter-stock")
    FILTER_SORT_DATE = (By.NAME, "books-filter-sort-date")
    FILTER_CLEAR = (By.NAME, "books-clear-filters-btn")

    TABLE = (By.NAME, "books-table")
    ROWS = (By.CSS_SELECTOR, 'table[name="books-table"] tbody tr')
    VIEW_BTNS = (By.CSS_SELECTOR, '[name^="book-view-btn-"]')
    EDIT_BTNS = (By.CSS_SELECTOR, '[name^="book-edit-btn-"]')
    DELETE_BTNS = (By.CSS_SELECTOR, '[name^="book-delete-btn-"]')

    DETAILS_OVERLAY = (By.NAME, "books-details-modal-overlay")
    DETAILS_CLOSE = (By.NAME, "books-details-close-btn")

    AE_OVERLAY = (By.NAME, "books-addedit-modal-overlay")
    AE_MODAL = (By.NAME, "books-addedit-modal")
    AE_CLOSE = (By.NAME, "books-addedit-close-btn")
    AE_CANCEL = (By.NAME, "books-addedit-cancel-btn")
    AE_SUBMIT = (By.NAME, "books-addedit-submit-btn")
    AE_TITLE = (By.NAME, "books-input-title")
    AE_AUTHOR = (By.NAME, "books-input-author")
    AE_GENRE = (By.NAME, "books-input-genre")
    AE_LANGUAGE = (By.NAME, "books-input-language")
    AE_ISBN = (By.NAME, "books-input-isbn")
    AE_PRICE = (By.NAME, "books-input-price")
    AE_STOCK = (By.NAME, "books-input-stock")
    AE_META_TITLE = (By.NAME, "books-input-meta-title")
    AE_PUBLISHED_DATE = (By.NAME, "books-input-published-date")

    DEL_OVERLAY = (By.NAME, "books-delete-modal-overlay")
    DEL_CONFIRM = (By.NAME, "books-delete-confirm-btn")
    DEL_CANCEL = (By.NAME, "books-delete-cancel-btn")

    PAGINATION = (By.NAME, "books-pagination")
    PAGINATION_PREV = (By.NAME, "books-pagination-prev")
    PAGINATION_NEXT = (By.NAME, "books-pagination-next")

    def __init__(self, driver):
        self.d = driver

    # --- Navigation ---
    def open(self, base_url):
        try:
            link = WebDriverWait(self.d, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href*="/admin/books"]'))
            )
            link.click()
        except Exception:
            self.d.get(f"{base_url}/admin/books")
        return self

    def wait_loaded(self, timeout=20):
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.TITLE))
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.TABLE))
        return self

    # --- Helpers ---
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

    def _dismiss_any_alert(self, timeout=2):
        try:
            WebDriverWait(self.d, timeout).until(EC.alert_is_present())
            alert = self.d.switch_to.alert
            try:
                alert.accept()
            except Exception:
                alert.dismiss()
        except Exception:
            pass

    def _robust_click(self, locator, timeout=10):
        end = WebDriverWait(self.d, 0)._timeout if False else None  
        deadline = WebDriverWait(self.d, timeout)._timeout 
        import time as _t
        end_time = _t.time() + timeout
        last_exc = None
        while _t.time() < end_time:
            try:
                el = self.wait_clickable(locator, timeout=2)
                self.d.execute_script("arguments[0].scrollIntoView({block:'center'})", el)
                el.click()
                return True
            except Exception as e:
                last_exc = e
                try:
                    el = self.d.find_element(*locator)
                    self.d.execute_script("arguments[0].click();", el)
                    return True
                except Exception:
                    self._dismiss_any_alert(0.5)
                    self._press_escape()
                    try:
                        WebDriverWait(self.d, 1).until(EC.element_to_be_clickable(locator))
                    except Exception:
                        pass
        if last_exc:
            raise last_exc
        return False

    def _isbn13_check_digit(self, digits12: str) -> str:
        total = 0
        for i, ch in enumerate(digits12):
            n = ord(ch) - 48
            total += n if i % 2 == 0 else 3 * n
        d = (10 - (total % 10)) % 10
        return str(d)

    def _generate_valid_isbn13(self) -> str:
        import time as _t
        base = f"978{int(_t.time()*1000)}"  
        digits12 = base[:12]
        return digits12 + self._isbn13_check_digit(digits12)

    def refresh(self):
        self._robust_click(self.REFRESH_BTN)
        self.wait_by(self.TABLE)
        return self

    def search(self, term):
        el = self.wait_by(self.SEARCH_INPUT)
        el.clear(); el.send_keys(term)
        return self

    def clear_search(self):
        try:
            self.wait_clickable(self.SEARCH_CLEAR_BTN).click()
        except Exception:
            el = self.wait_by(self.SEARCH_INPUT)
            el.clear()
        return self

    def set_filter_stock(self, value):
        Select(self.wait_by(self.FILTER_STOCK)).select_by_value(value)
        return self

    def set_sort_price(self, value):
        Select(self.wait_by(self.FILTER_SORT_PRICE)).select_by_value(value)
        return self

    def clear_filters(self):
        self._robust_click(self.FILTER_CLEAR)
        return self

    def upload_csv(self, file_path):
        inp = self.wait_by(self.IMPORT_CSV_INPUT)
        try:
            self.d.execute_script("arguments[0].style.display='block'; arguments[0].style.visibility='visible';", inp)
        except Exception:
            pass
        inp.send_keys(file_path)
        WebDriverWait(self.d, 20).until(EC.presence_of_element_located(self.ROWS))
        return self

    def wait_rows(self, timeout=20):
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.ROWS))
        return self.find_all(self.ROWS)

    def open_first_details(self):
        btns = self.find_all(self.VIEW_BTNS)
        if not btns:
            return False
        btns[0].click()
        self.wait_by(self.DETAILS_OVERLAY)
        return True

    def close_details(self):
        try:
            self.wait_clickable(self.DETAILS_CLOSE).click()
        except Exception:
            self._press_escape()
        return self

    def open_first_edit(self):
        btns = self.find_all(self.EDIT_BTNS)
        if not btns:
            return False
        btns[0].click()
        self.wait_by(self.AE_MODAL)
        return True

    def save_edit(self):
        self._robust_click(self.AE_SUBMIT)
        try:
            WebDriverWait(self.d, 10).until(EC.invisibility_of_element_located(self.AE_OVERLAY))
        except Exception:
            try:
                isbn_input = self.wait_by(self.AE_ISBN, timeout=5)
                isbn_input.clear()
                new_isbn = self._generate_valid_isbn13()
                isbn_input.send_keys(new_isbn)
                self._robust_click(self.AE_SUBMIT)
            except Exception:
                pass
            WebDriverWait(self.d, 30).until(EC.invisibility_of_element_located(self.AE_OVERLAY))
        return self

    def close_addedit(self):
        try:
            self.wait_clickable(self.AE_CANCEL).click()
        except Exception:
            self._press_escape()
        WebDriverWait(self.d, 20).until(EC.invisibility_of_element_located(self.AE_OVERLAY))
        return self

    def add_book_minimal(self, title, author, genre, language, isbn, price, stock, meta_title, published_date=None):
        self._robust_click(self.ADD_BTN)
        self.wait_by(self.AE_MODAL)
        self.wait_by(self.AE_TITLE).send_keys(title)
        self.wait_by(self.AE_AUTHOR).send_keys(author)
        self.wait_by(self.AE_GENRE).send_keys(genre)
        self.wait_by(self.AE_LANGUAGE).send_keys(language)
        self.wait_by(self.AE_ISBN).send_keys(isbn)
        self.wait_by(self.AE_PRICE).send_keys(str(price))
        self.wait_by(self.AE_STOCK).send_keys(str(stock))
        self.wait_by(self.AE_META_TITLE).send_keys(meta_title)
        if published_date:
            el = self.wait_by(self.AE_PUBLISHED_DATE)
            try:
                self.d.execute_script(
                    "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
                    el,
                    published_date,
                )
            except Exception:
                try:
                    el.clear()
                except Exception:
                    pass
                el.send_keys(published_date)
        self.save_edit()
        self.search(title)
        WebDriverWait(self.d, 20).until(EC.presence_of_element_located(self.ROWS))
        self.clear_search()
        return self

    def delete_first_row(self):
        btns = self.find_all(self.DELETE_BTNS)
        if not btns:
            return False
        btns[0].click()
        self.wait_by(self.DEL_OVERLAY)
        WebDriverWait(self.d, 10).until(EC.presence_of_element_located(self.DEL_CONFIRM))
        self._robust_click(self.DEL_CONFIRM)
        WebDriverWait(self.d, 20).until(EC.invisibility_of_element_located(self.DEL_OVERLAY))
        return True

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

    # --- Cleanup helpers ---
    def delete_all_with_prefix(self, prefix):
        self.search(prefix)
        try:
            WebDriverWait(self.d, 5).until(EC.presence_of_element_located(self.ROWS))
        except Exception:
            pass
        while True:
            prev_rows = self.find_all(self.ROWS)
            if not prev_rows:
                break
            if not self.delete_first_row():
                break
            try:
                WebDriverWait(self.d, 10).until(
                    lambda d: len(self.find_all(self.ROWS)) < len(prev_rows)
                )
            except Exception:
                pass
        self.clear_search()
        return self

    def delete_all_by_title(self, title: str):
        return self.delete_all_with_prefix(title)

    def delete_by_titles(self, titles):
        for t in titles:
            self.delete_all_by_title(t)
        return self


class AdminBooksBaseTest(BookStopSetUp):
    PREFIX = os.environ.get("E2E_BOOKS_PREFIX", "E2E_BOOK_")
    CSV_PATH = os.environ.get("E2E_BOOKS_CSV", "")

    def login_as_admin(self):
        super().login_as_admin()

    def open_books_page(self):
        self.login_as_admin()
        page = AdminBooksPage(self.driver).open(self.BASE_URL).wait_loaded()
        return page
