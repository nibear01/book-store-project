import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from pages.login.set_up import BookStopSetUp


class AdminAuthorRequestPage:
    SECTION = (By.CSS_SELECTOR, '[class*="space-y-5"]')
    TITLE = (By.CSS_SELECTOR, 'h1.text-xl.font-bold')
    SUBTITLE = (By.CSS_SELECTOR, 'p.text-gray-600.text-sm')
    ERROR = (By.CSS_SELECTOR, '.bg-red-100.border-red-400.text-red-700')

    TOOLBAR = (By.CSS_SELECTOR, 'div.flex.flex-col.sm\\:flex-row.sm\\:items-center.sm\\:justify-between')
    SEARCH_INPUT = (By.NAME, "search")
    STATUS_FILTER = (By.NAME, "statusFilter")
    SORT_SELECT = (By.NAME, "sortOrder")
    SEARCH_CLEAR = (By.CSS_SELECTOR, 'button[name="search-clear"]') 

    TABLE = (By.CSS_SELECTOR, 'table.min-w-full.text-sm')
    TABLE_WRAP = (By.CSS_SELECTOR, 'div.overflow-x-auto.border.rounded-md')
    ROWS = (By.CSS_SELECTOR, 'tbody tr.border-t')
    EMPTY_STATE = (By.CSS_SELECTOR, 'div.text-sm.text-gray-600:contains("No requests found")')
    LOADING = (By.CSS_SELECTOR, 'div.text-sm.text-gray-600:contains("Loading requests")')
    
    VIEW_BTNS = (By.CSS_SELECTOR, 'button[name="view-details"]')
    VERIFY_BTNS = (By.CSS_SELECTOR, 'button[name="verify-request"]')
    PENDING_BTNS = (By.CSS_SELECTOR, 'button[name="set-pending"]')
    CANCEL_BTNS = (By.CSS_SELECTOR, 'button[name="cancel-request"]')
    
    STATUS_BADGES = (By.CSS_SELECTOR, 'span.inline-flex.items-center.px-2.py-0.5.rounded-full.text-xs.font-medium.border')

    DETAILS_MODAL = (By.CSS_SELECTOR, '[role="dialog"], .fixed, .absolute')  
    DETAILS_CLOSE = (By.CSS_SELECTOR, 'button:contains("Close"), button[name*="close"]')
    PAGINATION = (By.CSS_SELECTOR, 'div.flex.items-center.justify-between.gap-3.p-3.border-t')
    PREV_PAGE_BTN = (By.NAME, "prev-page")
    NEXT_PAGE_BTN = (By.NAME, "next-page")
    PAGE_INFO = (By.CSS_SELECTOR, 'span.text-sm.text-gray-700')
    RESULTS_INFO = (By.CSS_SELECTOR, 'div.text-xs.text-gray-600')

    def __init__(self, driver):
        self.d = driver
        self.page_size = 10  

    def open(self, base_url):
        try:
            self.d.get(f"{base_url}/admin/author-requests")
            self.wait_loaded()
            return self
        except Exception as e:
            print(f"Direct navigation failed: {e}")
            try:
                link = WebDriverWait(self.d, 10).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href*="/admin/author-requests"]'))
                )
                link.click()
                self.wait_loaded()
            except Exception:
                self.d.get(f"{base_url}/admin/author-requests")
                self.wait_loaded()
        return self

    def wait_loaded(self, timeout=30):
        try:
            WebDriverWait(self.d, timeout).until(
                lambda driver: (
                    driver.find_elements(*self.TABLE) or 
                    driver.find_elements(*self.LOADING) or
                    driver.find_elements(*self.EMPTY_STATE) or
                    driver.find_elements(*self.ERROR)
                )
            )
            WebDriverWait(self.d, 10).until(
                EC.presence_of_element_located(self.TOOLBAR)
            )
            print("Page loaded successfully")
            return self
        except Exception as e:
            print(f"Page load timeout: {e}")
            # self.d.save_screenshot("page_load_timeout.png")
            raise

    def wait_by(self, locator, timeout=20):
        return WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(locator))

    def wait_clickable(self, locator, timeout=20):
        return WebDriverWait(self.d, timeout).until(EC.element_to_be_clickable(locator))

    def wait_invisible(self, locator, timeout=20):
        WebDriverWait(self.d, timeout).until(EC.invisibility_of_element_located(locator))
        return True

    def find_all(self, locator):
        return self.d.find_elements(*locator)

    def is_element_present(self, locator, timeout=5):
        try:
            WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(locator))
            return True
        except:
            return False

    def search(self, term: str):
        try:
            el = self.wait_clickable(self.SEARCH_INPUT)
            el.clear()
            el.send_keys(term)
            time.sleep(2)  
            return self
        except Exception as e:
            print(f"Search failed: {e}")
            return self

    def clear_search(self):
        try:
            el = self.wait_by(self.SEARCH_INPUT)
            el.clear()
            time.sleep(1)
        except Exception:
            pass
        return self

    def set_status_filter(self, status: str):
        try:
            select = Select(self.wait_clickable(self.STATUS_FILTER))
            select.select_by_value(status)
            time.sleep(2) 
            return self
        except Exception as e:
            print(f"Status filter failed: {e}")
            return self

    def set_sort(self, order: str):
        try:
            select = Select(self.wait_clickable(self.SORT_SELECT))
            select.select_by_value(order)
            time.sleep(2)  
            return self
        except Exception as e:
            print(f"Sort failed: {e}")
            return self

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
        except Exception as e:
            print(f"Results count failed: {e}")
        return 0, 0

    def get_all_rows(self):
        try:
            return self.find_all(self.ROWS)
        except Exception:
            return []

    def find_row_by_applicant_name(self, name: str):
        rows = self.get_all_rows()
        for r in rows:
            try:
                applicant_name = self.get_applicant_name_from_row(r)
                if name.lower() in applicant_name.lower():
                    return r
            except Exception:
                continue
        return None

    def count_visible_rows(self):
        return len(self.get_all_rows())

    def get_applicant_name_from_row(self, row_el):
        try:
            tds = row_el.find_elements(By.TAG_NAME, "td")
            if tds and len(tds) > 0:
                name_div = tds[0].find_element(By.CSS_SELECTOR, 'div.font-medium.text-gray-900')
                return name_div.text.strip()
        except Exception:
            return ""

    def get_contact_info_from_row(self, row_el):
        try:
            tds = row_el.find_elements(By.TAG_NAME, "td")
            if len(tds) > 1:
                return tds[1].text.strip()
        except Exception:
            return ""

    def get_work_title_from_row(self, row_el):
        try:
            tds = row_el.find_elements(By.TAG_NAME, "td")
            if len(tds) > 2:
                title_div = tds[2].find_element(By.CSS_SELECTOR, 'div.font-medium.text-gray-900')
                return title_div.text.strip()
        except Exception:
            return ""

    def get_status_from_row(self, row_el):
        try:
            tds = row_el.find_elements(By.TAG_NAME, "td")
            if len(tds) > 4:
                status_span = tds[4].find_element(By.CSS_SELECTOR, 'span')
                return status_span.text.strip().lower()
        except Exception:
            return ""

    def get_status_badge_for_row(self, row_el):
        try:
            tds = row_el.find_elements(By.TAG_NAME, "td")
            if len(tds) > 4:
                return tds[4].find_element(By.CSS_SELECTOR, 'span')
        except Exception:
            return None

    def get_verify_button_for_row(self, row_el):
        try:
            return row_el.find_element(By.CSS_SELECTOR, 'button[name="verify-request"]')
        except Exception:
            return None

    def get_pending_button_for_row(self, row_el):
        try:
            return row_el.find_element(By.CSS_SELECTOR, 'button[name="set-pending"]')
        except Exception:
            return None

    def get_cancel_button_for_row(self, row_el):
        try:
            return row_el.find_element(By.CSS_SELECTOR, 'button[name="cancel-request"]')
        except Exception:
            return None

    def click_view_details_for_row(self, row_el):
        try:
            view_btn = row_el.find_element(By.CSS_SELECTOR, 'button[name="view-details"]')
            self.d.execute_script("arguments[0].scrollIntoView({block:'center'}); arguments[0].click();", view_btn)
            time.sleep(1) 
            return True
        except Exception as e:
            print(f"View details failed: {e}")
            return False

    def click_verify_for_row(self, row_el):
        try:
            verify_btn = self.get_verify_button_for_row(row_el)
            if verify_btn and verify_btn.is_enabled():
                self.d.execute_script("arguments[0].scrollIntoView({block:'center'}); arguments[0].click();", verify_btn)
                time.sleep(2) 
                return True
        except Exception as e:
            print(f"Verify failed: {e}")
        return False

    def click_pending_for_row(self, row_el):
        try:
            pending_btn = self.get_pending_button_for_row(row_el)
            if pending_btn and pending_btn.is_enabled():
                self.d.execute_script("arguments[0].scrollIntoView({block:'center'}); arguments[0].click();", pending_btn)
                time.sleep(2)
                return True
        except Exception as e:
            print(f"Pending failed: {e}")
        return False

    def click_cancel_for_row(self, row_el):
        try:
            cancel_btn = self.get_cancel_button_for_row(row_el)
            if cancel_btn and cancel_btn.is_enabled():
                self.d.execute_script("arguments[0].scrollIntoView({block:'center'}); arguments[0].click();", cancel_btn)
                time.sleep(2)
                return True
        except Exception as e:
            print(f"Cancel failed: {e}")
        return False

    def is_details_modal_visible(self):
        return self.is_element_present(self.DETAILS_MODAL)

    def close_details_modal(self):
        try:
            if self.is_element_present(self.DETAILS_CLOSE):
                close_btn = self.wait_clickable(self.DETAILS_CLOSE)
                close_btn.click()
            else:
                self.d.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
            time.sleep(1)
            return True
        except Exception as e:
            print(f"Close modal failed: {e}")
            return False

    def wait_details_modal_closed(self, timeout=10):
        try:
            WebDriverWait(self.d, timeout).until(
                lambda driver: not self.is_details_modal_visible()
            )
            return True
        except Exception:
            return False

    def click_next_page(self):
        try:
            if not self.is_next_button_disabled():
                self.wait_clickable(self.NEXT_PAGE_BTN).click()
                time.sleep(2) 
                return True
        except Exception as e:
            print(f"Next page failed: {e}")
        return False

    def click_prev_page(self):
        try:
            if not self.is_prev_button_disabled():
                self.wait_clickable(self.PREV_PAGE_BTN).click()
                time.sleep(2)
                return True
        except Exception as e:
            print(f"Prev page failed: {e}")
        return False

    def get_current_page(self):
        try:
            if self.is_element_present(self.PAGE_INFO):
                page_info = self.wait_by(self.PAGE_INFO).text
                parts = page_info.split()
                if len(parts) >= 2:
                    return int(parts[1])
        except Exception:
            pass
        return 1

    def get_total_pages(self):
        try:
            if self.is_element_present(self.PAGE_INFO):
                page_info = self.wait_by(self.PAGE_INFO).text
                parts = page_info.split()
                if len(parts) >= 4:
                    return int(parts[3])
        except Exception:
            pass
        return 1

    def is_prev_button_disabled(self):
        try:
            btn = self.wait_by(self.PREV_PAGE_BTN)
            return btn.get_attribute("disabled") is not None or "disabled" in btn.get_attribute("class")
        except Exception:
            return True

    def is_next_button_disabled(self):
        try:
            btn = self.wait_by(self.NEXT_PAGE_BTN)
            return btn.get_attribute("disabled") is not None or "disabled" in btn.get_attribute("class")
        except Exception:
            return True

    def go_to_last_page(self):
        total_pages = self.get_total_pages()
        current_page = self.get_current_page()
        
        while current_page < total_pages and self.click_next_page():
            current_page = self.get_current_page()
            if current_page >= total_pages:
                break
        
        return self

    def get_total_items_count(self):
        _, total = self.get_results_count()
        return total

    def get_table_headers(self):
        try:
            headers = self.d.find_elements(By.CSS_SELECTOR, f'{self.TABLE[1]} thead th')
            return [h.text for h in headers if h.text]
        except Exception:
            return []

    def click_refresh(self):
        return self.open(self.d.current_url.split('/admin/')[0])

    def is_loading_visible(self):
        return self.is_element_present(self.LOADING)

    def is_error_visible(self):
        return self.is_element_present(self.ERROR)

    def cleanup_requests_with_prefix(self):
        self.clear_search()
        return self

class AdminAuthorRequestBaseTest(BookStopSetUp):
    def login_as_admin(self):
        super().login_as_admin()

    def open_author_requests_page(self):
        self.login_as_admin()
        page = AdminAuthorRequestPage(self.driver)
        page.open(self.BASE_URL)
        return page