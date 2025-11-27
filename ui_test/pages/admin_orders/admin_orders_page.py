import re
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from ui_test.pages.admin_orders import admin_orders_constants as C


class AdminOrdersPage:
    TITLE = (By.NAME, "orders-page-title")
    REFRESH_BTN = (By.NAME, "orders-refresh-btn")
    SEARCH_INPUT = (By.NAME, "orders-search-input")
    STAGE_FILTER = (By.NAME, "orders-stage-filter")
    STATUS_FILTER = (By.NAME, "orders-status-filter")
    DATE_FILTER = (By.NAME, "orders-date-filter")
    SORT_FILTER = (By.NAME, "orders-sort-filter")
    SORT_DIR = (By.NAME, "orders-sort-direction")
    VIEW_WORKFLOW_BTN = (By.NAME, "orders-view-workflow-btn")
    VIEW_PUBLIC_BTN = (By.NAME, "orders-view-public-btn")
    SHOWING_COUNTS = (By.NAME, "orders-showing-counts")
    TABLE = (By.NAME, "orders-table")
    ROWS = (By.NAME, "orders-row")
    STATUS_SELECT = (By.NAME, "order-status-select")
    VIEW_BTN = (By.NAME, "orders-view-btn")
    HISTORY_BTN = (By.NAME, "orders-history-btn")

    MODAL_TITLE = (By.NAME, "order-modal-title")
    MODAL_EDIT_BTN = (By.NAME, "order-modal-edit-btn")
    MODAL_SAVE_BTN = (By.NAME, "order-modal-save-btn")
    MODAL_PRINT_BTN = (By.NAME, "order-modal-print-btn")
    MODAL_DELETE_BTN = (By.NAME, "order-modal-delete-btn")
    MODAL_CLOSE_BTN = (By.NAME, "order-modal-close-btn")

    WF_TITLE = (By.NAME, "workflow-history-title")
    WF_REFRESH_BTN = (By.NAME, "workflow-history-refresh-btn")
    WF_TOGGLE_BTN = (By.NAME, "workflow-history-toggle-btn")
    WF_CLOSE_BTN = (By.NAME, "workflow-history-close-btn")

    # WorkflowActionsModal selectors
    WF_ACTIONS_TITLE = (By.NAME, "workflow-actions-title")
    WF_ACTIONS_REMARKS = (By.NAME, "workflow-actions-remarks")
    WF_ACTIONS_CLEAR_REMARKS = (By.NAME, "workflow-actions-clear-remarks")
    WF_ACTIONS_CLOSE_BTN = (By.NAME, "workflow-actions-close-btn")
    ACTIONS_BTN = (By.NAME, "orders-actions-btn")

    def __init__(self, driver):
        self.d = driver

    def wait_by(self, locator, timeout=C.Timeouts.DEFAULT):
        return WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(locator))

    def wait_clickable(self, locator, timeout=C.Timeouts.DEFAULT):
        return WebDriverWait(self.d, timeout).until(EC.element_to_be_clickable(locator))

    def find_all(self, locator):
        return self.d.find_elements(*locator)

    def robust_click(self, locator, timeout=C.Timeouts.SHORT):
        el = self.wait_clickable(locator, timeout=C.Timeouts.QUICK)
        el.click()
        return True

    def open(self, base_url):
        link = self.find_all((By.NAME, "admin-nav-orders"))
        if link:
            link[0].click()
        else:
            self.d.get(f"{base_url}/admin/orders")
        return self

    def wait_loaded(self, timeout=C.Timeouts.DEFAULT):
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.TITLE))
        return self

    def is_loaded(self):
        return bool(self.find_all(self.TITLE)) and (
            bool(self.find_all(self.TABLE)) or self.has_no_results_message()
        )

    def click_refresh(self):
        self.wait_by(self.REFRESH_BTN).click()
        return self

    def wait_loading_cycle(self, timeout=C.Timeouts.DEFAULT):
        WebDriverWait(self.d, timeout).until(
            EC.invisibility_of_element_located((By.CLASS_NAME, C.UIText.ANIMATION_CLASS_PULSE))
        )
        return self

    def set_search(self, value):
        el = self.wait_by(self.SEARCH_INPUT)
        el.clear()
        if value:
            el.send_keys(value)
        return self

    def clear_search(self):
        return self.set_search("")

    def toggle_workflow(self):
        self.wait_by(self.VIEW_WORKFLOW_BTN).click()
        return self

    def toggle_public_status(self):
        self.wait_by(self.VIEW_PUBLIC_BTN).click()
        return self

    def has_workflow_toggle(self):
        return bool(self.find_all(self.VIEW_WORKFLOW_BTN))

    def has_public_toggle(self):
        return bool(self.find_all(self.VIEW_PUBLIC_BTN))

    def set_stage_filter(self, stage_text):
        Select(self.wait_by(self.STAGE_FILTER)).select_by_visible_text(
            C.Stages.ALL_STAGES if not stage_text else stage_text
        )
        return self

    def set_status_filter(self, status_text):
        Select(self.wait_by(self.STATUS_FILTER)).select_by_visible_text(status_text)
        return self

    def set_date_filter(self, date_text):
        Select(self.wait_by(self.DATE_FILTER)).select_by_visible_text(date_text)
        return self

    def set_sort_by(self, sort_text):
        Select(self.wait_by(self.SORT_FILTER)).select_by_visible_text(sort_text)
        return self

    def set_sort_direction(self, dir_text):
        Select(self.wait_by(self.SORT_DIR)).select_by_visible_text(dir_text)
        return self

    def get_showing_counts(self):
        elts = self.find_all(self.SHOWING_COUNTS)
        if not elts:
            return None
        m = re.search(C.UIText.SHOWING_COUNTS_PATTERN, elts[0].text, re.I)
        return (int(m.group(1)), int(m.group(2))) if m else None

    def count_table_rows(self):
        return len(self.find_all(self.ROWS))

    def has_no_results_message(self):
        cells = self.find_all((By.TAG_NAME, "td"))
        for td in cells:
            if C.UIText.NO_ORDERS in (td.text or "").strip().lower():
                return True
        return False

    def current_filter_mode(self):
        if self.find_all(self.STAGE_FILTER):
            return C.FilterModes.WORKFLOW
        if self.find_all(self.STATUS_FILTER):
            return C.FilterModes.PUBLIC
        return C.FilterModes.UNKNOWN

    def status_select_in_table_present(self, timeout=C.Timeouts.SHORT):
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.TABLE))
        if self.find_all(self.STATUS_SELECT):
            return True
        rows = self.find_all(self.ROWS)
        for r in rows:
            if r.find_elements(By.TAG_NAME, "select"):
                return True
        return False

    def has_history_button(self):
        return bool(self.find_all(self.HISTORY_BTN))

    def wait_for_mode(self, expected, timeout=C.Timeouts.SHORT):
        expected = expected.lower().strip()
        if expected == C.FilterModes.WORKFLOW:
            WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.STAGE_FILTER))
        elif expected == C.FilterModes.PUBLIC:
            WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.STATUS_FILTER))
        return self

    def wait_rows_nonnegative(self, timeout=C.Timeouts.SHORT):
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.TABLE))
        return self

    def modal_is_open(self):
        return bool(self.find_all(self.MODAL_TITLE))

    def open_first_order_modal(self):
        btns = self.find_all(self.VIEW_BTN)
        if btns:
            btns[0].click()
            self.wait_clickable(self.MODAL_TITLE)
            return self
        raise AssertionError(C.Messages.Error.NO_VIEW_BUTTON)

    def modal_click_edit_customer_info(self):
        el = self.wait_clickable(self.MODAL_EDIT_BTN)
        self.d.execute_script("arguments[0].click();", el)
        self.wait_by(self.MODAL_SAVE_BTN)
        return self

    def modal_save_changes(self):
        self.wait_by(self.MODAL_SAVE_BTN).click()
        self.wait_by(self.MODAL_EDIT_BTN)
        return self

    def modal_click_print(self):
        self.d.execute_script(
            "window.print = function(){};"
            "window.open = function(){ return { document: { write: function(){}, close: function(){} }, print: function(){} }; };"
        )
        self.wait_by(self.MODAL_PRINT_BTN).click()
        return self

    def modal_click_delete(self, accept=False):
        self.wait_by(self.MODAL_DELETE_BTN).click()
        WebDriverWait(self.d, C.Timeouts.QUICK).until(EC.alert_is_present())
        alert = self.d.switch_to.alert
        if accept:
            alert.accept()
            WebDriverWait(self.d, C.Timeouts.SHORT).until(EC.invisibility_of_element_located(self.MODAL_TITLE))
        else:
            alert.dismiss()
            self.wait_by(self.MODAL_TITLE)
        return self

    def modal_close(self):
        self.wait_by(self.MODAL_CLOSE_BTN).click()
        WebDriverWait(self.d, C.Timeouts.SHORT).until(EC.invisibility_of_element_located(self.MODAL_TITLE))
        return self

    def history_modal_is_open(self):
        return bool(self.find_all(self.WF_TITLE))

    def open_first_history_modal(self):
        btns = self.find_all(self.HISTORY_BTN)
        if btns:
            btns[0].click()
            self.wait_by(self.WF_TITLE)
            return self
        raise AssertionError(C.Messages.Error.NO_HISTORY_BUTTON)

    def history_click_refresh(self):
        self.wait_by(self.WF_REFRESH_BTN).click()
        return self

    def history_toggle_label(self):
        btns = self.find_all(self.WF_TOGGLE_BTN)
        if not btns:
            return ""
        return (btns[0].text or "").strip()

    def history_click_toggle(self):
        self.wait_by(self.WF_TOGGLE_BTN).click()
        return self

    def history_close(self):
        self.wait_by(self.WF_CLOSE_BTN).click()
        WebDriverWait(self.d, C.Timeouts.SHORT).until(EC.invisibility_of_element_located(self.WF_TITLE))
        return self

    def actions_modal_is_open(self):
        return bool(self.find_all(self.WF_ACTIONS_TITLE))

    def open_first_actions_modal(self):
        btns = self.find_all(self.ACTIONS_BTN)
        if btns:
            btns[0].click()
            self.wait_clickable(self.WF_ACTIONS_TITLE)
            return self
        raise AssertionError(C.Messages.Error.NO_ACTIONS_BUTTON)

    def actions_set_remarks(self, text):
        el = self.wait_by(self.WF_ACTIONS_REMARKS)
        el.clear()
        if text:
            el.send_keys(text)
        return self

    def actions_clear_remarks(self):
        self.wait_by(self.WF_ACTIONS_CLEAR_REMARKS).click()
        return self

    def actions_click_advance_to_stage(self, stage_name):
        locator = (By.NAME, f"workflow-actions-advance-{stage_name}")
        self.wait_by(locator).click()
        WebDriverWait(self.d, C.Timeouts.QUICK).until(
            EC.invisibility_of_element_located(self.WF_ACTIONS_TITLE)
        )
        return self

    def actions_has_stage_button(self, stage_name):
        locator = (By.NAME, f"workflow-actions-advance-{stage_name}")
        return bool(self.find_all(locator))

    def actions_close(self):
        self.wait_by(self.WF_ACTIONS_CLOSE_BTN).click()
        WebDriverWait(self.d, C.Timeouts.SHORT).until(EC.invisibility_of_element_located(self.WF_ACTIONS_TITLE))
        return self

    def change_status_via_select(self, row_index, new_status):
        selects = self.find_all(self.STATUS_SELECT)
        if selects and row_index < len(selects):
            Select(selects[row_index]).select_by_visible_text(new_status.capitalize())
            self.wait_loading_cycle()
            return self
        raise AssertionError(C.Messages.Error.STATUS_SELECT_NOT_FOUND.format(row_index))

    def count_advance_buttons(self, button_prefix):
        buttons = self.d.find_elements(By.CSS_SELECTOR, f"button[name^='{button_prefix}']")
        return len(buttons)

    def wait_for_modal_close(self, locator, timeout=C.Timeouts.EXTENDED):
        try:
            WebDriverWait(self.d, timeout).until(EC.invisibility_of_element_located(locator))
            return True
        except:
            return False
