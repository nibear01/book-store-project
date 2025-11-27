from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from pages.login.set_up import BookStopSetUp


class AdminBookRequestPage:
    # Main page elements
    TITLE = (By.CSS_SELECTOR, 'h1.text-2xl.font-semibold')
    
    # Toolbar elements with name attributes
    TOOLBAR = (By.CSS_SELECTOR, 'div.flex.flex-col.sm\\:flex-row.sm\\:items-center.sm\\:justify-between')
    SEARCH_INPUT = (By.NAME, "book-request-search")
    STATUS_FILTER = (By.NAME, "book-request-status-filter")
    SORT_SELECT = (By.NAME, "book-request-sort-order")
    
    # Table elements
    TABLE = (By.CSS_SELECTOR, 'table.min-w-full.text-sm')
    ROWS = (By.CSS_SELECTOR, 'tbody tr.border-t')
    EMPTY_STATE = (By.XPATH, '//div[contains(text(), "No requests found")]')
    LOADING = (By.XPATH, '//div[contains(text(), "Loading requests")]')
    
    # Action buttons with dynamic names
    VIEW_BTNS = (By.CSS_SELECTOR, 'button[name^="view-request-"]')
    APPROVE_BTNS = (By.CSS_SELECTOR, 'button[name^="approve-request-"]')
    REJECT_BTNS = (By.CSS_SELECTOR, 'button[name^="reject-request-"]')
    FULFILL_BTNS = (By.CSS_SELECTOR, 'button[name^="fulfill-request-"]')
    
    # Status badges
    STATUS_BADGES = (By.CSS_SELECTOR, 'span.inline-flex.items-center.px-2.py-0.5.rounded-full')
    
    # Modal elements
    DETAILS_MODAL = (By.CSS_SELECTOR, '[role="dialog"]')
    DETAILS_CLOSE = (By.NAME, "close-request-details")
    MODAL_NAME = (By.XPATH, '//div[contains(text(), "Name")]/following-sibling::div')
    MODAL_EMAIL = (By.XPATH, '//div[contains(text(), "Email")]/following-sibling::div')
    MODAL_TITLE = (By.XPATH, '//div[contains(text(), "Title")]/following-sibling::div')
    
    # Pagination
    PAGINATION = (By.CSS_SELECTOR, 'div.flex.items-center.justify-between.gap-3.p-3.border-t')
    PREV_PAGE_BTN = (By.NAME, "book-request-prev-page")
    NEXT_PAGE_BTN = (By.NAME, "book-request-next-page")
    PAGE_INFO = (By.CSS_SELECTOR, 'span.text-sm.text-gray-700')
    RESULTS_INFO = (By.CSS_SELECTOR, 'div.text-xs.text-gray-600')
    
    # Admin sidebar elements
    SIDEBAR = (By.CSS_SELECTOR, '[class*="h-full fixed top-0 left-0 bg-white border-r"]')
    BOOK_REQUESTS_MENU_ITEM = (By.XPATH, '//a[@href="/admin/book-requests"]')
    ADMIN_HEADER = (By.XPATH, '//h1[contains(text(), "Admin Panel")]')

    def __init__(self, driver):
        self.d = driver

    def wait_by(self, locator, timeout=20):
        return WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(locator))

    def wait_clickable(self, locator, timeout=20):
        return WebDriverWait(self.d, timeout).until(EC.element_to_be_clickable(locator))

    def wait_visible(self, locator, timeout=20):
        return WebDriverWait(self.d, timeout).until(EC.visibility_of_element_located(locator))

    def wait_invisible(self, locator, timeout=20):
        return WebDriverWait(self.d, timeout).until(EC.invisibility_of_element_located(locator))

    def is_element_present(self, locator, timeout=5):
        try:
            WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(locator))
            return True
        except:
            return False

    def is_element_visible(self, locator, timeout=5):
        try:
            WebDriverWait(self.d, timeout).until(EC.visibility_of_element_located(locator))
            return True
        except:
            return False

    def navigate_to_book_requests_via_url(self, base_url):
        """Navigate directly to book requests via URL"""
        book_requests_url = f"{base_url}/admin/book-requests"
        print(f"Navigating directly to: {book_requests_url}")
        self.d.get(book_requests_url)
        return self.wait_for_book_requests_page()

    def navigate_to_book_requests_via_sidebar(self):
        """Navigate to book requests by clicking sidebar menu"""
        try:
            print("Attempting to navigate via sidebar...")
            
            # Wait for sidebar to be ready
            self.wait_visible(self.SIDEBAR, timeout=10)
            
            # Find and click the book requests menu item
            book_requests_link = self.wait_clickable(self.BOOK_REQUESTS_MENU_ITEM)
            book_requests_link.click()
            print("Clicked book requests menu item")
            
            return self.wait_for_book_requests_page()
        except Exception as e:
            print(f"Sidebar navigation failed: {e}")
            return False

    def wait_for_book_requests_page(self, timeout=30):
        """Wait for book requests page to load completely"""
        try:
            # Wait for URL to contain book-requests
            WebDriverWait(self.d, timeout).until(
                EC.url_contains("/admin/book-requests")
            )
            print(f"Successfully navigated to: {self.d.current_url}")
            
            # Wait for page content to load
            WebDriverWait(self.d, timeout).until(
                lambda driver: (
                    driver.find_elements(*self.SEARCH_INPUT) or
                    driver.find_elements(*self.TABLE) or
                    driver.find_elements(*self.LOADING) or
                    driver.find_elements(*self.EMPTY_STATE)
                )
            )
            print("Book requests page content loaded")
            return True
        except Exception as e:
            print(f"Failed to load book requests page: {e}")
            print(f"Current URL: {self.d.current_url}")
            return False

    def search(self, term):
        try:
            search_input = self.wait_clickable(self.SEARCH_INPUT)
            search_input.clear()
            search_input.send_keys(term)
            self.wait_loading_complete()
            return self
        except Exception as e:
            print(f"Search failed: {e}")
            return self

    def get_search_value(self):
        try:
            return self.wait_by(self.SEARCH_INPUT).get_attribute("value")
        except:
            return ""

    def set_status_filter(self, status):
        try:
            select = Select(self.wait_clickable(self.STATUS_FILTER))
            select.select_by_value(status)
            self.wait_loading_complete()
            return self
        except Exception as e:
            print(f"Status filter failed: {e}")
            return self

    def get_status_filter_value(self):
        try:
            select = Select(self.wait_by(self.STATUS_FILTER))
            return select.first_selected_option.get_attribute("value")
        except:
            return ""

    def set_sort_order(self, order):
        try:
            select = Select(self.wait_clickable(self.SORT_SELECT))
            select.select_by_value(order)
            self.wait_loading_complete()
            return self
        except Exception as e:
            print(f"Sort order failed: {e}")
            return self

    def get_sort_order_value(self):
        try:
            select = Select(self.wait_by(self.SORT_SELECT))
            return select.first_selected_option.get_attribute("value")
        except:
            return ""

    def get_all_rows(self):
        try:
            return self.d.find_elements(*self.ROWS)
        except:
            return []

    def get_table_headers(self):
        try:
            headers = self.d.find_elements(By.CSS_SELECTOR, f'{self.TABLE[1]} thead th')
            return [h.text.strip() for h in headers if h.text.strip()]
        except:
            return []

    def get_first_requester_name(self):
        try:
            rows = self.get_all_rows()
            if rows:
                return rows[0].find_element(By.CSS_SELECTOR, 'td:nth-child(1) .font-medium').text.strip()
            return ""
        except:
            return ""

    def get_first_requester_email(self):
        try:
            rows = self.get_all_rows()
            if rows:
                return rows[0].find_element(By.CSS_SELECTOR, 'td:nth-child(2) div').text.strip()
            return ""
        except:
            return ""

    def get_first_book_title(self):
        try:
            rows = self.get_all_rows()
            if rows:
                return rows[0].find_element(By.CSS_SELECTOR, 'td:nth-child(3) .font-medium').text.strip()
            return ""
        except:
            return ""

    def get_first_request_status(self):
        try:
            rows = self.get_all_rows()
            if rows:
                return rows[0].find_element(By.CSS_SELECTOR, 'td:nth-child(4) span').text.strip().lower()
            return ""
        except:
            return ""

    def click_first_view_details(self):
        try:
            rows = self.get_all_rows()
            if rows:
                view_btn = rows[0].find_element(By.CSS_SELECTOR, 'button[name^="view-request-"]')
                view_btn.click()
                self.wait_visible(self.DETAILS_MODAL)
            return self
        except Exception as e:
            print(f"View details failed: {e}")
            return self

    def is_details_modal_visible(self):
        return self.is_element_visible(self.DETAILS_MODAL)

    def close_details_modal(self):
        try:
            if self.is_element_visible(self.DETAILS_CLOSE):
                self.wait_clickable(self.DETAILS_CLOSE).click()
                self.wait_invisible(self.DETAILS_MODAL)
            return self
        except Exception as e:
            print(f"Close modal failed: {e}")
            return self

    def get_modal_name(self):
        try:
            if self.is_details_modal_visible():
                return self.wait_by(self.MODAL_NAME).text.strip()
            return ""
        except:
            return ""

    def get_modal_email(self):
        try:
            if self.is_details_modal_visible():
                return self.wait_by(self.MODAL_EMAIL).text.strip()
            return ""
        except:
            return ""

    def get_modal_title(self):
        try:
            if self.is_details_modal_visible():
                return self.wait_by(self.MODAL_TITLE).text.strip()
            return ""
        except:
            return ""

    def get_results_count(self):
        try:
            if self.is_element_present(self.RESULTS_INFO):
                text = self.wait_by(self.RESULTS_INFO).text
                parts = text.split()
                if len(parts) >= 4:
                    showing_range = parts[1].split('-')
                    if len(showing_range) == 2:
                        shown_start = int(showing_range[0])
                        shown_end = int(showing_range[1])
                        total = int(parts[3])
                        return shown_end - shown_start + 1, total
            return 0, 0
        except:
            return 0, 0

    def get_current_page(self):
        try:
            if self.is_element_present(self.PAGE_INFO):
                page_info = self.wait_by(self.PAGE_INFO).text
                parts = page_info.split()
                if len(parts) >= 2:
                    return int(parts[1])
            return 1
        except:
            return 1

    def get_total_pages(self):
        try:
            if self.is_element_present(self.PAGE_INFO):
                page_info = self.wait_by(self.PAGE_INFO).text
                parts = page_info.split()
                if len(parts) >= 4:
                    return int(parts[3])
            return 1
        except:
            return 1

    def click_next_page(self):
        try:
            if not self.is_next_button_disabled():
                self.wait_clickable(self.NEXT_PAGE_BTN).click()
                self.wait_loading_complete()
            return self
        except Exception as e:
            print(f"Next page failed: {e}")
            return self

    def click_prev_page(self):
        try:
            if not self.is_prev_button_disabled():
                self.wait_clickable(self.PREV_PAGE_BTN).click()
                self.wait_loading_complete()
            return self
        except Exception as e:
            print(f"Prev page failed: {e}")
            return self

    def is_prev_button_disabled(self):
        try:
            btn = self.wait_by(self.PREV_PAGE_BTN)
            return btn.get_attribute("disabled") is not None
        except:
            return True

    def is_next_button_disabled(self):
        try:
            btn = self.wait_by(self.NEXT_PAGE_BTN)
            return btn.get_attribute("disabled") is not None
        except:
            return True

    def is_loading_visible(self):
        return self.is_element_visible(self.LOADING)

    def is_empty_state_visible(self):
        return self.is_element_visible(self.EMPTY_STATE)

    def wait_loading_complete(self, timeout=10):
        try:
            self.wait_invisible(self.LOADING, timeout=timeout)
        except:
            pass
        return True


