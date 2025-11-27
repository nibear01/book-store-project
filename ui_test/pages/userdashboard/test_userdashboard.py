import unittest
from pages.userdashboard.page_userdashboard import UserDashboardPage
from pages.userdashboard.base_userdashboard import UserDashboardHelperMixin
from pages.login.set_up import BookStopSetUp


class TestUserDashboard(UserDashboardHelperMixin, BookStopSetUp):
    TEST_USER_EMAIL = "navedabrar80@gmail.com"

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

    def setUp(self):
        self._initialize_password_tracking()
        super().setUp()
        self.page = UserDashboardPage(self.driver, self.BASE_URL)
        self._login_with_current_password()

    def tearDown(self):
        if self.password_changed:
            self._revert_to_original_password()
        super().tearDown()

    def test_01_should_be_on_account_page_after_login(self):
        self.assert_on_account_page()

    def test_02_dashboard_loads_successfully(self):
        self.assert_element_visible(self.page.PROFILE_HEADER)
        self.assert_element_visible(self.page.ACCOUNT_OVERVIEW)

    def test_03_profile_header_displays_user_info(self):
        header_name = self.page.get_header_name()
        header_email = self.page.get_header_email()
        self.assertTrue(len(header_name) > 0)
        self.assertTrue(len(header_email) > 0)

    def test_04_account_overview_displays_user_data(self):
        displayed_email = self.page.get_overview_email()
        self.assertTrue(len(displayed_email) > 0)

    def test_05_all_tabs_are_present(self):
        self.assert_element_present(self.page.TAB_OVERVIEW)
        self.assert_element_present(self.page.TAB_PROFILE)
        self.assert_element_present(self.page.TAB_VERIFICATION)
        self.assert_element_present(self.page.TAB_SECURITY)

    def test_06_navigate_to_profile_tab(self):
        self.page.switch_to_tab('profile')
        self.assert_element_visible(self.page.PROFILE_NAME_INPUT)

    def test_07_navigate_to_verification_tab(self):
        self.page.switch_to_tab('verification')
        self.assert_element_visible(self.page.EMAIL_VERIFICATION_SECTION)

    def test_08_navigate_to_security_tab(self):
        self.page.switch_to_tab('security')
        self.assert_element_visible(self.page.SECURITY_FORM)

    def test_09_profile_save_with_valid_data(self):
        self.page.switch_to_tab('profile')
        self.page.set_profile_name("Updated Test User")
        self.page.click_save_profile_button()
        self.assert_toast_appears(self.page, "success")

    def test_10_profile_cancel_button_works(self):
        self.page.switch_to_tab('profile')
        self.page.set_profile_name("Temporary Name")
        self.page.click_cancel_profile_button()

    def test_11_security_form_fields_present(self):
        self.page.switch_to_tab('security')
        self.assert_element_visible(self.page.CURRENT_PASSWORD)
        self.assert_element_visible(self.page.NEW_PASSWORD)
        self.assert_element_visible(self.page.CONFIRM_PASSWORD)

    def test_12_password_change_incorrect_current(self):
        self.page.switch_to_tab('security')
        self.page.change_password("WrongPassword123!", "NewPass@123")
        self.assert_password_change_failed()

    def test_13_password_change_mismatch_passwords(self):
        self.page.switch_to_tab('security')
        self.page.change_password(self.current_password, "NewPass@123", "DifferentPass@123")
        self.assert_password_change_failed()

    # def test_14_password_change_successful(self):
    #     new_password = "TempPass@123"
    #     success = self._safe_password_change(new_password)
    #     self.assertTrue(success)

    # def test_15_verification_sections_present(self):
    #     self.page.switch_to_tab('verification')
    #     self.assert_element_visible(self.page.EMAIL_VERIFICATION_SECTION)
    #     self.assert_element_visible(self.page.PHONE_VERIFICATION_SECTION)

    # def test_16_profile_data_persists_after_refresh(self):
    #     current_name = self.page.get_header_name()
    #     self.page.refresh_page()
    #     refreshed_name = self.page.get_header_name()
    #     self.assertTrue(len(refreshed_name) > 0)

    # def test_17_single_password_change_with_auto_revert(self):
    #     new_password = "SingleTest@123"
    #     success = self._safe_password_change(new_password)
    #     self.assertTrue(success)

    # def test_18_password_change_then_immediate_operations(self):
    #     new_password = "ImmediateTest@123"
    #     success = self._safe_password_change(new_password)
    #     self.assertTrue(success)
    #     self.page.switch_to_tab('profile')
    #     self.page.set_profile_name("Operation After Password Change")
    #     self.page.click_save_profile_button()
    #     self.assert_toast_appears(self.page, "success")

    # def test_19_verify_original_password_always_works(self):
    #     self.assertEqual(self.current_password, self.ORIGINAL_PASSWORD)
    #     self.assert_login_with_current_password()

    # def test_20_password_tracking_integrity(self):
    #     new_password = "IntegrityTest@123"
    #     success = self._safe_password_change(new_password)
    #     self.assertTrue(success)
    #     self.assertEqual(self.current_password, new_password)
    #     self.assertTrue(self.password_changed)


if __name__ == "__main__":
    unittest.main(verbosity=2)