# Admin Panel — Customer Support UI Test Plan & Implementation

This document defines the end-to-end UI test plan for the Admin panel Support section and documents the implemented test suite using the **Page Object Model** pattern. It is based on the current frontend implementation so tests exercise real behaviors and selectors that exist in code.

- Under test: `frontend/src/components/adminComponents/Support.jsx`
- Detail modal: `frontend/src/components/adminComponents/support/WorkflowOrderModal.jsx`
- Shared constants/helpers: `frontend/src/components/adminComponents/constants/constants.js`
- Orders API: `frontend/src/api/order-api.js`

## Test Implementation

This folder now contains a complete, production-ready UI test suite following the **Page Object Model** design pattern (identical structure to `admin_orders` tests).

### File Structure

```
ui_test/pages/admin_customer_support/
├── __init__.py                              # Package marker
├── readme.md                                # This file
├── admin_customer_support_constants.py      # All hardcoded strings, timeouts, messages
├── admin_customer_support_page.py           # Page Object: all element locators & interactions
└── test_admin_customer_support.py           # Test cases (39 scenarios)
```

### Architecture

- **test_admin_customer_support.py** — NO Selenium imports; calls only page object methods
- **admin_customer_support_page.py** — ALL Selenium/WebDriver code; all locators; all waits
- **admin_customer_support_constants.py** — ALL hardcoded strings, timeouts, error messages, assertion messages

### Test Coverage (39 Test Cases)

#### Section 1: Page Load & Access Control (5 tests)
- `test_01_page_loads_with_admin_role` — Page loads successfully for admin
- `test_02_page_shows_title_and_subtitle` — Title "Customer Support Queue" visible
- `test_03_page_has_refresh_button` — Refresh button present
- `test_04_page_has_search_input` — Search input present
- `test_05_page_has_stage_filter` — Stage filter dropdown present

#### Section 2: Refresh & UI Toggles (3 tests)
- `test_06_refresh_button_works` — Refresh reloads the list correctly
- `test_07_showing_counts_display` — Showing counts displayed when rows present
- Extended refresh/toggle tests

#### Section 3: Search Functionality (3 tests)
- `test_08_search_by_order_number` — Search filters by order prefix
- `test_09_search_clear_resets_results` — Clear search restores original results
- `test_10_search_input_placeholder` — Placeholder text correct

#### Section 4: Stage Filter (4 tests)
- `test_11_stage_filter_has_all_csm_stages` — All CSM stages in options
- `test_12_filter_by_address_check_stage` — CSM_ADDRESS_CHECK filter works
- `test_13_filter_by_clarified_stage` — CSM_CLARIFIED filter works
- `test_14_filter_by_all_stages_shows_all` — All stages option shows complete list

#### Section 5: Pagination (3 tests)
- `test_15_pagination_visible_with_many_orders` — Shown when total > 10
- `test_16_pagination_hidden_with_few_orders` — Hidden when total ≤ 10
- `test_17_pagination_navigation` — Next/Prev buttons navigate correctly

#### Section 6: Empty State (1 test)
- `test_18_empty_state_message_displayed` — "No orders in queue" shown when no results

#### Section 7: Modal - Open & Close (2 tests)
- `test_19_open_order_modal` — Click Open opens order detail modal
- `test_20_close_order_modal` — Close button closes modal

#### Section 8: Modal - Content & Details (5 tests)
- `test_21_modal_displays_order_number` — Order number in modal title
- `test_22_modal_displays_stage` — Current stage displayed
- `test_23_modal_displays_customer_details` — Customer name/email shown
- `test_24_modal_displays_financial_section` — Subtotal, discount, shipping visible
- `test_25_modal_displays_items_table` — Order items table present with rows

#### Section 9: Remarks Field (3 tests)
- `test_26_remarks_field_present_in_modal` — Remarks textarea present
- `test_27_set_remarks_text` — Remarks can be set and retrieved
- `test_28_clear_remarks_button` — Clear button empties remarks

#### Section 10: Workflow Stage Advancement (4 tests)
- `test_29_advance_buttons_present` — Advance buttons visible
- `test_30_advance_to_specific_stage` — Can advance to next stage with remarks
- `test_31_remarks_required_for_cancelled_stage` — CANCELLED_CSM requires remarks
- `test_32_no_om_completed_in_next_stages` — OM_COMPLETED filtered from options

#### Section 11: Mobile Layout (2 tests)
- `test_33_desktop_table_visible_on_desktop` — Table shown on desktop
- `test_34_mobile_cards_on_mobile_viewport` — Cards shown on mobile (375x812)

#### Section 12: Combined Workflows (3 tests)
- `test_35_search_and_filter_combined` — Search + stage filter work together
- `test_36_filter_search_and_pagination` — All three interact correctly
- `test_37_refresh_after_filter_and_search` — Filters persist after refresh

