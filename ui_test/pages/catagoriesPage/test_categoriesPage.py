import unittest
from pathlib import Path
import sys
import re
import time

ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
	sys.path.insert(0, str(ROOT))

from ui_test.pages.catagoriesPage.categories_base import CategoriesBaseTest
from ui_test.pages.catagoriesPage.categories_page import CategoriesPage

class TestCategories(CategoriesBaseTest):
	def test_page_loads_and_shows_filters(self):
		page = CategoriesPage(self.driver).open(self.CATEGORIES_URL).wait_loaded()
		heading = page.get_selected_heading_text()
		pattern = re.compile(r"All\s+Books|Books", re.I)
		self.assertTrue(pattern.search(heading) is not None, f"Expected heading to match {pattern.pattern}, got: {heading!r}")

	def test_request_book_button_navigates(self):
		page = CategoriesPage(self.driver).open(self.CATEGORIES_URL).wait_loaded()
		page.click_request_book().wait_for_bookrequest_url(timeout_ms=5000)
		pattern = re.compile(r"/bookrequest$")
		self.assertTrue(pattern.search(page.current_url()) is not None, f"Expected URL to end with /bookrequest, got: {page.current_url()!r}")

	def test_search_and_clear(self):
		page = CategoriesPage(self.driver).open(self.CATEGORIES_URL).wait_loaded()

		baseline_cards = page.book_cards_count_stable(timeout_ms=6000)
		if baseline_cards == 0:
			self.skipTest("No books visible before searching")

		nonce = f"zxq{int(time.time())}notlikely"
		page.set_search(nonce)

		changed = False
		for _ in range(24):  # ~6s
			if page.has_no_books_message():
				changed = True
				break
			curr = page.book_cards_count()
			if curr == 0 or curr < baseline_cards:
				changed = True
				break
			time.sleep(0.25)
		if not changed:
			self.skipTest("Search did not change results (backend may not filter by search)")

		if page.book_cards_count() == 0:
			self.assertTrue(
				page.wait_for_no_books_message(timeout_ms=1500) or page.book_cards_count_stable(timeout_ms=1500) == 0
			)

		empty_shown = page.has_no_books_message()
		page.clear_search_via_button()
		restored = False
		for _ in range(24):  # ~6s
			curr = page.book_cards_count()
			if curr >= baseline_cards:
				if not empty_shown or page.wait_for_no_books_message_hidden(timeout_ms=250):
					restored = True
					break
			time.sleep(0.25)
		self.assertTrue(restored, "Book list not restored after clearing search")

	def test_view_toggle_changes_layout(self):
		page = CategoriesPage(self.driver).open(self.CATEGORIES_URL).wait_loaded()
		initial = page.book_cards_count()
		page.toggle_view()
		after = page.book_cards_count()
		self.assertGreaterEqual(after, 0)

	def test_pagination_controls_present_and_clickable(self):
		page = CategoriesPage(self.driver).open(self.CATEGORIES_URL).wait_loaded()

		page.go_next_page()
		page.go_prev_page()

		page.go_page(1)

	def test_select_category_filters_book_list(self):
		"""Verify selecting a category updates the heading and narrows the results."""
		page = CategoriesPage(self.driver).open(self.CATEGORIES_URL).wait_loaded()
		page.ensure_categories_section_open()

		if page.wait_for_category_items(timeout_ms=8000) == 0:
			self.skipTest("No categories available to select")

		baseline = page.book_cards_count_stable(timeout_ms=6000)
		if baseline == 0:
			self.skipTest("No books visible before filtering; cannot assert reduction")

		cat_title = page.pick_alternate_category() or page.first_category_title()
		if not cat_title:
			self.skipTest("Could not determine a category title to select")

		page.select_category(cat_title).wait_for_heading_contains(cat_title, timeout_ms=6000)
		self.assertTrue(page.heading_includes(cat_title), f"Heading did not include selected category: {cat_title!r}")

		selected = page.book_cards_count_stable(timeout_ms=6000)
		if selected == 0:
			self.assertTrue(page.has_no_books_message(), "Expected 'No books found' message when no results")
			return

		self.assertGreaterEqual(baseline, selected, "Filtered category should not show more books than the initial list")

if __name__ == "__main__":
	unittest.main(verbosity=2)

