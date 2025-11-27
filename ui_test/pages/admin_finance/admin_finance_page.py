import re
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from ui_test.pages.admin_finance import admin_finance_constants as C


class AdminFinancePage:
    """
    Page Object Model for Admin Finance page.
    
    Encapsulates all UI interactions and element locators for the
    Finance Manager workflow interface.
    
    Under test: frontend/src/components/adminComponents/Finance.jsx
    Detail modal: frontend/src/components/adminComponents/support/WorkflowOrderModal.jsx
    
    NOTE: All locators use By.NAME for stability and maintainability.
    """
    
    # ===== PAGE LEVEL LOCATORS =====
    PAGE_CONTAINER = (By.NAME, "finance-page")
    PAGE_TITLE = (By.NAME, "finance-page-title")
    REFRESH_BTN = (By.NAME, "finance-refresh-btn")
    SEARCH_INPUT = (By.NAME, "finance-search-input")
    SEARCH_CLEAR_BTN = (By.NAME, "finance-search-clear-btn")
    STAGE_FILTER = (By.NAME, "finance-stage-filter")
    
    # Table locators
    TABLE = (By.NAME, "finance-table")
    TABLE_HEADERS = (By.TAG_NAME, "th")
    TABLE_ROWS = (By.NAME, "finance-row")
    OPEN_BTN = (By.NAME, "finance-open-btn")
    
    # Mobile card locators
    MOBILE_CARDS = (By.NAME, "finance-mobile-card")
    MOBILE_CARD_OPEN_BTN = (By.NAME, "finance-mobile-open-btn")
    
    # Pagination locators
    PAGINATION_CONTAINER = (By.NAME, "finance-pagination")
    PAGINATION_PREV = (By.NAME, "finance-pagination-prev")
    PAGINATION_NEXT = (By.NAME, "finance-pagination-next")
    
    # Empty state
    EMPTY_STATE = (By.XPATH, f"//td[contains(text(), '{C.UIText.NO_ORDERS}')]")
    
    # Loading state
    SKELETON_LOADER = (By.CLASS_NAME, C.UIText.ANIMATION_CLASS)
    
    # Access denied message
    ACCESS_DENIED = (By.XPATH, "//div[contains(text(), 'Access restricted')]")
    
    # ===== MODAL LOCATORS (from WorkflowOrderModal) =====
    MODAL_TITLE = (By.NAME, "workflow-modal-title")
    MODAL_STAGE = (By.NAME, "workflow-modal-stage")
    MODAL_CLOSE_BTN = (By.NAME, "workflow-modal-close-btn")
    
    # Modal items table
    MODAL_ITEMS_TABLE = (By.NAME, "workflow-modal-items-table")
    MODAL_ITEMS_ROWS = (By.XPATH, "//table[@name='workflow-modal-items-table']//tbody//tr")
    
    # Remarks and buttons
    REMARKS_TEXTAREA = (By.NAME, "workflow-modal-remarks")
    CLEAR_REMARKS_BTN = (By.NAME, "workflow-modal-clear-remarks")
    
    def __init__(self, driver):
        """Initialize page object with WebDriver instance."""
        self.d = driver

    def wait_by(self, locator, timeout=C.Timeouts.DEFAULT):
        """Wait for element to be present."""
        return WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(locator))

    def wait_clickable(self, locator, timeout=C.Timeouts.DEFAULT):
        """Wait for element to be clickable."""
        return WebDriverWait(self.d, timeout).until(EC.element_to_be_clickable(locator))

    def wait_visible(self, locator, timeout=C.Timeouts.DEFAULT):
        """Wait for element to be visible."""
        return WebDriverWait(self.d, timeout).until(EC.visibility_of_element_located(locator))

    def find_all(self, locator):
        """Find all elements matching locator."""
        return self.d.find_elements(*locator)

    def find_one(self, locator):
        """Find first element matching locator."""
        elements = self.find_all(locator)
        return elements[0] if elements else None

    def open(self, base_url):
        """Navigate to Finance page via sidebar or direct URL."""
        finance_link = self.find_all((By.XPATH, "//a[@href='/admin/finance']"))
        if finance_link:
            finance_link[0].click()
        else:
            self.d.get(f"{base_url}/admin/finance")
        return self

    def wait_loaded(self, timeout=C.Timeouts.DEFAULT):
        """Wait for page to fully load."""
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.PAGE_TITLE))
        return self

    def is_loaded(self):
        """Check if page is loaded (title visible and table or empty state present)."""
        title_present = bool(self.find_all(self.PAGE_TITLE))
        table_or_empty = bool(self.find_all(self.TABLE)) or self.has_empty_state() or self.has_no_access()
        return title_present and table_or_empty

    def has_no_access(self):
        """Check if access denied message is displayed."""
        return bool(self.find_all(self.ACCESS_DENIED))

    def has_empty_state(self):
        """Check if no orders message is displayed."""
        return bool(self.find_all(self.EMPTY_STATE))

    def is_loading(self):
        """Check if page is in loading state."""
        return bool(self.find_all(self.SKELETON_LOADER))

    def wait_loading_cycle(self, timeout=C.Timeouts.DEFAULT):
        """Wait for loading animation to disappear."""
        WebDriverWait(self.d, timeout).until(
            EC.invisibility_of_element_located(self.SKELETON_LOADER)
        )
        return self

    # ===== REFRESH =====
    def click_refresh(self):
        """Click refresh button."""
        self.wait_clickable(self.REFRESH_BTN).click()
        return self

    # ===== SEARCH =====
    def set_search(self, value):
        """Set search input value."""
        el = self.wait_by(self.SEARCH_INPUT)
        el.clear()
        if value:
            el.send_keys(value)
        time.sleep(0.4)  # Wait for debounce
        return self

    def clear_search(self):
        """Clear search input."""
        return self.set_search("")

    def click_search_clear_btn(self):
        """Click the × clear button in search field."""
        btns = self.find_all(self.SEARCH_CLEAR_BTN)
        if btns:
            btns[0].click()
            return self
        raise AssertionError("Search clear button not found")

    def get_search_value(self):
        """Get current search input value."""
        el = self.find_one(self.SEARCH_INPUT)
        return el.get_attribute("value") if el else ""

    # ===== STAGE FILTER =====
    def set_stage_filter(self, stage_text):
        """Set stage filter dropdown."""
        select = Select(self.wait_by(self.STAGE_FILTER))
        select.select_by_visible_text(C.Stages.FILTER_ALL if not stage_text else stage_text)
        time.sleep(0.3)
        return self

    def get_stage_filter_options(self):
        """Get all available stage filter options."""
        try:
            select = Select(self.wait_by(self.STAGE_FILTER))
            return [opt.text for opt in select.options]
        except:
            raise AssertionError(C.Messages.Error.NO_STAGE_FILTER)

    def get_selected_stage_filter(self):
        """Get currently selected stage filter."""
        select = Select(self.find_one(self.STAGE_FILTER))
        return select.first_selected_option.text if select.first_selected_option else ""

    # ===== TABLE OPERATIONS =====
    def count_table_rows(self):
        """Count visible order rows in table."""
        return len(self.find_all(self.TABLE_ROWS))

    def get_row_stage(self, row_index):
        """Get internal_stage from specific row."""
        rows = self.find_all(self.TABLE_ROWS)
        if row_index < len(rows):
            cells = rows[row_index].find_elements(By.TAG_NAME, "td")
            if len(cells) >= 3:
                return cells[2].text.strip()
        return None

    def get_row_order_number(self, row_index):
        """Get order_number from specific row."""
        rows = self.find_all(self.TABLE_ROWS)
        if row_index < len(rows):
            cells = rows[row_index].find_elements(By.TAG_NAME, "td")
            if len(cells) >= 1:
                return cells[0].text.strip()
        return None

    # ===== PAGINATION =====
    def has_pagination(self):
        """Check if pagination controls are visible."""
        return bool(self.find_all(self.PAGINATION_CONTAINER))

    def click_pagination_next(self):
        """Click pagination next button."""
        btn = self.wait_clickable(self.PAGINATION_NEXT, timeout=C.Timeouts.QUICK)
        btn.click()
        return self

    def click_pagination_prev(self):
        """Click pagination prev button."""
        btn = self.wait_clickable(self.PAGINATION_PREV, timeout=C.Timeouts.QUICK)
        btn.click()
        return self

    def is_pagination_next_disabled(self):
        """Check if next button is disabled."""
        btn = self.find_one(self.PAGINATION_NEXT)
        return btn.get_attribute("disabled") == "true" if btn else False

    def is_pagination_prev_disabled(self):
        """Check if prev button is disabled."""
        btn = self.find_one(self.PAGINATION_PREV)
        return btn.get_attribute("disabled") == "true" if btn else False

    # ===== MODAL OPERATIONS =====
    def modal_is_open(self):
        """Check if order detail modal is open."""
        return bool(self.find_all(self.MODAL_TITLE))

    def open_first_order(self):
        """Click Open button on first order row."""
        btns = self.find_all(self.OPEN_BTN)
        if not btns:
            raise AssertionError(C.Messages.Error.NO_OPEN_BUTTON)
        btns[0].click()
        self.wait_visible(self.MODAL_TITLE, timeout=C.Timeouts.SHORT)
        return self

    def modal_get_title_text(self):
        """Get modal title text (Order number)."""
        el = self.find_one(self.MODAL_TITLE)
        return el.text.strip() if el else ""

    def modal_get_stage_text(self):
        """Get current stage from modal subtitle."""
        el = self.find_one(self.MODAL_STAGE)
        if el:
            return el.text.strip().replace("Stage: ", "")
        return ""

    def modal_get_customer_name(self):
        """Get customer name from modal."""
        el = self.find_one((By.XPATH, "//p[strong[contains(text(), 'Customer:')]]"))
        return el.text.split(": ")[1].strip() if el else ""

    def modal_get_email(self):
        """Get email from modal."""
        el = self.find_one((By.XPATH, "//p[strong[contains(text(), 'Email:')]]"))
        return el.text.split(": ")[1].strip() if el else ""

    def modal_has_financial_section(self):
        """Check if modal shows financial details."""
        return bool(self.find_one((By.XPATH, "//strong[contains(text(), 'Subtotal:')]")))

    def modal_has_items_table(self):
        """Check if modal shows items table."""
        return bool(self.find_one(self.MODAL_ITEMS_TABLE))

    def modal_count_items(self):
        """Count items in modal items table."""
        return len(self.find_all(self.MODAL_ITEMS_ROWS))

    def modal_close(self):
        """Close order detail modal."""
        self.wait_clickable(self.MODAL_CLOSE_BTN).click()
        WebDriverWait(self.d, C.Timeouts.SHORT).until(
            EC.invisibility_of_element_located(self.MODAL_TITLE)
        )
        return self

    # ===== REMARKS & WORKFLOW =====
    def set_remarks(self, text):
        """Set remarks textarea value."""
        el = self.wait_by(self.REMARKS_TEXTAREA)
        el.clear()
        if text:
            el.send_keys(text)
        return self

    def clear_remarks(self):
        """Click clear button for remarks."""
        self.wait_clickable(self.CLEAR_REMARKS_BTN).click()
        return self

    def get_remarks_value(self):
        """Get current remarks textarea value."""
        el = self.find_one(self.REMARKS_TEXTAREA)
        return el.get_attribute("value") if el else ""

    def get_available_advance_stages(self):
        """Get list of available advance stage buttons."""
        # Find all advance buttons by name prefix
        btns = self.d.find_elements(By.CSS_SELECTOR, "button[name^='workflow-modal-advance-']")
        stages = []
        for btn in btns:
            name_attr = btn.get_attribute("name")
            if name_attr and name_attr.startswith("workflow-modal-advance-"):
                stage_name = name_attr.replace("workflow-modal-advance-", "")
                stages.append(stage_name)
        return stages

    def click_advance_to_stage(self, stage_name):
        """Click advance button for specific stage."""
        locator = (By.NAME, f"workflow-modal-advance-{stage_name}")
        btn = self.wait_clickable(locator, timeout=C.Timeouts.SHORT)
        btn.click()
        time.sleep(0.5)
        return self

    def advance_to_stage_with_remarks(self, stage_name, remarks_text):
        """Advance to stage with optional remarks."""
        if remarks_text:
            self.set_remarks(remarks_text)
        self.click_advance_to_stage(stage_name)
        return self

    def has_advance_button_for_stage(self, stage_name):
        """Check if advance button exists for stage."""
        locator = (By.NAME, f"workflow-modal-advance-{stage_name}")
        return bool(self.find_all(locator))

    def is_advance_button_disabled(self, stage_name):
        """Check if advance button is disabled."""
        locator = (By.NAME, f"workflow-modal-advance-{stage_name}")
        btn = self.find_one(locator)
        if btn:
            return btn.get_attribute("disabled") == "true"
        return False

    # ===== DESKTOP vs MOBILE =====
    def is_mobile_view(self):
        """Check if viewing mobile card layout."""
        table = self.find_one(self.TABLE)
        if table:
            computed = self.d.execute_script("return window.getComputedStyle(arguments[0]).display", table)
            return computed == "none"
        return False

    def count_mobile_cards(self):
        """Count visible mobile cards."""
        return len(self.find_all(self.MOBILE_CARDS))

    def open_first_mobile_card(self):
        """Open first order from mobile card layout."""
        btns = self.find_all(self.MOBILE_CARD_OPEN_BTN)
        if not btns:
            raise AssertionError(C.Messages.Error.NO_OPEN_BUTTON)
        btns[0].click()
        self.wait_visible(self.MODAL_TITLE, timeout=C.Timeouts.SHORT)
        return self

    # ===== WAIT HELPERS =====
    def wait_rows_nonnegative(self, timeout=C.Timeouts.SHORT):
        """Wait for table to be ready with 0 or more rows."""
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.TABLE))
        return self

    def wait_for_modal_to_show_data(self, timeout=C.Timeouts.SHORT):
        """Wait for modal to show customer data."""
        WebDriverWait(self.d, timeout).until(
            EC.visibility_of_element_located((By.XPATH, "//strong[contains(text(), 'Customer:')]"))
        )
        return self
    
    def count_advance_buttons(self):
        """Count available advance stage buttons."""
        return len(self.get_available_advance_stages())
