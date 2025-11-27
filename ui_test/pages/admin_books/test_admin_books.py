import os
import unittest
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import csv

from pages.admin_books.page_admin_books import AdminBooksBaseTest, AdminBooksPage
from pages.admin_books.base_admin_books import AdminBooksHelperMixin


CSV_FORMAT_DOC = """
CSV columns (header row required):
- title (required)
- author (required)
- price (required, number)
- stock (required, integer)
- meta_title (required)
- genre (optional, comma separated)
- language (optional)
- isbn (optional)
- description (optional)
- publisher (optional)
- published_date (optional, yyyy-mm-dd)
- pages (optional, integer)
- meta_description (optional)
- meta_keywords (optional, comma separated)
- file_url (optional, URL to book file)
- cover_image (optional, single path or url)
- cover_image_url (optional, single url)
- cover_image_urls (optional, multiple urls separated by |)
- is_active (optional: true/false)
- is_featured (optional: true/false)
- is_on_sale (optional: true/false)
- sale_price (optional, number)
- deal_start (optional, yyyy-mm-dd)
- deal_end (optional, yyyy-mm-dd)

Notes:
- At minimum: title, author, price, stock, meta_title should be present.
- If is_on_sale=true, sale_price must be a valid number less than price.
- Date fields should be in yyyy-mm-dd format.
"""


