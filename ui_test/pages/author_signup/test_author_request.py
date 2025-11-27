import unittest

from .author_request_page import AuthorRequestPage, AuthorRequestBaseTest

class TestAuthorRequestSubmission(AuthorRequestBaseTest):
	def test_submit_with_all_required_fields(self):
		"""Test that form can be submitted with all required fields (email verification bypassed)."""
		page = AuthorRequestPage(self.driver).open(self.AUTHOR_URL).wait_loaded()

		email = self.fill_required_fields(page)

		# Since emailVerified is true by default and not reset on email change (bypassed for testing),
		# submit button should be ready
		self.assertFalse(page.submit_requires_verify(), "Submit should be enabled when all fields are filled")
		self.assertIn("Submit", page.submit_text(), "CTA should show Submit when ready")
		
		# Test passes - form is ready for submission

	def test_form_with_optional_fields(self):
		"""Test the form behavior with optional fields filled."""
		page = AuthorRequestPage(self.driver).open(self.AUTHOR_URL).wait_loaded()

		# Fill all required fields first
		email = self.fill_required_fields(page)

		# Fill optional fields for a more complete test
		page.fill_affiliation("Test University") \
			.fill_additional_requests("This is a test submission") \
			.select_type_of_work("Research Paper")

		# With email verification bypassed, submit should be ready
		self.assertFalse(page.submit_requires_verify(), "Submit should be enabled with all required fields filled")
		self.assertIn("Submit", page.submit_text(), "CTA should show Submit")
		
		# Test passes - form is ready for submission
"""Run via pytest/unittest discovery."""