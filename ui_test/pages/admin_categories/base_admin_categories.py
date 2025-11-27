from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class AdminCategoriesHelperMixin:

	def wait_until(self, condition, timeout=20):
		return WebDriverWait(self.driver, timeout).until(condition)

	def expect_present(self, locator, timeout=20):
		return self.wait_until(EC.presence_of_element_located(locator), timeout)

	def expect_clickable(self, locator, timeout=20):
		return self.wait_until(EC.element_to_be_clickable(locator), timeout)

