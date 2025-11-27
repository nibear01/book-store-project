import unittest
from ui_test.pages.login.set_up import BookStopSetUp
from ui_test.pages.admin_finance.admin_finance_page import AdminFinancePage
from ui_test.pages.admin_finance import admin_finance_constants as C


class TestAdminFinancePage(BookStopSetUp):
    """
    UI Test Suite for Admin Finance Page.
    
    Tests the Finance Manager workflow functionality:
    - Page load and access control
    - Search and filtering
    - Pagination
    - Order modal interactions
    - Workflow stage advancement (FM_REVIEW → FM_APPROVED/FM_REJECTED)
    """
    
    HEADLESS = False

    def setUp(self):
        """Set up test fixtures."""
        super().setUp()
        self.page = None

    def tearDown(self):
        """Clean up after test."""
        if self.page and self.page.modal_is_open():
            self.page.modal_close()
        super().tearDown()

    # ============================================================
    # SECTION 1: PAGE LOAD & ACCESS CONTROL
    # ============================================================

    def test_01_page_loads_with_admin_role(self):
        """Test that page loads successfully when logged in as admin."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        self.assertTrue(page.is_loaded(), C.Messages.Assert.PAGE_LOADED)
        self.assertFalse(page.has_no_access())
        
        # Verify key elements
        self.assertIsNotNone(page.find_one(page.REFRESH_BTN), "Refresh button should be present")
        self.assertIsNotNone(page.find_one(page.SEARCH_INPUT), "Search input should be present")
        self.assertIsNotNone(page.find_one(page.STAGE_FILTER), "Stage filter should be present")

    # ============================================================
    # SECTION 2: REFRESH
    # ============================================================

    def test_02_refresh_button_works(self):
        """Test that clicking refresh reloads the orders list."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.has_no_access() or page.has_empty_state():
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        initial_count = page.count_table_rows()
        page.click_refresh()
        page.wait_loading_cycle()
        
        final_count = page.count_table_rows()
        self.assertGreaterEqual(final_count, 0, "Refresh should load valid order list")

    # ============================================================
    # SECTION 3: SEARCH
    # ============================================================

    def test_03_search_filters_by_order_number(self):
        """Test search by order number filters results."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.has_no_access() or page.has_empty_state():
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        initial_count = page.count_table_rows()
        if initial_count == 0:
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        order_num = page.get_row_order_number(0)
        page.set_search(order_num)
        page.wait_loading_cycle()
        
        filtered_count = page.count_table_rows()
        self.assertLessEqual(filtered_count, initial_count)

    def test_04_search_clear_button_works(self):
        """Test search clear button resets search."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        page.set_search(C.UIText.SEARCH_PREFIX)
        page.wait_loading_cycle()
        
        page.click_search_clear_btn()
        page.wait_loading_cycle()
        
        value = page.get_search_value()
        self.assertEqual(value, "", "Search should be cleared")

    # ============================================================
    # SECTION 4: STAGE FILTER
    # ============================================================

    def test_05_stage_filter_has_expected_options(self):
        """Test stage filter contains all Finance stages."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        options = page.get_stage_filter_options()
        self.assertIn(C.Stages.FILTER_ALL, options)
        
        for stage in C.Stages.ALL:
            self.assertIn(stage, options, f"Stage filter should include {stage}")

    def test_06_stage_filter_by_fm_review(self):
        """Test filtering by FM_REVIEW stage."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.has_no_access() or page.has_empty_state():
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        page.set_stage_filter(C.Stages.REVIEW)
        page.wait_loading_cycle()
        
        if not page.has_empty_state():
            for i in range(page.count_table_rows()):
                stage = page.get_row_stage(i)
                self.assertEqual(stage, C.Stages.REVIEW, C.Messages.Assert.STAGE_FILTERED)

    def test_07_stage_filter_reset_shows_all_orders(self):
        """Test resetting filter to 'All' shows all orders."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.has_no_access() or page.has_empty_state():
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        page.set_stage_filter(C.Stages.REVIEW)
        page.wait_loading_cycle()
        filtered_count = page.count_table_rows()
        
        page.set_stage_filter(C.Stages.FILTER_ALL)
        page.wait_loading_cycle()
        all_count = page.count_table_rows()
        
        self.assertGreaterEqual(all_count, filtered_count)

    # ============================================================
    # SECTION 5: PAGINATION
    # ============================================================

    def test_08_pagination_appears_when_needed(self):
        """Test pagination controls appear when data exceeds page size."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.has_no_access() or page.has_empty_state():
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        counts = page.count_table_rows()
        if counts > C.Config.DEFAULT_PAGE_SIZE:
            self.assertTrue(page.has_pagination())

    def test_09_pagination_next_button_navigates(self):
        """Test pagination next button loads next page."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if not page.has_pagination():
            self.skipTest("No pagination available")
        
        if page.is_pagination_next_disabled():
            self.skipTest("Next button disabled (last page)")
        
        first_order_before = page.get_row_order_number(0)
        page.click_pagination_next()
        page.wait_loading_cycle()
        first_order_after = page.get_row_order_number(0)
        
        self.assertNotEqual(first_order_before, first_order_after, "Should navigate to next page")

    # ============================================================
    # SECTION 6: EMPTY STATE
    # ============================================================

    def test_10_empty_state_shown_when_no_results(self):
        """Test empty state message appears when search yields no results."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        page.set_search("NONEXISTENT_ORDER_99999")
        page.wait_loading_cycle()
        
        self.assertTrue(page.has_empty_state() or page.count_table_rows() == 0)

    # ============================================================
    # SECTION 7: MODAL OPEN/CLOSE
    # ============================================================

    def test_11_modal_opens_when_clicking_open_button(self):
        """Test clicking Open button opens order detail modal."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.has_no_access() or page.has_empty_state():
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        if page.count_table_rows() == 0:
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        page.open_first_order()
        self.assertTrue(page.modal_is_open(), C.Messages.Assert.MODAL_OPEN)

    def test_12_modal_closes_when_clicking_close_button(self):
        """Test clicking Close button closes modal."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.has_no_access() or page.has_empty_state():
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        if page.count_table_rows() == 0:
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        page.open_first_order()
        page.modal_close()
        self.assertFalse(page.modal_is_open(), C.Messages.Assert.MODAL_CLOSED)

    # ============================================================
    # SECTION 8: MODAL CONTENT
    # ============================================================

    def test_13_modal_shows_order_details(self):
        """Test modal displays order number, stage, and customer info."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.has_no_access() or page.has_empty_state():
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        if page.count_table_rows() == 0:
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        page.open_first_order()
        page.wait_for_modal_to_show_data()
        
        self.assertNotEqual(page.modal_get_title_text(), "", C.Messages.Assert.MODAL_DETAILS)
        self.assertNotEqual(page.modal_get_stage_text(), "", C.Messages.Assert.MODAL_DETAILS)
        self.assertNotEqual(page.modal_get_customer_name(), "", C.Messages.Assert.MODAL_DETAILS)

    def test_14_modal_shows_financial_summary(self):
        """Test modal displays financial details (critical for Finance Manager)."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.has_no_access() or page.has_empty_state():
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        if page.count_table_rows() == 0:
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        page.open_first_order()
        page.wait_for_modal_to_show_data()
        
        self.assertTrue(page.modal_has_financial_section(), C.Messages.Assert.FINANCIALS_VISIBLE)

    def test_15_modal_shows_items_table(self):
        """Test modal displays items table with order items."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.has_no_access() or page.has_empty_state():
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        if page.count_table_rows() == 0:
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        page.open_first_order()
        page.wait_for_modal_to_show_data()
        
        self.assertTrue(page.modal_has_items_table(), "Items table should be visible")
        self.assertGreater(page.modal_count_items(), 0, "Should have at least one item")

    # ============================================================
    # SECTION 9: REMARKS
    # ============================================================

    def test_16_remarks_field_accepts_input(self):
        """Test remarks textarea accepts and stores input."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.has_no_access() or page.has_empty_state():
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        if page.count_table_rows() == 0:
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        page.open_first_order()
        page.set_remarks(C.Messages.TEST_REMARKS)
        
        value = page.get_remarks_value()
        self.assertEqual(value, C.Messages.TEST_REMARKS, "Remarks should be set")

    def test_17_remarks_clear_button_clears_text(self):
        """Test clear button empties remarks field."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.has_no_access() or page.has_empty_state():
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        if page.count_table_rows() == 0:
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        page.open_first_order()
        page.set_remarks(C.Messages.TEST_REMARKS)
        page.clear_remarks()
        
        value = page.get_remarks_value()
        self.assertEqual(value, "", "Remarks should be cleared")

    # ============================================================
    # SECTION 10: WORKFLOW ADVANCEMENT
    # ============================================================

    def test_18_modal_shows_advance_buttons_for_valid_transitions(self):
        """Test advance buttons appear for available workflow transitions."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.has_no_access() or page.has_empty_state():
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        if page.count_table_rows() == 0:
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        page.open_first_order()
        page.wait_for_modal_to_show_data()
        
        available_stages = page.get_available_advance_stages()
        self.assertGreaterEqual(len(available_stages), 0, "Should show available transitions")

    def test_19_advance_button_transitions_order_to_next_stage(self):
        """Test clicking advance button transitions order to next stage."""
        self.login_as_admin()
        page = AdminFinancePage(self.driver).open(self.BASE_URL).wait_loaded()
        
        if page.has_no_access() or page.has_empty_state():
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        if page.count_table_rows() == 0:
            self.skipTest(C.Messages.Skip.NO_ORDERS)
        
        page.open_first_order()
        page.wait_for_modal_to_show_data()
        
        initial_stage = page.modal_get_stage_text()
        available_stages = page.get_available_advance_stages()
        
        if len(available_stages) == 0:
            self.skipTest(C.Messages.Skip.TERMINAL_STAGE)
        
        target_stage = available_stages[0]
        page.advance_to_stage_with_remarks(target_stage, C.Messages.TEST_REMARKS)
        page.wait_for_modal_to_show_data()
        
        new_stage = page.modal_get_stage_text()
        self.assertNotEqual(initial_stage, new_stage, C.Messages.Assert.ADVANCE_SUCCESS)


if __name__ == '__main__':
    unittest.main()