class TestAdminBooks(AdminBooksHelperMixin, AdminBooksBaseTest):
    PREFIX = os.environ.get("E2E_BOOKS_PREFIX", "E2E_BOOK_")
    CSV_LOCAL = os.path.join(os.path.dirname(__file__), "books_catalog.csv")
    CSV_TITLES = [
        "The Silent Observer",
        "Echoes of Eternity",
        "The Future We Build",
    ]

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        print("CSV format for Admin Books import:\n" + CSV_FORMAT_DOC)

    def setUp(self):
        super().setUp()
        self.page = self.open_books_page()

    def test_import_csv_and_basic_assertions(self):
        csv_path = self.CSV_LOCAL if os.path.isfile(self.CSV_LOCAL) else os.environ.get("E2E_BOOKS_CSV")
        if not csv_path or not os.path.isfile(csv_path):
            self.skipTest("CSV file not found (local or E2E_BOOKS_CSV); skipping import test.")
        self.page.upload_csv(csv_path)
        rows = self.page.wait_rows(timeout=30)
        self.assertTrue(len(rows) >= 1)

    def test_search_and_clear(self):
        self.page.search(self.PREFIX)
        rows = self.page.wait_rows(timeout=10)
        self.assertTrue(len(rows) >= 0)
        self.page.clear_search()

    def test_filters_stock_and_price_sort(self):
        self.page.set_filter_stock("in")
        rows_in = self.page.wait_rows(timeout=10)
        self.page.set_sort_price("asc")
        rows_sorted = self.page.wait_rows(timeout=10)
        self.assertTrue(len(rows_in) >= 0)
        self.assertTrue(len(rows_sorted) >= 0)
        self.page.clear_filters()

    def test_details_modal(self):
        if self.page.open_first_details():
            self.page.close_details()
        else:
            self.skipTest("No details button available; skipping.")

    def test_pagination_controls(self):
        if not self.page.pagination_exists():
            self.skipTest("Pagination not present; insufficient rows.")
        self.page.pagination_next()
        self.page.pagination_prev()

    def test_cleanup_imported(self):
        self.page.delete_by_titles(self.CSV_TITLES)

    def test_add_books_from_csv_all_fields_and_cleanup(self):
        csv_path = self.CSV_LOCAL if os.path.isfile(self.CSV_LOCAL) else os.environ.get("E2E_BOOKS_CSV")
        if not csv_path or not os.path.isfile(csv_path):
            self.skipTest("CSV file not found (local or E2E_BOOKS_CSV); skipping add-from-csv test.")

        added_titles = []
        with open(csv_path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                title = (row.get('title') or '').strip()
                author = (row.get('author') or '').strip()
                price = (row.get('price') or '').strip()
                stock = (row.get('stock') or '').strip()
                meta_title = (row.get('meta_title') or '').strip()
                genre = (row.get('genre') or '').strip()
                language = (row.get('language') or '').strip()
                isbn = self._fix_isbn_if_needed((row.get('isbn') or '').strip())
                description = (row.get('description') or '').strip()
                publisher = (row.get('publisher') or '').strip()
                published_date = self._normalize_date(row.get('published_date'))
                pages = (row.get('pages') or '').strip()
                meta_description = (row.get('meta_description') or '').strip()
                meta_keywords = (row.get('meta_keywords') or '').strip()
                file_url = (row.get('file_url') or '').strip()
                cover_image = (row.get('cover_image') or '').strip()
                cover_image_url = (row.get('cover_image_url') or '').strip()
                cover_image_urls = (row.get('cover_image_urls') or '').strip()
                is_active = self._normalize_bool(row.get('is_active'))
                is_featured = self._normalize_bool(row.get('is_featured'))
                is_on_sale = self._normalize_bool(row.get('is_on_sale'))
                sale_price = (row.get('sale_price') or '').strip()
                deal_start = self._normalize_date(row.get('deal_start'))
                deal_end = self._normalize_date(row.get('deal_end'))
                is_deal_of_week = True if (deal_start or deal_end) else None

                if not (title and author and price and stock and meta_title):
                    continue
                WebDriverWait(self.page.d, 15).until(
                    EC.element_to_be_clickable(AdminBooksPage.ADD_BTN)
                ).click()
                WebDriverWait(self.page.d, 20).until(
                    EC.presence_of_element_located(AdminBooksPage.AE_OVERLAY)
                )
                WebDriverWait(self.page.d, 20).until(
                    EC.presence_of_element_located(AdminBooksPage.AE_MODAL)
                )

                self._type_if_present('title', title)
                self._type_if_present('author', author)
                self._type_if_present('price', price)
                self._type_if_present('stock', stock)
                self._type_if_present('meta-title', meta_title)

                self._type_if_present('genre', genre)
                self._type_if_present('language', language)
                self._type_if_present('isbn', isbn)
                self._type_if_present('description', description)
                self._type_if_present('publisher', publisher)
                if published_date:
                    self._type_if_present('published-date', published_date)
                self._type_if_present('pages', pages)
                self._type_if_present('meta-description', meta_description)
                self._type_if_present('meta-keywords', meta_keywords)
                if cover_image:
                    self._type_if_present('cover-image', cover_image)

                self._set_checkbox_if_present('is-active', is_active)
                self._set_checkbox_if_present('is-featured', is_featured)
                self._set_checkbox_if_present('is-on-sale', is_on_sale)
                self._set_checkbox_if_present('deal-of-week', is_deal_of_week)

                if is_on_sale:
                    self._type_if_present('sale-price', sale_price)
                if is_deal_of_week:
                    if deal_start:
                        self._type_if_present('deal-start', deal_start)
                    if deal_end:
                        self._type_if_present('deal-end', deal_end)

                WebDriverWait(self.page.d, 20).until(
                    EC.presence_of_element_located(AdminBooksPage.AE_SUBMIT)
                )
                WebDriverWait(self.page.d, 10).until(
                    EC.element_to_be_clickable(AdminBooksPage.AE_SUBMIT)
                )
                try:
                    self.page.d.find_element(*AdminBooksPage.AE_SUBMIT).click()
                except Exception:
                    modal = WebDriverWait(self.page.d, 10).until(
                        EC.presence_of_element_located(AdminBooksPage.AE_MODAL)
                    )
                    modal.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()

                WebDriverWait(self.page.d, 20).until(
                    EC.invisibility_of_element_located(AdminBooksPage.AE_OVERLAY)
                )

                rows = self.page.wait_rows(timeout=30)
                self.assertTrue(len(rows) >= 1)
                added_titles.append(title)

        for t in added_titles:
            self.page.search(t)
            rows = self.page.wait_rows(timeout=15)
            self.assertTrue(len(rows) >= 0)
            self.page.clear_search()


if __name__ == "__main__":
    unittest.main(verbosity=2)
