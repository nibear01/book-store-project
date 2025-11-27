# Admin Finance UI Tests

## Overview
UI tests for the Finance Manager workflow page using the Page Object Model pattern with class-based constants.

## Test Coverage (19 Tests)

### Section 1: Page Load & Access Control (1 test)
- ✅ `test_01_page_loads_with_admin_role` - Page loads with all key elements

### Section 2: Refresh (1 test)
- ✅ `test_02_refresh_button_works` - Refresh functionality

### Section 3: Search (2 tests)
- ✅ `test_03_search_filters_by_order_number` - Search filtering
- ✅ `test_04_search_clear_button_works` - Clear button

### Section 4: Stage Filter (3 tests)
- ✅ `test_05_stage_filter_has_expected_options` - All FM stages present
- ✅ `test_06_stage_filter_by_fm_review` - Filter by FM_REVIEW
- ✅ `test_07_stage_filter_reset_shows_all_orders` - Reset filter

### Section 5: Pagination (2 tests)
- ✅ `test_08_pagination_appears_when_needed` - Pagination visibility
- ✅ `test_09_pagination_next_button_navigates` - Navigation works

### Section 6: Empty State (1 test)
- ✅ `test_10_empty_state_shown_when_no_results` - Empty state message

### Section 7: Modal Open/Close (2 tests)
- ✅ `test_11_modal_opens_when_clicking_open_button` - Modal opens
- ✅ `test_12_modal_closes_when_clicking_close_button` - Modal closes

### Section 8: Modal Content (3 tests)
- ✅ `test_13_modal_shows_order_details` - Order details visible
- ✅ `test_14_modal_shows_financial_summary` - **Financial section visible** (critical for Finance role)
- ✅ `test_15_modal_shows_items_table` - Items table visible

### Section 9: Remarks (2 tests)
- ✅ `test_16_remarks_field_accepts_input` - Remarks input works
- ✅ `test_17_remarks_clear_button_clears_text` - Clear button works

### Section 10: Workflow Advancement (2 tests)
- ✅ `test_18_modal_shows_advance_buttons_for_valid_transitions` - Advance buttons present
- ✅ `test_19_advance_button_transitions_order_to_next_stage` - Workflow transitions work

## Finance Workflow Stages

```python
C.Stages.REVIEW      # FM_REVIEW
C.Stages.APPROVED    # FM_APPROVED
C.Stages.REJECTED    # FM_REJECTED
C.Stages.CANCELLED   # CANCELLED_FM
```

**Terminal Stages** (require remarks): `FM_REJECTED`, `CANCELLED_FM`

## Project Structure

```
admin_finance/
├── __init__.py                      # Package marker
├── admin_finance_constants.py       # Class-based constants
├── admin_finance_page.py            # Page Object Model
├── test_admin_finance.py            # Test suite (19 tests)
└── readme.md                        # This file
```

## Constants Organization

### Class-Based Structure
```python
from ui_test.pages.admin_finance import admin_finance_constants as C

# Stages
C.Stages.REVIEW, C.Stages.APPROVED, C.Stages.REJECTED, C.Stages.CANCELLED
C.Stages.ALL              # List of all stages
C.Stages.FILTER_ALL       # "All Finance Stages"
C.Stages.TERMINAL_STAGES  # Set of terminal stages

# Timeouts
C.Timeouts.DEFAULT (20s), C.Timeouts.SHORT (10s), C.Timeouts.QUICK (2s)

# Messages
C.Messages.TEST_REMARKS
C.Messages.Assert.PAGE_LOADED
C.Messages.Assert.FINANCIALS_VISIBLE  # Finance-specific assertion
C.Messages.Skip.NO_ORDERS
C.Messages.Error.NO_OPEN_BUTTON

# UI Text
C.UIText.PAGE_TITLE, C.UIText.NO_ORDERS, C.UIText.SEARCH_PREFIX

# Config
C.Config.DEFAULT_PAGE_SIZE, C.Config.SHOWING_COUNTS_PATTERN
```

## Running Tests