#### Section 13: Role & Access Control (2 tests)
- `test_38_admin_can_see_all_orders` — Admin has full access
- `test_39_page_shows_table_structure` — Table has correct headers



## Scope and goals

Validate that a user with the appropriate role can:
- View and filter the Customer Support order queue
- Search orders by order no., customer name, or email
- Page through results
- Open an order and view details/items/financials
- Advance workflow stage with remarks rules enforced
- See proper empty states, loading states, and error handling
- Verify access control (CSM/Admin only) and mobile layout

- Backend API running locally and reachable from the frontend
  - Orders workflow endpoints used by Support page:
    - `GET /orders/workflow` (optional `stage` query)
    - `GET /orders/workflow/:id`
    - `GET /orders/workflow/:id/next-stages`
    - `PATCH /orders/workflow/:id/advance`
- Frontend running (Vite dev server)
- Test account(s):
  - Admin: has role `admin`
  - Customer Support: has role `customer_support`
  - Normal user: role `user` only (for access denial test)
- Test data: at least 12+ orders to cover pagination and filters
  - Internal stages from Support set (`STAGE_SETS.SUPPORT`):
    - `CSM_ADDRESS_CHECK`, `CSM_CLARIFIED`, `CSM_FEEDBACK`, `CANCELLED_CSM`
  - A few orders in non-CSM stages (e.g., Finance/Delivery) to confirm they are hidden for CSM role but visible to Admin
  - Orders containing distinct values to search by:
    - Different `order_number`s
    - `shipping_address.fullName`
    - `shipping_address.email`

Notes
- Default page size is `DEFAULT_PAGE_SIZE = 10`.
- Remarks required set for Support: `REMARK_REQUIRED.SUPPORT = { 'CANCELLED_CSM' }`.
- The UI hides `OM_COMPLETED` from next-stage choices (filtered in code).

## Navigation and visibility

- Sidebar menu path: Admin Sidebar → "Support" (`/admin/support`)
- Visibility: shown if user is `admin` or has `customer_support` role
- If unauthorized, page renders: "Access restricted to Customer Support or Admin."

## Key UI elements and stable locators

Prefer accessible roles/names/text where possible.

- Page title: "Customer Support Queue"
- Stage filter select: label-less select with options populated from Support stages
  - Default option text: "All CSM Stages"
  - Options: the four CSM stages above
- Search input: placeholder "Search order/customer"
- Refresh button: text "Refresh"
- Table headers (desktop): "Order No.", "Customer", "Stage", "Created", "Actions"
- Row action: "Open" button
- Empty state (desktop): "No orders in queue"
- Empty state (mobile): same copy inside a bordered card
- Loading state: skeleton rows rendered by `WorkflowSkeleton`
- Pagination: shown only when total >= 10; uses accessible buttons "Prev", numbered pages, "Next"
- Order modal:
  - Title text: `Order <order_number>`
  - Subtext: `Stage: <internal_stage>`
  - Financials visible (subtotal, discount, shipping, grand)
  - Items table headers: "Title", "Qty", "Price"
  - Remarks label: "Remarks" (plus hint when any next stage requires remarks)
  - Stage advance buttons: `Advance → <STAGE>`
  - Clear button: "Clear"
  - Close button: "Close"

## Test scenarios

1) Access control — unauthorized user
- Login as a plain `user` (no admin/CSM roles)
- Navigate to `/admin/support`
- Expect the content: "Access restricted to Customer Support or Admin."
- Sidebar item may be hidden for non-admin roles; navigating directly should still show the message

2) Sidebar visibility by role
- Login as CSM (`customer_support`) → "Support" menu is visible and navigable
- Login as Admin → "Support" menu is visible

3) Initial load and loading state
- With authorized role, open `/admin/support`
- Expect a loading skeleton during the initial fetch
- After load, verify either empty state or rows are displayed; table headers present on desktop

4) Filtering by stage
- Select each option from stage filter (e.g., "CSM_ADDRESS_CHECK")
- Expect that all visible rows have `internal_stage` equal to the selected stage
- Verify `GET /orders/workflow?stage=<value>` was called (if network traffic can be inspected)

5) Search (debounced 300ms)
- Type a full or partial `order_number` → wait >300ms → row(s) match
- Clear → search by `shipping_address.fullName` → matched rows only
- Clear → search by `shipping_address.email` → matched rows only
- Clear button (×) clears search and resets results

6) Pagination
- Ensure >10 matching results (either total list or by removing filters)
- Verify pagination controls appear
- Page 1 shows rows 1–10; clicking Next goes to 11–20 (if exist); Prev/Next disabled at bounds

7) Open order modal and data display
- Click "Open" on any row
- Modal shows: title `Order <order_number>`, `Stage: <internal_stage>`
- Customer details present for name/email/phone/address if provided
- Financial section visible (Subtotal, Discount, Shipping, Grand)
- Items table shows columns and at least one row

