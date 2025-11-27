from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class AdminAuthorRequestHelperMixin:
    def wait_until(self, condition, timeout=20):
        return WebDriverWait(self.driver, timeout).until(condition)

    def expect_present(self, locator, timeout=20):
        return self.wait_until(EC.presence_of_element_located(locator), timeout)

    def expect_clickable(self, locator, timeout=20):
        return self.wait_until(EC.element_to_be_clickable(locator), timeout)

    def expect_invisible(self, locator, timeout=20):
        return self.wait_until(EC.invisibility_of_element_located(locator), timeout)

    def expect_visible(self, locator, timeout=20):
        return self.wait_until(EC.visibility_of_element_located(locator), timeout)

    def expect_text_in_element(self, locator, text, timeout=20):
        return self.wait_until(EC.text_to_be_present_in_element(locator, text), timeout)

    def expect_element_has_class(self, locator, class_name, timeout=20):
        def element_has_class(driver):
            element = driver.find_element(*locator)
            return class_name in element.get_attribute("class")
        return self.wait_until(element_has_class, timeout)

    def take_screenshot(self, name="screenshot"):
        self.driver.save_screenshot(f"{name}_{int(time.time())}.png")