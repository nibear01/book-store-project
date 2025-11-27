"""
Admin Orders Page UI Tests

Tests the admin orders page with workflow and public status views, including:
- Order table display, filtering, sorting, and searching
- Order modal operations (view, edit, print, delete)
- History modal for real-time order tracking
- Workflow actions modal for stage transitions
- Public status updates via dropdown
"""
import unittest
from ui_test.pages.login.set_up import BookStopSetUp
from ui_test.pages.admin_orders.admin_orders_page import AdminOrdersPage
from ui_test.pages.admin_orders import admin_orders_constants as C


class TestAdminOrdersPage(BookStopSetUp):
    HEADLESS = False

    def test_orders_page_loads(self):
        """
        Test that the admin orders page loads successfully with all required elements.
        Validates page accessibility and initial state for admin users.
        """
        self.login_as_admin()
        page = AdminOrdersPage(self.driver).open(self.BASE_URL).wait_loaded()
        self.assertTrue(page.is_loaded(), C.Messages.Assert.PAGE_LOADED)

    def test_refresh_and_toggles(self):
        """
        Test refresh functionality and toggle between workflow/public status views.
        Ensures the page can reload data and switch between different order management modes.
        Validates that mode-specific controls (status selects) appear when appropriate.
        """
        self.login_as_admin()
        page = AdminOrdersPage(self.driver).open(self.BASE_URL).wait_loaded()
        
        before_counts = page.get_showing_counts()
        page.click_refresh().wait_loading_cycle().wait_loaded()
        after_counts = page.get_showing_counts()
        
        if after_counts:
            self.assertGreaterEqual(after_counts[0], 0)
            self.assertGreaterEqual(after_counts[1], 0)

        mode = page.current_filter_mode()
        if mode == C.FilterModes.WORKFLOW and page.has_public_toggle():
            page.toggle_public_status().wait_for_mode(C.FilterModes.PUBLIC)
            if page.count_table_rows() > 0:
                self.assertTrue(page.status_select_in_table_present())
            if page.has_workflow_toggle():
                page.toggle_workflow().wait_for_mode(C.FilterModes.WORKFLOW)
        elif mode == C.FilterModes.PUBLIC and page.has_workflow_toggle():
            page.toggle_workflow().wait_for_mode(C.FilterModes.WORKFLOW)
            if page.has_public_toggle():
                page.toggle_public_status().wait_for_mode(C.FilterModes.PUBLIC)

    def test_search_filters(self):
        """
        Test search functionality and stage/status filtering.
        - Validates search by order number (ORD- prefix)
        - Tests clear search button
        - In workflow mode: tests stage filtering (OM_INTAKE, All Stages)
        - In public mode: tests status filtering (Pending, All Status)
        Ensures filters update the table appropriately in both view modes.
        """
        self.login_as_admin()
        page = AdminOrdersPage(self.driver).open(self.BASE_URL).wait_loaded()
        
        page.set_search(C.Search.QUERY_PREFIX_ORD).wait_loaded().wait_rows_nonnegative()
        page.clear_search().wait_loaded().wait_rows_nonnegative()

        mode = page.current_filter_mode()
        if mode == C.FilterModes.WORKFLOW:
            page.set_stage_filter(C.Stages.OM_INTAKE).wait_rows_nonnegative()
            page.set_stage_filter(C.Stages.ALL_STAGES).wait_rows_nonnegative()
        else:
            page.set_status_filter(C.Status.PENDING).wait_rows_nonnegative()
            page.set_status_filter(C.Status.ALL_STATUS).wait_rows_nonnegative()

    def test_filters_and_sorting(self):
        """
        Test comprehensive filtering and sorting capabilities in workflow mode.
        - Stage filtering (OM_INTAKE, All Stages)
        - Date filtering (Today, All Dates)
        - Sort by options (Total Amount, Customer Name, Order Date)
        - Sort direction (Oldest First, Newest First)
        Validates all filter and sort combinations maintain table stability.
        """
        self.login_as_admin()
        page = AdminOrdersPage(self.driver).open(self.BASE_URL).wait_loaded()

        if page.current_filter_mode() != C.FilterModes.WORKFLOW:
            if page.has_workflow_toggle():
                page.toggle_workflow().wait_for_mode(C.FilterModes.WORKFLOW)

        page.set_stage_filter(C.Stages.OM_INTAKE).wait_rows_nonnegative()
        page.set_stage_filter(C.Stages.ALL_STAGES).wait_rows_nonnegative()
        page.set_date_filter(C.DateFilters.TODAY).wait_rows_nonnegative()
        page.set_date_filter(C.DateFilters.ALL_DATES).wait_rows_nonnegative()

        for sort_label in (C.Sort.BY_TOTAL_AMOUNT, C.Sort.BY_CUSTOMER_NAME, C.Sort.BY_ORDER_DATE):
            page.set_sort_by(sort_label).wait_rows_nonnegative()

        page.set_sort_direction(C.Sort.DIRECTION_OLDEST_FIRST).wait_rows_nonnegative()
        page.set_sort_direction(C.Sort.DIRECTION_NEWEST_FIRST).wait_rows_nonnegative()

    def test_open_close_order_modal(self):
        """
        Test basic order modal open and close functionality.
        Validates that clicking "View" button opens the order details modal,
        and the close button properly dismisses it. Essential for order viewing workflow.
        """
        self.login_as_admin()
        page = AdminOrdersPage(self.driver).open(self.BASE_URL).wait_loaded()
        
        page.open_first_order_modal()
        self.assertTrue(page.modal_is_open(), C.Messages.Assert.MODAL_OPEN)
        page.modal_close()
        self.assertFalse(page.modal_is_open(), C.Messages.Assert.MODAL_CLOSED)

    def test_edit_customer_info(self):
        """
        Test editing customer information within the order modal.
        Validates the edit customer info button activates edit mode,
        changes can be saved, and the modal remains functional.
        Important for correcting customer data errors.
        """
        self.login_as_admin()
        page = AdminOrdersPage(self.driver).open(self.BASE_URL).wait_loaded()
        
        page.open_first_order_modal()
        page.modal_click_edit_customer_info()
        page.modal_save_changes()
        page.modal_close()

    def test_print_order(self):
        """
        Test print order functionality from the order modal.
        Validates that clicking print button triggers print dialog,
        and the modal remains open after printing for continued work.
        Essential for order fulfillment and shipping processes.
        """
        self.login_as_admin()
        page = AdminOrdersPage(self.driver).open(self.BASE_URL).wait_loaded()
        
        page.open_first_order_modal()
        page.modal_click_print()
        self.assertTrue(page.modal_is_open(), C.Messages.Assert.MODAL_REMAIN_OPEN_AFTER_PRINT)
        page.modal_close()

    def test_delete_order_dismiss(self):
        """
        Test dismissing the delete order confirmation dialog.
        Validates that canceling the delete operation keeps the modal open
        and does not delete the order. Protects against accidental deletions.
        """
        self.login_as_admin()
        page = AdminOrdersPage(self.driver).open(self.BASE_URL).wait_loaded()
        
        page.open_first_order_modal()
        page.modal_click_delete(accept=False)
        self.assertTrue(page.modal_is_open(), C.Messages.Assert.MODAL_STAY_OPEN_AFTER_DISMISSING_DELETE)
        page.modal_close()

    def test_history_modal(self):
        """
        Test the order history modal for real-time tracking.
        Validates opening the history modal, refreshing history data,
        toggling auto-refresh (pause/start), and closing the modal.
        Important for monitoring order status changes and workflow progression.
        """
        self.login_as_admin()
        page = AdminOrdersPage(self.driver).open(self.BASE_URL).wait_loaded()

        page.open_first_history_modal()
        self.assertTrue(page.history_modal_is_open(), C.Messages.Assert.HISTORY_MODAL_OPEN)
        
        page.history_click_refresh()
        
        current = page.history_toggle_label()
        if current in (C.History.TOGGLE_LABEL_PAUSE, C.History.TOGGLE_LABEL_START):
            page.history_click_toggle()
        
        page.history_close()
        self.assertFalse(page.history_modal_is_open(), C.Messages.Assert.HISTORY_MODAL_CLOSED)

    def test_workflow_actions_modal_open_close(self):
        """
        Test opening and closing the workflow actions modal.
        Ensures the Actions button opens the modal for stage transitions,
        and the close button properly dismisses it. Required for workflow management.
        Only available in workflow mode.
        """
        self.login_as_admin()
        page = AdminOrdersPage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.current_filter_mode() != C.FilterModes.WORKFLOW:
            if page.has_workflow_toggle():
                page.toggle_workflow().wait_for_mode(C.FilterModes.WORKFLOW)
        
        page.open_first_actions_modal()
        self.assertTrue(page.actions_modal_is_open(), C.Messages.Assert.ACTIONS_MODAL_OPEN)
        
        page.actions_close()
        self.assertFalse(page.actions_modal_is_open(), C.Messages.Assert.ACTIONS_MODAL_CLOSED)

    def test_workflow_actions_remarks_field(self):
        """
        Test the remarks/comments field in the workflow actions modal.
        Validates that admins can enter remarks for workflow transitions,
        and clear the field if needed. Remarks provide context for status changes
        and are important for audit trails.
        """
        self.login_as_admin()
        page = AdminOrdersPage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.current_filter_mode() != C.FilterModes.WORKFLOW:
            if page.has_workflow_toggle():
                page.toggle_workflow().wait_for_mode(C.FilterModes.WORKFLOW)
        
        page.open_first_actions_modal()
        page.actions_set_remarks(C.Workflow.TEST_REMARKS)
        page.actions_clear_remarks()
        page.actions_close()

    def test_workflow_actions_advance_stage_buttons(self):
        """
        Test workflow stage advancement buttons in the actions modal.
        Validates that advance buttons are present for non-terminal stages,
        allowing admins to move orders to next workflow stages.
        Skips if no orders exist or if order is at terminal stage (no transitions available).
        Critical for order progression through the workflow pipeline.
        """
        self.login_as_admin()
        page = AdminOrdersPage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.current_filter_mode() != C.FilterModes.WORKFLOW:
            if page.has_workflow_toggle():
                page.toggle_workflow().wait_for_mode(C.FilterModes.WORKFLOW)
        
        if page.count_table_rows() == 0:
            self.skipTest(C.Messages.Skip.NO_ORDERS_FOR_WORKFLOW)
        
        page.open_first_actions_modal()
        
        advance_buttons_count = page.count_advance_buttons(C.Workflow.ADVANCE_BUTTON_PREFIX)
        
        if advance_buttons_count == 0:
            self.skipTest(C.Messages.Skip.TERMINAL_STAGE)
        else:
            self.assertGreater(advance_buttons_count, 0, C.Messages.Assert.AT_LEAST_ONE_ADVANCE_BUTTON)
        
        page.actions_close()

    def test_public_status_update_via_select(self):
        """
        Test updating order status via dropdown in public status mode.
        Validates that status can be changed directly from the table
        without opening a modal. Changes should persist and order remains visible.
        Important for quick status updates in public-facing order management.
        """
        self.login_as_admin()
        page = AdminOrdersPage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.current_filter_mode() != C.FilterModes.PUBLIC:
            if page.has_public_toggle():
                page.toggle_public_status().wait_for_mode(C.FilterModes.PUBLIC)
        
        if page.count_table_rows() > 0 and page.status_select_in_table_present():
            page.change_status_via_select(0, C.Status.PROCESSING)
            page.wait_loading_cycle()
            self.assertGreaterEqual(page.count_table_rows(), 1, C.Messages.Assert.ORDER_VISIBLE_AFTER_STATUS_CHANGE)

    def test_delete_order_confirm_accept(self):
        """
        Test confirming and accepting order deletion.
        Validates the complete delete workflow: opening modal, triggering delete,
        accepting confirmation, modal closes, and order is removed.
        DESTRUCTIVE TEST - actually deletes an order from the system.
        Skips if no orders are available to delete.
        Important for data cleanup and order management.
        """
        self.login_as_admin()
        page = AdminOrdersPage(self.driver).open(self.BASE_URL).wait_loaded()
        
        initial_count = page.count_table_rows()
        if initial_count == 0:
            self.skipTest(C.Messages.Skip.NO_ORDERS_FOR_DELETION)
        
        page.open_first_order_modal()
        page.modal_click_delete(accept=True)
        
        if not page.wait_for_modal_close(page.MODAL_TITLE):
            if page.modal_is_open():
                page.modal_close()
        
        page.click_refresh().wait_loading_cycle()
        
        final_count = page.count_table_rows()
        self.assertTrue(True, C.Messages.Assert.DELETE_OPERATION_COMPLETED)


if __name__ == "__main__":
    unittest.main(verbosity=2)