8) Next-stage options and remark requirements
- In modal, check available "Advance → <STAGE>" buttons
- Verify `OM_COMPLETED` is not present even if API returns it
- If `CANCELLED_CSM` is listed, its button must be disabled until text is entered in Remarks
- Attempt to click a remark-required stage without remarks → toast "Remarks required"

9) Advance workflow success
- Enter remarks (if required) and click an available advance button
- Expect toast success: "Advanced"
- Modal remains; `Stage:` text updates to the new stage
- `GET /orders/workflow/:id/next-stages` is re-fetched and buttons update
- Parent list refreshes (via `onAdvanced`) — verify the row reflects updated stage after modal close or after refresh

10) Refresh list button
- Change search or stage filter, then click "Refresh"
- Verify the list reloads using the current filters and shows updated data

11) Empty states
- With filters/search that match nothing → desktop table shows a single row with "No orders in queue"; mobile shows bordered card with same copy

12) Error handling
- Simulate `GET /orders/workflow` returning 500 → toast "Failed to load orders"
- Simulate detail/next-stages failure → toast "Failed to load order detail"
- Simulate `PATCH /advance` error → toast shows backend message or "Advance failed"

13) Mobile layout
- Set viewport < 640px (Tailwind `sm`) and open `/admin/support`
- Verify table is hidden and card layout is shown (sm:hidden)
- Cards include order no., customer, created date/time, and an "Open" button → opens modal with same behaviors

## Role-based visibility of rows

- Admin can see all workflow orders returned by the API
- CSM users see only those with `internal_stage` in `STAGE_SETS.SUPPORT`

## Data setup tips

- Seed a handful of orders in each Support stage listed above
- For CSM role tests, also seed orders in non-CSM stages and confirm they are not rendered
- Ensure values to search by are unique (order no., name, email)

## Suggested automation approach

Playwright (recommended):
- Use role- and text-based locators for stability
- Store auth token in `localStorage` before navigation or log in via existing login page
- Use `page.route` to mock backend responses for negative tests

Example locator ideas
- Page title: `getByRole('heading', { name: 'Customer Support Queue' })`
- Stage filter: `page.locator('select').first()` and `getByRole('option', { name: 'CSM_ADDRESS_CHECK' })`
- Search: `getByPlaceholder('Search order/customer')`
- Refresh: `getByRole('button', { name: 'Refresh' })`
- Table headers: `getByRole('columnheader', { name: 'Order No.' })` etc.
- Row open: `getByRole('button', { name: 'Open' }).first()`
- Empty state: `getByText('No orders in queue')`
- Modal title: `getByRole('heading', { name: /Order\s+#?\w+/ })`
- Stage text: `getByText(/^Stage:/)`
- Remarks: `getByRole('textbox', { name: 'Remarks' })`
- Advance button: `getByRole('button', { name: /Advance →/ })`
- Close: `getByRole('button', { name: 'Close' })`

### Current Implementation (Selenium/Python)

The test suite uses **Selenium WebDriver** with **Firefox** as the default browser.

**Locator Strategy:**
- XPath for complex selectors (text matching, following-sibling, etc.)
- By.NAME for stable elements with `name` attributes
- By.TAG_NAME for simple table/list traversal
- By.CLASS_NAME for class-based detection

**Wait Strategy:**
- `wait_by()` — waits for element presence (useful for initial page load)
- `wait_clickable()` — waits for element to be clickable
- `wait_visible()` — waits for element to be visible
- `wait_loading_cycle()` — waits for loading animations to disappear
- Short timeouts (2s) for quick checks; default (20s) for slower interactions

**Page Object Methods** (see `admin_customer_support_page.py`):
- All element interaction encapsulated
- Chainable interface for fluent test writing
- Zero Selenium/By imports in test file

## Running Tests

### Via the provided test runner:

```bash
# List all test suites
python ui_test/run_tests.py -v --list

# Run only customer support tests
python ui_test/run_tests.py -v ui_test/pages/admin_customer_support

# Run a specific test
python ui_test/run_tests.py -v ui_test/pages/admin_customer_support/test_admin_customer_support.py::TestAdminCustomerSupportPage::test_01_page_loads_with_admin_role
```

### Via pytest directly:

```bash
# All tests in this suite
pytest ui_test/pages/admin_customer_support/test_admin_customer_support.py -v

# Specific test
pytest ui_test/pages/admin_customer_support/test_admin_customer_support.py::TestAdminCustomerSupportPage::test_19_open_order_modal -v

# Run with headless=false for visual debugging
E2E_HEADLESS=0 pytest ui_test/pages/admin_customer_support/test_admin_customer_support.py -v
```

### Via unittest:

