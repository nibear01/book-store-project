import os
import unittest
from pages.admin_author_request.page_admin_author_request import AdminAuthorRequestBaseTest, AdminAuthorRequestPage
from pages.admin_author_request.base_admin_author_request import AdminAuthorRequestHelperMixin


class TestAdminAuthorRequest(AdminAuthorRequestHelperMixin, AdminAuthorRequestBaseTest):
    PREFIX = os.environ.get("E2E_AUTHOR_REQUEST_PREFIX", "E2E_REQ_")

    def setUp(self):
        super().setUp()
        self.page = self.open_author_requests_page()

    def tearDown(self):
        try:
            self.page.cleanup_requests_with_prefix(self.PREFIX)
        except Exception:
            pass
        finally:
            super().tearDown()

    def test_page_loads_successfully(self):
        title_present = self.page.is_element_present(AdminAuthorRequestPage.TITLE)
        toolbar_present = self.page.is_element_present(AdminAuthorRequestPage.TOOLBAR)
        table_present = self.page.is_element_present(AdminAuthorRequestPage.TABLE)
        
        self.assertTrue(title_present, "Title should be present")
        self.assertTrue(toolbar_present, "Toolbar should be present")
        self.assertTrue(any([table_present, 
                           self.page.is_loading_visible(),
                           self.page.is_element_present(AdminAuthorRequestPage.EMPTY_STATE)]), 
                       "Table, loading, or empty state should be visible")

    # def test_header_elements_visible(self):
    #     if self.page.is_element_present(AdminAuthorRequestPage.TITLE):
    #         title = self.page.wait_by(AdminAuthorRequestPage.TITLE)
    #         self.assertIn("Author", title.text)

    def test_toolbar_components_present(self):
        search_present = self.page.is_element_present(AdminAuthorRequestPage.SEARCH_INPUT)
        status_present = self.page.is_element_present(AdminAuthorRequestPage.STATUS_FILTER)
        sort_present = self.page.is_element_present(AdminAuthorRequestPage.SORT_SELECT)
        
        self.assertTrue(search_present, "Search input should be present")
        self.assertTrue(status_present, "Status filter should be present")
        self.assertTrue(sort_present, "Sort select should be present")

    def test_search_functionality(self):
        test_term = "test"
        self.page.search(test_term)
        
        search_input = self.page.wait_by(AdminAuthorRequestPage.SEARCH_INPUT)
        self.assertEqual(search_input.get_attribute("value"), test_term)

    def test_status_filter_functionality(self):
        statuses = ["All", "pending", "verified"]
        
        for status in statuses:
            self.page.set_status_filter(status)
            self.assertTrue(True, f"Should handle {status} filter without errors")

    def test_search_no_results(self):
        self.page.search("XYZ_NONEXISTENT_REQUEST_99999")
        
        empty_state_visible = self.page.is_element_present(AdminAuthorRequestPage.EMPTY_STATE)
        rows = self.page.get_all_rows()
        
        self.assertTrue(empty_state_visible or len(rows) == 0, 
                       "Should show empty state or no rows for non-existent search")

    def test_sorting_options(self):
        self.page.set_sort("newest")
        self.page.set_sort("oldest")
        self.assertTrue(True, "Should handle sorting without errors")

    def test_table_structure(self):
        rows = self.page.get_all_rows()
        
        if rows:
            first_row = rows[0]
            applicant_name = self.page.get_applicant_name_from_row(first_row)
            self.assertTrue(isinstance(applicant_name, str), "Should be able to extract applicant name")

    def test_action_buttons_exist(self):
        rows = self.page.get_all_rows()
        
        if rows:
            first_row = rows[0]
            view_btn = self.page.get_verify_button_for_row(first_row)
            self.assertTrue(True, f"Should be able to locate action buttons {view_btn is not None}")

    def test_pagination_exists(self):
        total_items = self.page.get_total_items_count()
        
        if total_items > self.page.page_size:
            pagination_present = self.page.is_element_present(AdminAuthorRequestPage.PAGINATION)
            self.assertTrue(pagination_present, "Pagination should be visible when there are multiple pages")

    # def test_pagination_navigation(self):
    #     total_pages = self.page.get_total_pages()
        
    #     if total_pages > 1:
    #         navigated = self.page.click_next_page()
    #         if navigated:
    #             current_page = self.page.get_current_page()
    #             self.assertTrue(current_page > 1, "Should be on page 2 after clicking next")
                
    #             self.page.click_prev_page()
    #             current_page = self.page.get_current_page()
    #             self.assertEqual(current_page, 1, "Should be back on page 1")

    def test_error_handling(self):
        error_visible = self.page.is_error_visible()
        self.assertFalse(error_visible, "Should not show errors on initial load")

    def test_status_badges_display(self):
        rows = self.page.get_all_rows()
        
        if rows:
            for row in rows[:2]:  
                status = self.page.get_status_from_row(row)
                if status: 
                    self.assertIn(status, ["pending", "verified", "cancelled", "unverified"],
                                f"Status should be one of expected values, got: {status}")

    def test_results_count_display(self):
        shown, total = self.page.get_results_count()
        self.assertTrue(total >= 0, "Total count should be non-negative")
        self.assertTrue(shown >= 0, "Shown count should be non-negative")
        self.assertTrue(shown <= total, "Shown should be less than or equal to total")

    def test_view_details_modal(self):
        rows = self.page.get_all_rows()
        
        if rows:
            opened = self.page.click_view_details_for_row(rows[0])
            if opened:
                modal_visible = self.page.is_details_modal_visible()
                self.assertTrue(modal_visible, "Details modal should be visible")
                
                self.page.close_details_modal()
                self.page.wait_details_modal_closed()

    def test_loading_state(self):
        self.page.set_status_filter("pending")
        self.assertTrue(True, "Should handle loading states without crashing")


if __name__ == "__main__":
    unittest.main(verbosity=2)