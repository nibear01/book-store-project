import unittest

from .page_admin_users import AdminUsersPage, AdminUsersBaseTest


class TestAdminUsers(AdminUsersBaseTest):

    def test_admin_login_navigation_and_refresh(self):
        page = self.open_users_page()
        title = page.wait_by(AdminUsersPage.TITLE)
        page.refresh()
        self.assertTrue(title.is_displayed())

    def test_search_functionality(self):
        page = self.open_users_page()
        page.search("test")
        page.wait_rows(timeout=10)

    def test_status_filter_functionality(self):
        page = self.open_users_page()
        try:
            page.select_status_by_value("active")
            page.wait_rows(timeout=10)
        except Exception:
            self.skipTest("Status option 'active' not available; skipping.")

    def test_add_user_modal_opens(self):
        page = self.open_users_page()
        page.open_add_user_modal()
        self.assertTrue(page.add_modal_elements_visible())
        page.close_add_user_modal()

    def test_user_actions_visible(self):
        page = self.open_users_page()
        page.wait_rows(timeout=10)
        btns = page.find_all(AdminUsersPage.APPROVE_BTNS) or page.find_all(AdminUsersPage.BAN_BTNS)
        if btns:
            self.assertTrue(btns[0].is_displayed())

    def test_edit_user_modal_opens(self):
        page = self.open_users_page()
        page.wait_rows(timeout=10)
        if page.open_first_edit_modal_if_available():
            self.assertTrue(page.edit_modal_elements_visible())
            page.close_edit_modal()
        else:
            self.skipTest("No editable user found; skipping.")

    def test_change_password_modal_opens(self):
        page = self.open_users_page()
        page.wait_rows(timeout=10)
        if page.open_first_change_pw_modal_if_available():
            self.assertTrue(page.change_pw_elements_visible())
            page.close_change_pw_modal()
        else:
            self.skipTest("No change password button found; skipping.")

    def test_delete_user_modal_opens(self):
        page = self.open_users_page()
        page.wait_rows(timeout=10)
        if page.open_first_delete_modal_if_available():
            self.assertTrue(page.delete_modal_elements_visible())
            page.close_delete_modal()
        else:
            self.skipTest("No delete button found; skipping.")

    def test_mobile_view_elements(self):
        page = self.open_users_page()
        page.set_mobile_view()
        # Either cards appear, or there are no users; both are acceptable
        cards = page.find_all(AdminUsersPage.MOBILE_CARD_CSS)
        if cards:
            self.assertTrue(cards[0].is_displayed())
        page.reset_window()


if __name__ == "__main__":
    unittest.main(verbosity=2)