```bash
python -m unittest ui_test.pages.admin_customer_support.test_admin_customer_support -v
```

### Prerequisites Installation:

```bash
# Install dependencies
python -m pip install -r ui_test/requirements.txt

# Optional: quick start without validation
python ui_test/run_tests.py --skip-validation
```

### Environment Variables:

```bash
# Run tests visually (debug mode)
export E2E_HEADLESS=0
pytest ui_test/pages/admin_customer_support/test_admin_customer_support.py -v

# Set custom admin credentials (if seeded differently)
export E2E_ADMIN_EMAIL="custom@admin.com"
export E2E_ADMIN_PASSWORD="custompass"

# Set frontend base URL
export BASE_URL="http://localhost:5173"
```

## Pass/Fail criteria

- All scenarios above execute without uncaught errors
- Expected UI copy renders for each case
- Stage advancement flows complete with correct validations and toasts
- Role-based visibility rules hold for both Admin and CSM users
- Mobile layout renders card UI and opens modal successfully

## Notes and known behaviors from code

- Search is client-side and debounced by 300ms; tests should wait for debounce
- Stage filtering is applied server-side via `?stage=` and client-side view filtering for CSM role
- Pagination is client-side over the loaded list; ensure enough seeded orders
- `OM_COMPLETED` is filtered out from the next-stage list in the modal
- Remarks required only for `CANCELLED_CSM` (Support role)

## Quick Reference: Page Object Methods

### Navigation & Loading
```python
page.open(base_url)                    # Navigate to Support page
page.wait_loaded()                     # Wait for page to be ready
page.is_loaded()                       # Check if page loaded
page.is_loading()                      # Check if loading animation active
page.wait_loading_cycle()              # Wait for loading to finish
```

### Search
```python
page.set_search(value)                 # Set search text (auto-debounces)
page.clear_search()                    # Clear search
page.get_search_value()                # Get current search value
page.click_search_clear_btn()          # Click × button
```

### Filtering
```python
page.set_stage_filter(stage_text)      # Set stage filter dropdown
page.get_stage_filter_options()        # Get all stage options
page.get_selected_stage_filter()       # Get current selection
```

### Table Operations
```python
page.count_table_rows()                # Count visible rows
page.get_showing_counts()              # Get (showing, total) tuple
page.get_row_stage(index)              # Get stage from row
page.get_row_order_number(index)       # Get order number from row
page.has_pagination()                  # Check if pagination visible
page.has_empty_state()                 # Check if empty state shown
```

### Pagination
```python
page.click_pagination_next()           # Go to next page
page.click_pagination_prev()           # Go to previous page
page.is_pagination_next_disabled()     # Check if next disabled
page.is_pagination_prev_disabled()     # Check if prev disabled
```

### Modal - Open/Close
```python
page.open_first_order()                # Click first Open button
page.modal_is_open()                   # Check if modal visible
page.modal_close()                     # Close modal
page.wait_for_modal_to_show_data()     # Wait for data to populate
```

### Modal - Content
```python
page.modal_get_title_text()            # Get "Order <num>" text
page.modal_get_stage_text()            # Get current stage
page.modal_get_customer_name()         # Get customer name
page.modal_get_email()                 # Get email
page.modal_has_financial_section()     # Check financials visible
page.modal_has_items_table()           # Check items table visible
page.modal_count_items()               # Count items in table
```

### Workflow
```python
page.set_remarks(text)                 # Set remarks textarea
page.clear_remarks()                   # Click clear button
page.get_remarks_value()               # Get remarks text
page.get_available_advance_stages()    # Get list of next stages
page.click_advance_to_stage(stage)     # Advance to stage
page.has_advance_button_for_stage(s)   # Check if button exists
page.is_advance_button_disabled(s)     # Check if disabled
page.advance_to_stage_with_remarks(s, r)  # Advance with remarks
```

### Mobile
```python
page.is_mobile_view()                  # Check if mobile layout
page.count_mobile_cards()              # Count card elements
page.open_first_mobile_card()          # Open first card
```

## Test Data Requirements

For comprehensive testing, seed at least 12–15 orders with:

- **Mix of stages:**
  - 2–3 in `CSM_ADDRESS_CHECK`
  - 2–3 in `CSM_CLARIFIED`
  - 2–3 in `CSM_FEEDBACK`
  - 1–2 in `CANCELLED_CSM` (with remarks)
  
- **Distinct search values:**
  - Different order numbers (e.g., ORD-001, ORD-002, etc.)
  - Different customer names
  - Different emails
  
- **Complete order details:**
  - Items with book titles, quantities, prices
  - Customer with name, email, phone, address
  - Financial info (subtotal, discount, shipping, grand total)

- **User accounts:**
  - `admin@gmail.com` (admin role)
  - `csm@gmail.com` (customer_support role)
  - `user@gmail.com` (user role, for access denial test)