### Run all finance tests:
```bash
cd ui_test
python -m pytest pages/admin_finance/test_admin_finance.py -v
```

### Run specific test:
```bash
python -m pytest pages/admin_finance/test_admin_finance.py::TestAdminFinancePage::test_01_page_loads_with_admin_role -v
```

### Run with unittest:
```bash
cd ui_test/pages/admin_finance
python -m unittest test_admin_finance.TestAdminFinancePage -v
```

## Frontend Components

### Main Component
- **File**: `frontend/src/components/adminComponents/Finance.jsx`
- **Name Attributes Added**:
  - `finance-page` - Main container
  - `finance-page-title` - Page title
  - `finance-stage-filter` - Stage filter dropdown
  - `finance-search-input` - Search input field
  - `finance-search-clear-btn` - Clear search button
  - `finance-refresh-btn` - Refresh button
  - `finance-table` - Desktop table
  - `finance-row` - Table rows
  - `finance-open-btn` - Open order button
  - `finance-mobile-card` - Mobile card view
  - `finance-mobile-open-btn` - Mobile open button
  - `finance-pagination` - Pagination controls

### Shared Components
- **WorkflowOrderModal.jsx** - Order detail modal (reused from support)
- **Pagination.jsx** - Pagination component

## Page Object Methods

### Navigation
- `open(base_url)` - Navigate to finance page
- `wait_loaded(timeout)` - Wait for page load
- `is_loaded()` - Check if page is loaded

### Search & Filter
- `set_search(value)` - Set search input
- `clear_search()` - Clear search
- `click_search_clear_btn()` - Click clear button
- `set_stage_filter(stage)` - Set stage filter
- `get_stage_filter_options()` - Get filter options

### Table Operations
- `count_table_rows()` - Count visible rows
- `get_row_stage(index)` - Get stage from row
- `get_row_order_number(index)` - Get order number

### Modal Operations
- `open_first_order()` - Open first order modal
- `modal_is_open()` - Check modal state
- `modal_close()` - Close modal
- `modal_get_title_text()` - Get order number
- `modal_get_stage_text()` - Get current stage
- `modal_has_financial_section()` - **Check financial details**

### Workflow
- `get_available_advance_stages()` - Get advance buttons
- `click_advance_to_stage(stage)` - Click advance button
- `advance_to_stage_with_remarks(stage, remarks)` - Advance with remarks
- `set_remarks(text)` - Set remarks text
- `clear_remarks()` - Clear remarks

### Pagination
- `has_pagination()` - Check pagination visibility
- `click_pagination_next()` - Next page
- `click_pagination_prev()` - Previous page

## Key Features

### Finance-Specific
✅ **Financial Summary Validation** - Test 14 specifically validates that financial details are visible (critical for Finance Manager role)
✅ **FM Workflow Stages** - Tests cover FM_REVIEW → FM_APPROVED/FM_REJECTED transitions
✅ **Remarks Required** - Terminal stages (REJECTED, CANCELLED) require remarks

### Design Patterns
✅ **Page Object Model** - Clean separation of test logic and page interactions
✅ **Class-Based Constants** - Organized, discoverable constants
✅ **By.NAME Selectors** - Stable, maintainable element location
✅ **Comprehensive Coverage** - 19 focused tests covering all core functionality

## Access Control

**Authorized Roles:**
- Admin
- Finance Manager

**Access Denied Message:** "Access restricted to Finance Manager or Admin."

## Dependencies

- Python 3.x
- Selenium WebDriver
- Firefox/geckodriver
- unittest framework
- BookStopSetUp base test class (from ui_test/pages/login/set_up.py)

## Notes

- Tests use `HEADLESS = False` for visibility during development
- Modal reuses WorkflowOrderModal component from customer support
- All locators use By.NAME for stability
- Single-line import: `from ui_test.pages.admin_finance import admin_finance_constants as C`
- Tests follow the same optimized pattern as admin_customer_support (reduced from potential 39 to 19 core tests)

---

**Created**: 2024
**Pattern**: Page Object Model with class-based constants
**Locator Strategy**: By.NAME selectors
**Test Count**: 19 comprehensive tests
