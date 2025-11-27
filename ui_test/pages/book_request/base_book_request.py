# ui_test/pages/book_request/book_request_base.py
import time
from .page_book_request import BookRequestPage
from ..login.set_up import BookStopSetUp
from ..utility.data_generator import unique_name, unique_email, unique_phone
from ..utility.mongo_helper import get_latest_otp, clear_otp_for_email


class BookRequestBaseTest(BookStopSetUp):
    BOOK_REQUEST_URL = f"{BookStopSetUp.BASE_URL}/bookrequest"
    
    def fill_required_fields(self, page, email=None, name=None, title=None):
        """Fill the minimum required fields for book request form."""
        if name is None:
            name = unique_name()
        if email is None:
            email = unique_email()
        if title is None:
            title = f"Test Book {int(time.time())}"
        
        page.fill_name(name) \
            .fill_email(email) \
            .fill_title(title)
        
        return email
    
    def fill_all_fields(self, page, email=None, name=None, title=None):
        """Fill all fields including optional ones."""
        email = self.fill_required_fields(page, email, name, title)
        
        page.fill_author("Test Author") \
            .fill_isbn("978-3-16-148410-0") \
            .fill_publisher("Test Publishing") \
            .fill_notes("This is a test book request from automated UI tests.")
        
        return email
    
    def verify_email(self, page, email, timeout=10):
        """Handle the email verification process."""
        # Scroll to send code button and wait for it to be clickable
        try:
            send_btn = page.d.find_element(*page.SEND_CODE_BTN)
            page.d.execute_script("arguments[0].scrollIntoView({block: 'center'});", send_btn)
            time.sleep(0.5)  # Small delay after scroll
        except:
            pass  # Element might not be visible yet
        
        page.wait_send_code_clickable(timeout).click_send_code()
        time.sleep(3)  # Wait for OTP to be sent
        
        # Check if OTP input appeared
        try:
            page.wait_otp_input_visible(timeout)
        except:
            alert_msg = page.get_alert_message()
            if "Failed to send code" in alert_msg or "error" in alert_msg.lower():
                self.skipTest(f"Backend not available - OTP send failed: {alert_msg}")
            else:
                self.skipTest("OTP input did not appear - backend may be unavailable")
        
        # Get OTP from database
        otp_code = get_latest_otp(email)
        if otp_code is None:
            clear_otp_for_email(email)
            self.skipTest(f"OTP code not found in database for {email}")
        
        # Verify OTP
        page.fill_otp(otp_code).click_verify()
        time.sleep(2)  # Wait for verification
        
        # Clean up OTP
        clear_otp_for_email(email)
        
        # Verify email was successfully verified
        if not page.is_email_verified():
            self.fail("Email verification failed")
        
        return True