class AdminBookRequestBaseTest(BookStopSetUp):
    def login_and_navigate_to_book_requests(self):
        """Login as admin and automatically navigate to book requests page"""
        # First login as admin - this will redirect to /admin/dashboard
        super().login_as_admin()
        
        # Wait for admin dashboard to load
        self.wait_for_admin_dashboard()
        
        # Now navigate to book requests using multiple strategies
        page = AdminBookRequestPage(self.driver)
        
        # Strategy 1: Try direct URL navigation first
        print("Attempting direct URL navigation...")
        if page.navigate_to_book_requests_via_url(self.BASE_URL):
            return page
        
        # Strategy 2: If direct URL fails, try sidebar navigation
        print("Direct URL failed, trying sidebar navigation...")
        if page.navigate_to_book_requests_via_sidebar():
            return page
        
        # Strategy 3: If both fail, try URL again with longer timeout
        print("Sidebar navigation failed, retrying direct URL...")
        self.driver.get(f"{self.BASE_URL}/admin/book-requests")
        if page.wait_for_book_requests_page(timeout=40):
            return page
        
        raise Exception("Failed to navigate to book requests page after multiple attempts")

    def wait_for_admin_dashboard(self, timeout=30):
        """Wait for admin dashboard to load completely"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.url_contains("/admin")
            )
            print(f"Admin dashboard loaded: {self.driver.current_url}")
            
            # Wait for admin header or sidebar to be visible
            WebDriverWait(self.driver, timeout).until(
                lambda driver: (
                    driver.find_elements(By.XPATH, '//h1[contains(text(), "Admin Panel")]') or
                    driver.find_elements(By.CSS_SELECTOR, '[class*="h-full fixed top-0 left-0 bg-white border-r"]')
                )
            )
            print("Admin panel elements loaded")
            return True
        except Exception as e:
            print(f"Admin dashboard load failed: {e}")
            return False

    def open_book_requests_page(self):
        """Main method to open book requests page"""
        return self.login_and_navigate_to_book_requests()