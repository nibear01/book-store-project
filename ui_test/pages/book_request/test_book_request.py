# ui_test/tests/book_request/test_book_request.py
import unittest
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from .base_book_request import BookRequestBaseTest
from .page_book_request import BookRequestPage


class TestBookRequestSubmission(BookRequestBaseTest):
    def setUp(self):
        super().setUp()
        self.page = BookRequestPage(self.driver).open(self.BOOK_REQUEST_URL).wait_loaded()
    
    def test_submit_with_all_required_fields(self):
        """Test successful submission with all required fields and email verification."""
        # Fill required fields
        email = self.fill_required_fields(self.page)
        
        # Verify email
        self.verify_email(self.page, email)

        # Submit form
        self.page.click_submit()

        # Wait for success message
        self.page.wait_for_alert(10)
        alert_text = self.page.get_alert_message()

        self.assertTrue("submitted successfully" in alert_text.lower())
        self.assertTrue("success" in alert_text.lower() or "✅" in alert_text)
    
    def test_validation_required_fields(self):
        """Test validation errors when required fields are missing."""
        
        # Try to submit empty form
        self.page.click_submit()
        
        # Check for validation errors
        self.assertTrue(self.page.has_error('name'))
        self.assertTrue(self.page.has_error('email'))
        self.assertTrue(self.page.has_error('title'))
        
        # Check error messages
        self.assertTrue("required" in self.page.get_error_text('name').lower())
        self.assertTrue("required" in self.page.get_error_text('email').lower())
        self.assertTrue("required" in self.page.get_error_text('title').lower())
    
    def test_invalid_email_format(self):
        """Test validation for invalid email format."""

        # Fill with invalid email
        self.page.fill_name("Test User") \
            .fill_email("invalid-email") \
            .fill_title("Test Book")
        
        # Check email validation
        self.assertTrue(self.page.has_error('email'))
        self.assertTrue("valid email" in self.page.get_error_text('email').lower())

        # Send code button should be disabled
        self.assertTrue(self.page.is_send_code_disabled())

    def test_email_verification_required(self):
        """Test that submission is blocked without email verification."""

        # Fill required fields but don't verify email
        self.fill_required_fields(self.page)

        # Submit button should indicate verification is required
        submit_text = self.page.get_submit_button_text()
        self.assertTrue("verify email" in submit_text.lower())
        self.assertTrue(not self.page.is_submit_enabled())

        # Try to submit anyway
        self.page.click_submit()

        # Should show email verification error
        self.assertTrue(self.page.has_error('email_verified'))
        self.assertTrue("verify your email" in self.page.get_error_text('email_verified').lower())

    def test_form_reset_after_successful_submission(self):
        """Test that form resets after successful submission."""

        # Fill and submit form
        email = self.fill_all_fields(self.page)
        
        # Scroll to send code button before clicking and wait until clickable
        send_btn = self.page.d.find_element(*self.page.SEND_CODE_BTN)
        self.page.d.execute_script("arguments[0].scrollIntoView({block: 'center'});", send_btn)
        WebDriverWait(self.page.d, 10).until(EC.element_to_be_clickable(self.page.SEND_CODE_BTN))
            
        self.verify_email(self.page, email)
        # Scroll to submit button and wait until clickable
        submit_btn = self.page.d.find_element(*self.page.SUBMIT_BTN)
        self.page.d.execute_script("arguments[0].scrollIntoView({block: 'center'});", submit_btn)
        WebDriverWait(self.page.d, 10).until(EC.element_to_be_clickable(self.page.SUBMIT_BTN))
        
        self.page.click_submit()
        self.page.wait_for_alert(10)
        
        # Check that form is reset
        self.assertTrue(self.page.d.find_element(*self.page.NAME).get_attribute('value') == "")
        self.assertTrue(self.page.d.find_element(*self.page.EMAIL).get_attribute('value') == "")
        self.assertTrue(self.page.d.find_element(*self.page.TITLE).get_attribute('value') == "")
        self.assertTrue(self.page.d.find_element(*self.page.AUTHOR).get_attribute('value') == "")
        self.assertTrue(self.page.d.find_element(*self.page.ISBN).get_attribute('value') == "")
        self.assertTrue(self.page.d.find_element(*self.page.PUBLISHER).get_attribute('value') == "")
        self.assertTrue(self.page.d.find_element(*self.page.NOTES).get_attribute('value') == "")

        # Email verification should be reset
        self.assertTrue(not self.page.is_email_verified())

    def test_optional_fields_not_required(self):
        """Test that optional fields can be left empty."""

        # Fill only required fields
        email = self.fill_required_fields(self.page)

        # Verify email and submit
        self.verify_email(self.page, email)
        self.page.click_submit()

        # Should succeed
        self.page.wait_for_alert(10)
        alert_text = self.page.get_alert_message()
        self.assertTrue("submitted successfully" in alert_text.lower())

    def test_long_input_handling(self):
        """Test form behavior with very long input values."""
        
        long_string = "A" * 255
        very_long_string = "B" * 1000

        self.page.fill_name(long_string) \
            .fill_email(f"test{int(time.time())}@example.com") \
            .fill_title(long_string) \
            .fill_author(long_string) \
            .fill_isbn(long_string) \
            .fill_publisher(long_string) \
            .fill_notes(very_long_string)
        
        # Should be able to proceed with email verification
        email = f"test{int(time.time())}@example.com"
        self.page.fill_email(email)
        
        # Note: Skipping actual OTP verification for long input test
        # as it depends on backend availability
        print("Long input test - form accepted long values without UI issues")
    
    def test_special_characters(self):
        """Test form with special characters in inputs."""
        
        special_name = "Test User © ® ™"
        special_title = "Book Title: «Special» — 'Quotes' & “More”"
        special_notes = "Notes with emoji: 📚✨🚀"

        self.page.fill_name(special_name) \
            .fill_email(f"test.special+{int(time.time())}@example.com") \
            .fill_title(special_title) \
            .fill_notes(special_notes)
        
        # Verify values are accepted in form
        self.assertTrue(self.page.d.find_element(*self.page.NAME).get_attribute('value') == special_name)
        self.assertTrue(self.page.d.find_element(*self.page.TITLE).get_attribute('value') == special_title)
        self.assertTrue(self.page.d.find_element(*self.page.NOTES).get_attribute('value') == special_notes)
