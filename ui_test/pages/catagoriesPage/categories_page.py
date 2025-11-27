import re
from typing import Optional
from playwright.sync_api import Page
import time


class CategoriesPage:
    """Playwright Page Object for the Categories page."""

    def __init__(self, driver: Page):
        self.d = driver

    def open(self, url: str):
        self.d.goto(url)
        return self

    def wait_loaded(self, timeout: int = 20):
        self.d.get_by_role("button", name=re.compile(r"request\s+book", re.I)).first.wait_for(
            timeout=timeout * 1000
        )
        self.d.get_by_role("heading", name=re.compile(r"filters", re.I)).first.wait_for(
            timeout=timeout * 1000
        )
        return self

    # --- Request Book CTA / navigation ---
    def click_request_book(self):
        """Click the 'Request Book' button on the Categories page."""
        self.d.get_by_role("button", name=re.compile(r"request\s+book", re.I)).first.click()
        return self

    def wait_for_bookrequest_url(self, timeout_ms: int = 5000):
        """Wait until the current URL ends with /bookrequest."""
        self.d.wait_for_url(re.compile(r"/bookrequest$"), timeout=timeout_ms)
        return self

    def current_url(self) -> str:
        return self.d.url

    def toggle_categories_section(self):
        self.d.get_by_role("button", name=re.compile(r"categories", re.I)).first.click()
        return self

    def ensure_categories_section_open(self, timeout_ms: int = 5000):
        """Idempotently open the Categories accordion."""
        btn = self.d.get_by_role("button", name=re.compile(r"categories", re.I)).first
        container = self.d.locator("#filter-section-categories")
        try:
            expanded = btn.get_attribute("aria-expanded")
            if (expanded is None or str(expanded).lower() != "true") and not container.is_visible():
                btn.click()
        except Exception:
            btn.click()
        try:
            container.wait_for(state="visible", timeout=timeout_ms)
        except Exception:
            pass
        return self

    def wait_for_category_items(self, timeout_ms: int = 5000):
        deadline = time.time() + timeout_ms / 1000
        items = self.d.locator("#filter-section-categories div.space-y-2 div.flex.items-center")
        while time.time() < deadline:
            try:
                count = items.count()
            except Exception:
                count = 0
            if count > 0:
                return count
            time.sleep(0.1)
        return 0

    def first_category_title(self) -> str:
        """Return the first category title text from the panel."""
        try:
            title_loc = self.d.locator(
                "#filter-section-categories div.space-y-2 div.flex.items-center span.flex-1"
            ).first
            return title_loc.inner_text().strip()
        except Exception:
            return ""

    def category_titles(self, limit: Optional[int] = None) -> list[str]:
        """Return visible category titles from the panel."""
        titles = []
        loc = self.d.locator("#filter-section-categories div.space-y-2 div.flex.items-center span.flex-1")
        try:
            count = loc.count()
            if limit is not None:
                count = min(count, limit)
            for i in range(count):
                raw = loc.nth(i).inner_text().strip()
                if raw:
                    titles.append(raw)
        except Exception:
            pass
        return titles

    def pick_alternate_category(self) -> Optional[str]:
        """Pick a category that is not the current one and not 'All'."""
        current = self.get_selected_heading_text().lower()
        for t in self.category_titles(limit=6):
            base = t.split('(')[0].strip()
            if base and base.lower() != "all" and base.lower() not in current:
                return t
        # Fallback to first non-All if all match heading
        for t in self.category_titles():
            base = t.split('(')[0].strip()
            if base.lower() != "all":
                return t
        return None

    def select_category(self, name: str):
        base = name.split('(')[0].strip()
        pattern = rf"^{re.escape(base)}(?:\s*\(\d+\))?\s*$"
        # Scope to the categories panel to avoid clicking chips/cards in the grid
        self.d.locator("#filter-section-categories").get_by_text(re.compile(pattern, re.I)).first.click()
        return self

    def select_all_category(self, timeout_ms: int = 1000):
        """Click an 'All' option inside the categories panel if present (non-fatal if absent)."""
        panel = self.d.locator("#filter-section-categories")
        patterns = [
            r"^All(?:\s*\(\d+\))?\s*$",
            r"^All\s+Books(?:\s*\(\d+\))?\s*$",
            r"^Books(?:\s*\(\d+\))?\s*$",
        ]
        deadline = time.time() + timeout_ms / 1000
        while time.time() < deadline:
            for p in patterns:
                try:
                    loc = panel.get_by_text(re.compile(p, re.I))
                    if loc.count() > 0:
                        loc.first.click()
                        return self
                except Exception:
                    pass
            time.sleep(0.1)
        return self

    def wait_for_heading_contains(self, text: str, timeout_ms: int = 6000):
        """Wait until the selected heading contains the given text."""
        deadline = time.time() + timeout_ms / 1000
        while time.time() < deadline:
            txt = self.get_selected_heading_text()
            if text and text.lower() in txt.lower():
                return self
            time.sleep(0.15)
        return self

    def heading_includes(self, text: str) -> bool:
        """Return True if the selected heading includes the given text (case-insensitive)."""
        try:
            return bool(text) and text.lower() in self.get_selected_heading_text().lower()
        except Exception:
            return False

    def get_selected_heading_text(self) -> str:
        try:
            heading = self.d.get_by_role("heading", name=re.compile(r"(All Books|Books)", re.I)).first
            return heading.inner_text()
        except Exception:
            return ""

    def heading_count(self) -> int:
        text = self.get_selected_heading_text()
        m = re.search(r"\((\d+)\s+book", text, re.I)
        return int(m.group(1)) if m else -1

    def set_search(self, value: str):
        box = self.d.get_by_label(re.compile(r"search\s+books", re.I))
        box.fill(value)
        return self

    def clear_search_via_button(self):
        try:
            self.d.get_by_role("button", name=re.compile(r"clear\s+search", re.I)).first.click()
        except Exception:
            self.d.get_by_label(re.compile(r"search\s+books", re.I)).fill("")
        return self

    def toggle_view(self):
        self.d.get_by_role("button", name=re.compile(r"switch to (grid|list) view", re.I)).first.click()
        return self

    def book_cards_count(self) -> int:
        try:
            loc = self.d.locator("a[href*='/bookview/']")
            return loc.count()
        except Exception:
            return 0

    def book_cards_count_stable(self, timeout_ms: int = 6000, step_ms: int = 200) -> int:
        """Return the book card count when it stabilizes (3 consecutive equal readings) or timeout."""
        end = time.time() + timeout_ms / 1000
        last = None
        same = 0
        result = 0
        while time.time() < end:
            try:
                cnt = self.book_cards_count()
            except Exception:
                cnt = 0
            if cnt == last:
                same += 1
            else:
                same = 0
            last = cnt
            result = cnt
            if same >= 2:  # 3 equal readings
                break
            time.sleep(step_ms / 1000)
        return result

    def has_no_books_message(self) -> bool:
        try:
            return self.d.get_by_text(re.compile(r"no books found", re.I)).first.is_visible()
        except Exception:
            return False

    def wait_for_no_books_message(self, timeout_ms: int = 6000) -> bool:
        """Wait until 'No books found' is visible. Return True if shown, False on timeout."""
        try:
            self.d.get_by_text(re.compile(r"no books found", re.I)).first.wait_for(
                state="visible", timeout=timeout_ms
            )
            return True
        except Exception:
            return False

    def wait_for_no_books_message_hidden(self, timeout_ms: int = 6000) -> bool:
        """Wait until 'No books found' becomes hidden or detached. Return True if hidden, False on timeout."""
        try:
            self.d.get_by_text(re.compile(r"no books found", re.I)).first.wait_for(
                state="hidden", timeout=timeout_ms
            )
            return True
        except Exception:
            return False

    def click_view_more_if_present(self):
        try:
            self.d.get_by_role("button", name=re.compile(r"view\s+more", re.I)).first.click()
        except Exception:
            pass
        return self

    def go_next_page(self):
        try:
            self.d.get_by_role("button", name=re.compile(r"next", re.I)).first.click()
        except Exception:
            pass
        return self

    def go_prev_page(self):
        try:
            self.d.get_by_role("button", name=re.compile(r"prev", re.I)).first.click()
        except Exception:
            pass
        return self

    def go_page(self, page_number: int):
        try:
            self.d.get_by_role("button", name=re.compile(rf"^{page_number}$")).first.click()
        except Exception:
            pass
        return self

