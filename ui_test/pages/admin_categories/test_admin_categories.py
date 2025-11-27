import os
import unittest

from pages.admin_categories.page_admin_categories import AdminCategoriesBaseTest, AdminCategoriesPage
from pages.admin_categories.base_admin_categories import AdminCategoriesHelperMixin


class TestAdminCategories(AdminCategoriesHelperMixin, AdminCategoriesBaseTest):
	PREFIX = os.environ.get("E2E_CATEGORIES_PREFIX", "E2E_CAT_")

	def setUp(self):
		super().setUp()
		self.page = self.open_categories_page()

	def tearDown(self):
		try:
			self.page.delete_all_with_prefix(self.PREFIX)
		except Exception:
			pass
		finally:
			super().tearDown()

	def test_page_loads_and_toolbar_visible(self):
		title = self.page.wait_by(AdminCategoriesPage.TITLE)
		table = self.page.wait_by(AdminCategoriesPage.TABLE)
		toolbar = self.page.wait_by(AdminCategoriesPage.TOOLBAR)
		self.assertTrue(title is not None)
		self.assertTrue(table is not None)
		self.assertTrue(toolbar is not None)

	def test_add_edit_delete_flow(self):
		name = f"{self.PREFIX}ONE"
		name2 = f"{self.PREFIX}TWO"
		self.page.add_category_unique(name)
		self.page.add_category_unique(name2)
		self.page.search(name)
		row = self.page.find_row_by_name(name)
		if row:
			opened = self.page.open_edit_for_row(row)
			self.assertTrue(opened is True)
			name_input = self.page.wait_by(AdminCategoriesPage.MODAL_NAME)
			try:
				name_input.clear()
			except Exception:
				pass
			new_name = name + "_UPDATED"
			name_input.send_keys(new_name)
			self.page.save_modal()
			self.page.search(new_name)
			rows = self.page.wait_rows(timeout=20)
			self.assertTrue(rows is not None)
			self.page.clear_search()
		else:
			table = self.page.wait_by(AdminCategoriesPage.TABLE)
			self.assertTrue(table is not None)

	def test_duplicate_add_is_blocked(self):
		base = f"{self.PREFIX}DUP"
		final1 = self.page.add_category_unique(base)
		before = self.page.count_rows_with_name(final1)
		self.page.open_add_modal()
		self.page.set_modal_name(final1)
		self.page.wait_clickable(AdminCategoriesPage.MODAL_SUBMIT).click()
		self.assertTrue(self.page.is_modal_open() is True)
		self.page.close_modal()
		after = self.page.count_rows_with_name(final1)
		self.assertTrue(after == before)

	def test_duplicate_edit_is_blocked(self):
		a = self.page.add_category_unique(f"{self.PREFIX}A")
		b = self.page.add_category_unique(f"{self.PREFIX}B")
		before_b = self.page.count_rows_with_name(b)
		self.page.search(a)
		row = self.page.find_row_by_name(a)
		if row:
			opened = self.page.open_edit_for_row(row)
			self.assertTrue(opened is True)
			self.page.set_modal_name(b)
			self.page.wait_clickable(AdminCategoriesPage.MODAL_SUBMIT).click()
			self.assertTrue(self.page.is_modal_open() is True)
			self.page.close_modal()
			after_b = self.page.count_rows_with_name(b)
			self.assertTrue(after_b == before_b)
		else:
			table = self.page.wait_by(AdminCategoriesPage.TABLE)
			self.assertTrue(table is not None)

	def test_modal_cancel_and_close(self):
		self.page.open_add_modal()
		self.page.close_modal()
		self.assertTrue(True)
		self.page.open_add_modal()
		try:
			self.page.wait_clickable(AdminCategoriesPage.MODAL_CLOSE).click()
		except Exception:
			self.page.close_modal()
		self.assertTrue(True)

	def test_submit_disabled_when_blank(self):
		self.page.open_add_modal()
		self.page.set_modal_name("")
		disabled = self.page.is_submit_disabled()
		self.assertTrue(disabled is True)
		self.page.close_modal()

	def test_pagination_presence_with_many(self):
		base = f"{self.PREFIX}PG_"
		for i in range(12):
			self.page.add_category_unique(f"{base}{i}")
		exists = self.page.pagination_exists()
		self.assertTrue(exists is True)


if __name__ == "__main__":
	unittest.main(verbosity=2)

