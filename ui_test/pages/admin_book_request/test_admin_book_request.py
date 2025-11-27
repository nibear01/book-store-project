import unittest

import pytest
from pages.admin_book_request.page_admin_book_request import AdminBookRequestBaseTest, AdminBookRequestPage
from pages.admin_book_request.base_admin_book_request import AdminBookRequestHelperMixin


class TestAdminBookRequest(AdminBookRequestHelperMixin, AdminBookRequestBaseTest):

    def setUp(self):
        super().setUp()
        self.page = self.open_book_requests_page()

    def tearDown(self):
        super().tearDown()

    @pytest.mark.sanity
    def test_page_loads_successfully(self):
        current_url = self.driver.current_url
        self.assertIn("/admin/book-requests", current_url)
        search_present = self.page.is_element_present(AdminBookRequestPage.SEARCH_INPUT)
        title_present = self.page.is_element_present(AdminBookRequestPage.TITLE)
        self.assertTrue(search_present, "Search input should be present")
        self.assertTrue(title_present, "Page title should be present")

    def test_page_loads_successfully(self):
        title_present = self.page.is_element_present(AdminBookRequestPage.TITLE)
        toolbar_present = self.page.is_element_present(AdminBookRequestPage.TOOLBAR)
        self.assertTrue(title_present)
        self.assertTrue(toolbar_present)

    def test_page_has_correct_title(self):
        title_element = self.page.wait_by(AdminBookRequestPage.TITLE)
        self.assertIn("Book Requests", title_element.text)

    def test_toolbar_components_present(self):
        search_present = self.page.is_element_present(AdminBookRequestPage.SEARCH_INPUT)
        status_present = self.page.is_element_present(AdminBookRequestPage.STATUS_FILTER)
        sort_present = self.page.is_element_present(AdminBookRequestPage.SORT_SELECT)
        self.assertTrue(search_present)
        self.assertTrue(status_present)
        self.assertTrue(sort_present)

    def test_search_functionality(self):
        self.page.search("test search")
        search_value = self.page.get_search_value()
        self.assertEqual(search_value, "test search")

    def test_status_filter_functionality(self):
        self.page.set_status_filter("pending")
        current_filter = self.page.get_status_filter_value()
        self.assertEqual(current_filter, "pending")

    def test_sort_order_functionality(self):
        self.page.set_sort_order("oldest")
        current_sort = self.page.get_sort_order_value()
        self.assertEqual(current_sort, "oldest")

    def test_table_has_correct_columns(self):
        headers = self.page.get_table_headers()
        expected_headers = ["Requester", "Contact", "Book", "Status", "Requested", "Actions"]
        for header in expected_headers:
            self.assertIn(header, headers)

    def test_request_rows_display_correct_data(self):
        rows_count = len(self.page.get_all_rows())
        if rows_count > 0:
            requester_name = self.page.get_first_requester_name()
            requester_email = self.page.get_first_requester_email()
            book_title = self.page.get_first_book_title()
            self.assertTrue(len(requester_name) > 0)
            self.assertTrue(len(requester_email) > 0)
            self.assertTrue(len(book_title) > 0)

    def test_status_badges_show_valid_statuses(self):
        rows_count = len(self.page.get_all_rows())
        if rows_count > 0:
            status = self.page.get_first_request_status()
            self.assertIn(status, ["pending", "approved", "rejected", "fulfilled"])

    def test_action_buttons_present_in_rows(self):
        rows_count = len(self.page.get_all_rows())
        if rows_count > 0:
            view_visible = self.page.is_element_present(AdminBookRequestPage.VIEW_BTNS)
            self.assertTrue(view_visible)

    def test_view_details_modal_opens_and_closes(self):
        rows_count = len(self.page.get_all_rows())
        if rows_count > 0:
            self.page.click_first_view_details()
            modal_visible = self.page.is_details_modal_visible()
            self.assertTrue(modal_visible)
            self.page.close_details_modal()

    def test_modal_displays_correct_request_details(self):
        rows_count = len(self.page.get_all_rows())
        if rows_count > 0:
            self.page.click_first_view_details()
            modal_name = self.page.get_modal_name()
            modal_email = self.page.get_modal_email()
            modal_title = self.page.get_modal_title()
            self.assertTrue(len(modal_name) > 0)
            self.assertTrue(len(modal_email) > 0)
            self.assertTrue(len(modal_title) > 0)
            self.page.close_details_modal()

    def test_pagination_navigation_works(self):
        total_pages = self.page.get_total_pages()
        if total_pages > 1:
            self.page.click_next_page()
            current_page = self.page.get_current_page()
            self.assertTrue(current_page > 1)
            self.page.click_prev_page()

    def test_pagination_buttons_state(self):
        current_page = self.page.get_current_page()
        total_pages = self.page.get_total_pages()
        if current_page == 1:
            self.assertTrue(self.page.is_prev_button_disabled())
        if current_page == total_pages:
            self.assertTrue(self.page.is_next_button_disabled())

    def test_results_count_display(self):
        shown, total = self.page.get_results_count()
        self.assertTrue(total >= 0)
        self.assertTrue(shown >= 0)
        self.assertTrue(shown <= total)

    def test_no_errors_on_initial_load(self):
        loading_visible = self.page.is_loading_visible()
        self.assertFalse(loading_visible)

    def test_loading_state_transitions(self):
        self.page.set_status_filter("approved")
        self.page.wait_loading_complete()
        loading_visible = self.page.is_loading_visible()
        self.assertFalse(loading_visible)


if __name__ == "__main__":
    unittest.main(verbosity=2)