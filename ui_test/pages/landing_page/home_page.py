"""
Home Page Object Model - Hero Section Component

This page object provides methods for interacting with the homepage hero carousel.
Uses class-based constants for better organization and maintainability.
"""
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from ui_test.pages.landing_page import landing_page_constants as C


class HomePage:
    """Page Object for the homepage hero section (Hero.jsx)."""
    # Locators using XPath for complex queries
    HERO_SECTION = (By.XPATH, "//section[@aria-roledescription='carousel']")
    LEFT_SLIDER_BTN = (By.XPATH, "//section[@aria-roledescription='carousel']//button[@aria-label='Previous slide']")
    RIGHT_SLIDER_BTN = (By.XPATH, "//section[@aria-roledescription='carousel']//button[@aria-label='Next slide']")
    SHOP_NOW_BTN = (By.XPATH, "//section[@aria-roledescription='carousel']//a[@href='/shop']")
    TRACK = (By.XPATH, "//section[@aria-roledescription='carousel']//div[@role='group']/parent::div")

    def __init__(self, driver):
        self.d = driver

    def open(self, url):
        """Navigate to the specified URL"""
        self.d.get(url)
        return self

    def wait_loaded(self, timeout=C.Timeouts.DEFAULT):
        """Wait for hero section and carousel track to load"""
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.HERO_SECTION))
        WebDriverWait(self.d, timeout).until(EC.presence_of_element_located(self.TRACK))
        return self

    def click_left_slider(self):
        """Click the previous slide button"""
        self.d.find_element(*self.LEFT_SLIDER_BTN).click()
        return self

    def click_right_slider(self):
        """Click the next slide button"""
        self.d.find_element(*self.RIGHT_SLIDER_BTN).click()
        return self

    def click_shop_now(self):
        """Click the Shop Now button in hero carousel"""
        self.d.find_element(*self.SHOP_NOW_BTN).click()
        return self

    def get_track_transform(self):
        """
        Return inline style transform of the slides track.
        Example: translate3d(-100vw, 0, 0)
        """
        return self.d.find_element(*self.TRACK).get_attribute("style") or ""

    def wait_for_transform_change(self, prev_transform, timeout=C.Timeouts.QUICK):
        """Wait for carousel track transform to change from previous value"""
        WebDriverWait(self.d, timeout).until(lambda d: self.get_track_transform() != prev_transform)

    def wait_for_shop_navigation(self, timeout=C.Timeouts.QUICK):
        """Wait for navigation to /shop page"""
        WebDriverWait(self.d, timeout).until(lambda d: d.current_url.endswith(C.URLs.SHOP))
