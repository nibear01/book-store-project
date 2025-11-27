import os
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


class AdminBooksHelperMixin:
    def _normalize_bool(self, value):
        if value is None:
            return None
        s = str(value).strip().lower()
        if s in ("true", "1", "yes", "y"):
            return True
        if s in ("false", "0", "no", "n"):
            return False
        return None

    def _normalize_date(self, value):
        if not value:
            return None
        v = str(value).strip()
        if not v:
            return None
        if "/" in v:
            try:
                mm, dd, yyyy = v.split("/")
                return f"{yyyy}-{int(mm):02d}-{int(dd):02d}"
            except Exception:
                return v
        return v

    def _wait_input_by_name(self, name, timeout=15):
        return WebDriverWait(self.page.d, timeout).until(
            EC.presence_of_element_located((By.NAME, name))
        )

    def _isbn_digits(self, s: str) -> str:
        return "".join(ch for ch in str(s or "") if ch.isdigit() or ch.upper() == "X")

    def _isbn13_check_digit(self, digits12: str) -> str:
        total = 0
        for i, ch in enumerate(digits12[:12]):
            d = int(ch)
            total += d if i % 2 == 0 else 3 * d
        return str((10 - (total % 10)) % 10)

    def _fix_isbn_if_needed(self, raw: str) -> str:
        digits = self._isbn_digits(raw)
        if len(digits) >= 13:
            first12 = digits[:12]
            check = self._isbn13_check_digit(first12)
            return first12 + check
        if len(digits) == 10:
            return digits
        return digits

    def _type_if_present(self, field_name, value):
        if value is None:
            return
        value = str(value).strip()
        if value == "":
            return
        try:
            el = self._wait_input_by_name(f"books-input-{field_name}")
            try:
                el.clear()
            except Exception:
                pass
            el.send_keys(value)
        except Exception:
            pass

    def _set_checkbox_if_present(self, field_name, bool_value):
        if bool_value is None:
            return
        try:
            el = self._wait_input_by_name(f"books-input-{field_name}")
            selected = False
            try:
                selected = el.is_selected()
            except Exception:
                selected = False
            if bool_value and not selected:
                el.click()
            if (bool_value is False) and selected:
                el.click()
        except Exception:
            pass
