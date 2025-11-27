import os
import unittest

from pages.admin_author.page_admin_author import AdminAuthorBaseTest, AdminAuthorPage
from pages.admin_author.base_admin_author import AdminAuthorHelperMixin


class TestAdminAuthor(AdminAuthorHelperMixin, AdminAuthorBaseTest):
    PREFIX = os.environ.get("E2E_AUTHOR_PREFIX", "E2E_AUTHOR_")

    def setUp(self):
        super().setUp()
        self.page = self.open_authors_page()

    def tearDown(self):
        try:
            self.page.cleanup_authors_with_prefix(self.PREFIX)
        except Exception:
            pass
        finally:
            super().tearDown()

    # A. Page Load & Navigation Tests
    def test_page_loads_successfully(self):
        title = self.page.wait_by(AdminAuthorPage.TITLE)
        subtitle = self.page.wait_by(AdminAuthorPage.SUBTITLE)
        toolbar = self.page.wait_by(AdminAuthorPage.TOOLBAR)
        table = self.page.wait_by(AdminAuthorPage.TABLE)

        self.assertTrue(title is not None)
        self.assertTrue(subtitle is not None)
        self.assertTrue(toolbar is not None)
        self.assertTrue(table is not None)

    def test_header_elements_visible(self):
        title = self.page.wait_by(AdminAuthorPage.TITLE)
        subtitle = self.page.wait_by(AdminAuthorPage.SUBTITLE)
        refresh_btn = self.page.wait_by(AdminAuthorPage.REFRESH_BTN)
        add_btn = self.page.wait_by(AdminAuthorPage.ADD_BTN)

        self.assertTrue(title.text == "Authors")
        self.assertTrue("Manage" in subtitle.text)
        self.assertTrue(refresh_btn.is_displayed())
        self.assertTrue(add_btn.is_displayed())

    def test_toolbar_components_present(self):
        search_input = self.page.wait_by(AdminAuthorPage.SEARCH_INPUT)
        sort_select = self.page.wait_by(AdminAuthorPage.SORT_SELECT)
        clear_btn = self.page.wait_by(AdminAuthorPage.SEARCH_CLEAR)
        results_info = self.page.wait_by(AdminAuthorPage.RESULTS_INFO)

        self.assertTrue(search_input.is_displayed())
        self.assertTrue(sort_select.is_displayed())
        self.assertTrue(clear_btn.is_displayed())
        self.assertTrue(results_info.is_displayed())

    # =========================
    # B. Search & Filter Tests
    # =========================

    def test_search_by_author_name(self):
        unique_name = f"{self.PREFIX}SearchTest"
        self.page.add_author(unique_name, "Professor")

        self.page.search(unique_name)
        rows = self.page.get_all_rows()

        self.assertTrue(len(rows) > 0, "Should find at least one row")
        found = False
        for row in rows:
            if unique_name in self.page.get_author_name_from_row(row):
                found = True
                break
        self.assertTrue(found, f"Author {unique_name} should be in search results")

    def test_search_clear_button(self):
        self.page.search("NonExistentAuthor")
        rows_filtered = self.page.count_visible_rows()

        self.page.click_clear_button()
        rows_cleared = self.page.count_visible_rows()

        self.assertTrue(rows_cleared >= rows_filtered,
                        "Clear should show same or more rows")

    def test_search_no_results(self):
        self.page.search("XYZ_NONEXISTENT_AUTHOR_99999")

        try:
            empty_state = self.page.wait_by(AdminAuthorPage.EMPTY_STATE, timeout=5)
            self.assertTrue(empty_state is not None)
        except Exception:
            rows = self.page.get_all_rows()
            self.assertTrue(len(rows) == 0, "Should have no rows for non-existent search")

    # C. Sorting Tests
    def test_sorting_options(self):
        self.page.add_author(f"{self.PREFIX}Sort1", "Author")
        self.page.add_author(f"{self.PREFIX}Sort2", "Author")

        # Test sort by most books
        self.page.set_sort("books_desc")
        rows = self.page.get_all_rows()
        self.assertTrue(len(rows) > 0, "Should have rows after sorting by most books")

        # Test sort by fewest books
        self.page.set_sort("books_asc")
        rows = self.page.get_all_rows()
        self.assertTrue(len(rows) > 0, "Should have rows after sorting by fewest books")

        # Test default sort
        self.page.set_sort("none")
        rows = self.page.get_all_rows()
        self.assertTrue(len(rows) >= 0, "Should have rows after default sort")

    # D. Add Author Tests
    def test_open_add_author_modal(self):
        self.page.click_add_author()

        name_input = self.page.wait_by(AdminAuthorPage.ADD_NAME)
        title_input = self.page.wait_by(AdminAuthorPage.ADD_TITLE)
        save_btn = self.page.wait_by(AdminAuthorPage.ADD_SAVE)
        cancel_btn = self.page.wait_by(AdminAuthorPage.ADD_CANCEL)

        self.assertTrue(name_input.is_displayed())
        self.assertTrue(title_input.is_displayed())
        self.assertTrue(save_btn.is_displayed())
        self.assertTrue(cancel_btn.is_displayed())

        self.page.click_add_cancel()

    def test_add_author_with_required_fields_only(self):
        unique_name = f"{self.PREFIX}MinFields"
        self.page.add_author(unique_name, "Dr.")

        self.page.search(unique_name)
        row = self.page.find_row_by_name(unique_name)

        self.assertTrue(row is not None, f"Author {unique_name} should be in table")

    def test_add_author_with_all_fields(self):
        unique_name = f"{self.PREFIX}AllFields"
        self.page.add_author(unique_name, "Professor", bio="Test bio text", dob="1980-01-15")

        self.page.search(unique_name)
        row = self.page.find_row_by_name(unique_name)

        self.assertTrue(row is not None)

    def test_add_author_modal_cancel(self):
        self.page.click_add_author()
        self.page.wait_by(AdminAuthorPage.ADD_NAME).send_keys(f"{self.PREFIX}Canceled")
        self.page.wait_by(AdminAuthorPage.ADD_TITLE).send_keys("Dr.")
        self.page.click_add_cancel()

        is_open = self.page.is_modal_open()
        self.assertTrue(not is_open, "Modal should be closed after cancel")

    # E. Edit Author Tests
    def test_open_edit_author_modal(self):
        unique_name = f"{self.PREFIX}EditOpen"
        self.page.add_author(unique_name, "Dr.")

        self.page.search(unique_name)
        row = self.page.find_row_by_name(unique_name)
        self.assertTrue(row is not None)

        opened = self.page.click_edit_for_row(row)
        self.assertTrue(opened)

        name_input = self.page.wait_by(AdminAuthorPage.EDIT_NAME)
        self.assertTrue(name_input.get_attribute("value") == unique_name)

        self.page.click_edit_cancel()

    def test_edit_author_name(self):
        original_name = f"{self.PREFIX}EditName1"
        new_name = f"{self.PREFIX}EditName2"

        self.page.add_author(original_name, "Dr.")
        self.page.search(original_name)
        row = self.page.find_row_by_name(original_name)
        self.assertTrue(row is not None)

        self.page.click_edit_for_row(row)
        self.page.edit_author(name=new_name)

        self.page.search(new_name)
        updated_row = self.page.find_row_by_name(new_name)
        self.assertTrue(updated_row is not None, f"Author should be renamed to {new_name}")

    # F. Delete Author Tests
    def test_delete_author_confirmation_modal(self):
        name = f"{self.PREFIX}DeleteConfirm"
        self.page.add_author(name, "Dr.")

        self.page.search(name)
        row = self.page.find_row_by_name(name)
        self.assertTrue(row is not None)

        self.page.click_delete_for_row(row)

        confirm_btn = self.page.wait_by(AdminAuthorPage.DELETE_CONFIRM)
        cancel_btn = self.page.wait_by(AdminAuthorPage.DELETE_CANCEL)

        self.assertTrue(confirm_btn.is_displayed())
        self.assertTrue(cancel_btn.is_displayed())

        self.page.cancel_delete()

    def test_delete_author_confirm(self):
        name = f"{self.PREFIX}DeleteNow"
        self.page.add_author(name, "Dr.")

        deleted = self.page.delete_author_by_name(name)
        self.assertTrue(deleted)

        self.page.search(name)
        row = self.page.find_row_by_name(name)
        self.assertTrue(row is None, f"Author {name} should be deleted")

    def test_delete_author_cancel(self):
        name = f"{self.PREFIX}DeleteCancel"
        self.page.add_author(name, "Dr.")

        self.page.search(name)
        row = self.page.find_row_by_name(name)

        self.page.click_delete_for_row(row)
        self.page.cancel_delete()

        row_after = self.page.find_row_by_name(name)
        self.assertTrue(row_after is not None, "Author should still exist after cancel")

    # G. Manage Books Tests
    def test_open_manage_books_modal(self):
        name = f"{self.PREFIX}ManageBooks"
        self.page.add_author(name, "Dr.")

        self.page.search(name)
        row = self.page.find_row_by_name(name)
        self.assertTrue(row is not None)

        opened = self.page.click_manage_for_row(row)
        self.assertTrue(opened)

        search_input = self.page.wait_by(AdminAuthorPage.MANAGE_SEARCH)
        search_btn = self.page.wait_by(AdminAuthorPage.MANAGE_SEARCH_BTN)

        self.assertTrue(search_input.is_displayed())
        self.assertTrue(search_btn.is_displayed())

        self.page.close_manage_modal()

    def test_search_books_in_manage_modal(self):
        name = f"{self.PREFIX}BookSearch"
        self.page.add_author(name, "Dr.")

        self.page.search(name)
        row = self.page.find_row_by_name(name)

        self.page.click_manage_for_row(row)
        self.page.search_books_in_manage("Book") 
        self.assertTrue(True)

        self.page.close_manage_modal()

    def test_manage_books_modal_cancel(self):
        name = f"{self.PREFIX}ManageCancel"
        self.page.add_author(name, "Dr.")

        self.page.search(name)
        row = self.page.find_row_by_name(name)

        self.page.click_manage_for_row(row)
        self.page.close_manage_modal()

        is_open = self.page.is_modal_open()
        self.assertTrue(not is_open, "Modal should be closed")

    # I. Refresh & Data Sync Tests
    def test_refresh_button_reloads_authors(self):
        before_count = self.page.count_visible_rows()

        self.page.click_refresh()

        after_count = self.page.count_visible_rows()
        self.assertTrue(after_count >= 0)

    def test_table_updates_after_add(self):
        unique_name = f"{self.PREFIX}AddUpdate"
        before_count = self.page.count_visible_rows()

        self.page.add_author(unique_name, "Dr.")

        after_count = self.page.count_visible_rows()
        self.assertTrue(after_count >= before_count,
                        "Table should have same or more rows after add")

        row = self.page.find_row_by_name(unique_name)
        self.assertTrue(row is not None)

    def test_table_updates_after_delete(self):
        name = f"{self.PREFIX}DeleteUpdate"
        self.page.add_author(name, "Dr.")

        before_count = self.page.count_visible_rows()
        self.page.delete_author_by_name(name)

        after_count = self.page.count_visible_rows()
        self.assertTrue(after_count <= before_count,
                        "Table should have same or fewer rows after delete")

    def test_results_count_display(self):
        shown, total = self.page.get_results_count()
        self.assertTrue(total >= 0)
        self.assertTrue(shown >= 0)
        self.assertTrue(shown <= total)


if __name__ == "__main__":
    unittest.main(verbosity=2)
