# Landing Page UI Tests - Documentation

## Overview
Comprehensive UI tests for the homepage/landing page of the bookstore application. Uses Playwright for modern async testing with explicit waits, avoiding time.sleep() polling patterns.

## Test Structure

### Files:
- **`landing_page_constants.py`** - Class-based constants (Timeouts, Selectors, UIText, Messages, etc.)
- **`test_home_page.py`** - 6 comprehensive test methods with detailed comments
- **`home_page.py`** - Page Object Model for hero section (if needed for Selenium tests)
- **`navbar.py`** - Separate navbar navigation tests

### Test Coverage (6 Tests):

#### 1. `test_hero_slider_buttons`
**Purpose**: Test hero carousel navigation  
**Validates**:
- Next button advances carousel (transform style changes)
- Previous button returns to original slide
- Uses transform comparison to detect slide changes

**Importance**: Critical for homepage hero carousel functionality

---

#### 2. `test_shop_now_button_navigates`
**Purpose**: Test Shop Now CTA button  
**Validates**:
- Button navigates to `/shop` page
- URL ends with `/shop` after click

**Importance**: Main conversion funnel - essential for e-commerce

---

#### 3. `test_categories_section_has_links_and_navigates`
**Purpose**: Test categories section display and navigation  
**Validates**:
- Categories region is present
- Category links are available and clickable
- Clicking navigates to `/categories?category=X`

**Skip Conditions**:
- Categories region not present
- No category links available

**Importance**: Product discovery and navigation

---

#### 4. `test_feature_tabs_switch_feature_on_sale_most_viewed`
**Purpose**: Test featured books tab switching  
**Validates**:
- Featured Books section loads
- Three tabs exist: Featured, On Sale, Most Viewed
- Clicking tab activates it (`bg-black` + `text-white` classes)
- Content switches between book collections

**Skip Conditions**:
- Feature section heading not found

**Importance**: Showcases different book collections, drives engagement

---

#### 5. `test_deals_of_the_week_controls`
**Purpose**: Test deals carousel navigation  
**Validates**:
- Deals section loads
- Next/Previous buttons navigate between deals
- Deal title changes when navigating
- Handles "no deals available" gracefully

**Skip Conditions**:
- Deals section not present

**Importance**: Weekly promotions and special offers showcase

---

#### 6. `test_new_releases_section_and_filters`
**Purpose**: Test new releases with genre filters  
**Validates**:
- New Releases section loads
- Genre filter buttons work (All, History, Romance, Travel)
- Filters activate on click
- Books display or "no books found" message shows

**Skip Conditions**:
- New Releases section not present

**Importance**: Showcases newest inventory, encourages exploration

---

## Constants Organization

### Import Pattern:
```python
from ui_test.pages.landing_page import landing_page_constants as C
```

### Available Classes:

#### `C.Timeouts`
```python
C.Timeouts.DEFAULT          # 20 seconds
C.Timeouts.SHORT            # 10 seconds
C.Timeouts.EXTENDED         # 15 seconds
C.Timeouts.QUICK            # 5 seconds
C.Timeouts.TRANSFORM_WAIT   # 5000 milliseconds
```

#### `C.Selectors`
```python
# Hero Section
C.Selectors.HERO_SECTION
C.Selectors.HERO_TRACK
C.Selectors.HERO_SLIDE_GROUP
C.Selectors.HERO_NEXT_BUTTON
C.Selectors.HERO_PREV_BUTTON
C.Selectors.SHOP_NOW_LINK

# Categories
C.Selectors.CATEGORIES_REGION
C.Selectors.CATEGORY_LINKS

# Featured Books
C.Selectors.FEATURED_HEADING
C.Selectors.FEATURE_TAB_BUTTON

# Deals
C.Selectors.DEALS_REGION
C.Selectors.DEALS_TITLE
C.Selectors.DEALS_NEXT_BUTTON
C.Selectors.DEALS_PREV_BUTTON

# New Releases
C.Selectors.NEW_RELEASES_HEADING
C.Selectors.NEW_RELEASES_FILTER
C.Selectors.BOOK_CARD_LINK
```

#### `C.UIText`
```python
# Hero
C.UIText.SHOP_NOW           # r"shop\s+now"
C.UIText.NEXT_SLIDE         # r"next\s+slide"
C.UIText.PREVIOUS_SLIDE     # r"previous\s+slide"

# Tabs
C.UIText.FEATURED_TAB       # "Featured"
C.UIText.ON_SALE_TAB        # "On Sale"
C.UIText.MOST_VIEWED_TAB    # "Most Viewed"

# Filters
C.UIText.FILTER_ALL         # "All"
C.UIText.FILTER_HISTORY     # "History"
C.UIText.FILTER_ROMANCE     # "Romance"
C.UIText.FILTER_TRAVEL      # "Travel"

# Active State
C.UIText.ACTIVE_BG_CLASS    # "bg-black"
C.UIText.ACTIVE_TEXT_CLASS  # "text-white"
```

#### `C.URLs`
```python
C.URLs.HOME                 # "/"
C.URLs.SHOP                 # "/shop"
C.URLs.CATEGORIES_BASE      # "/categories"
C.URLs.CATEGORIES_QUERY     # r"/categories\?category="
C.URLs.BOOK_VIEW            # "/bookview/"
```

#### `C.Messages.Assert`
```python
C.Messages.Assert.HERO_LOADED
C.Messages.Assert.TRANSFORM_CHANGED
C.Messages.Assert.TRANSFORM_RESTORED
C.Messages.Assert.SHOP_NOW_NAVIGATES
C.Messages.Assert.CATEGORIES_REGION_PRESENT
C.Messages.Assert.CATEGORY_LINK_NAVIGATES
C.Messages.Assert.FEATURE_TAB_ACTIVE
C.Messages.Assert.DEALS_CONTROLS_WORK
C.Messages.Assert.NEW_RELEASES_HEADING_PRESENT
C.Messages.Assert.FILTER_BUTTONS_CLICKABLE
C.Messages.Assert.BOOKS_OR_MESSAGE
```

#### `C.Messages.Skip`
```python
C.Messages.Skip.NO_CATEGORIES_REGION
C.Messages.Skip.NO_CATEGORY_LINKS
C.Messages.Skip.NO_FEATURED_SECTION
C.Messages.Skip.NO_DEALS_SECTION
C.Messages.Skip.NO_NEW_RELEASES_SECTION
```

#### `C.JavaScriptFunctions`
Pre-written JavaScript for Playwright `wait_for_function`:
```python
C.JavaScriptFunctions.TRANSFORM_CHANGED      # Wait for carousel transform change
C.JavaScriptFunctions.BUTTON_IS_ACTIVE       # Wait for button to get active classes
C.JavaScriptFunctions.DEALS_TITLE_CHANGED    # Wait for deals title change
```

---

## Running Tests

### Prerequisites:
```bash
# Ensure Playwright is installed
pip install playwright
playwright install firefox

# Ensure frontend is running
cd frontend
npm run dev  # Should be on http://localhost:5173
```

### Run All Landing Page Tests:
```bash
cd ui_test
python -m pytest pages/landing_page/test_home_page.py -v
```

### Run Single Test:
```bash
python -m pytest pages/landing_page/test_home_page.py::TestHomePage::test_hero_slider_buttons -v
```

### Run with Headed Browser (see it in action):
```bash
HEADLESS=0 python -m pytest pages/landing_page/test_home_page.py -v
```

### Run Navbar Tests Separately:
```bash
cd ui_test/pages/landing_page
python navbar.py
```

---

## Key Features

### ✅ Explicit Waits (No time.sleep!)
All tests use Playwright's `wait_for_function` or `wait_for` methods:
- `_wait_transform_change()` - Waits for carousel transform to change
- `_wait_for_button_active()` - Waits for tab to become active
- `_wait_deals_title_change()` - Waits for deal title to update
- `_wait_url()` - Waits for URL pattern match

**Benefits**:
- Faster test execution (no unnecessary sleeping)
- More reliable (waits only as long as needed)
- Better error messages when waits timeout

### ✅ Comprehensive Comments
Every test method has a detailed docstring explaining:
- What the test validates
- Why it's important
- Skip conditions (if any)
- Business logic context

### ✅ Class-Based Constants
- Single import line: `from ui_test.pages.landing_page import landing_page_constants as C`
- Organized by category (Timeouts, Selectors, UIText, Messages)
- IDE autocomplete support
- Easy maintenance

### ✅ Smart Skipping
Tests gracefully skip if sections are not present:
- Categories section
- Featured Books section
- Deals of the Week section
- New Releases section

This allows tests to run even if some homepage features are disabled or under development.

---

## Test Philosophy

### Playwright Over Selenium
These tests use Playwright because:
1. **Better async support** - Built for modern SPAs
2. **Auto-waiting** - Automatically waits for elements
3. **Network interception** - Can mock API calls if needed
4. **Better selectors** - CSS and role-based selectors
5. **Faster execution** - More efficient than Selenium

### Accessibility-First Selectors
Uses `get_by_role()` when possible:
- `get_by_role("button")` - Semantic, accessible
- `get_by_role("link")` - Clear intent
- `get_by_role("heading")` - Structured content
- `get_by_role("region")` - Landmark navigation

### Transform-Based Carousel Testing
Instead of comparing image content or element positions, tests use CSS transform to detect carousel movement:
```python
initial = self._hero_transform()  # "translate3d(0, 0, 0)"
# Click next
after = self._hero_transform()    # "translate3d(-100vw, 0, 0)"
self.assertNotEqual(initial, after)
```

This is:
- Fast (no screenshot comparison)
- Reliable (not affected by image loading)
- Precise (exact position tracking)

---

## Pattern Consistency

This refactoring matches the pattern established in:
- ✅ **admin_finance** - Class-based constants, detailed comments
- ✅ **admin_customer_support** - Class-based constants, detailed comments
- ✅ **admin_orders** - Class-based constants, detailed comments
- ✅ **landing_page** - **NOW UPDATED!**

---

## Troubleshooting

### Test Hangs or Timeouts
- Increase `C.Timeouts.DEFAULT` or test-specific timeouts
- Check if frontend is running on correct port
- Use `HEADLESS=0` to see what's happening

### "No X section" Skips
- Normal if that section is disabled/hidden in current frontend state
- Check homepage HTML to verify sections exist
- May need to adjust regex patterns in `C.UIText`

### Transform Not Changing
- Carousel might be animating slowly
- Increase `C.Timeouts.TRANSFORM_WAIT`
- Check CSS transitions on hero carousel

### Buttons Not Becoming Active
- CSS classes might have changed
- Update `C.UIText.ACTIVE_BG_CLASS` and `C.UIText.ACTIVE_TEXT_CLASS`
- Check button className in browser dev tools

---

## Future Enhancements

Potential improvements (not currently implemented):
1. Add visual regression testing for hero images
2. Test carousel auto-play functionality
3. Add accessibility tests (ARIA labels, keyboard navigation)
4. Test responsive breakpoints (mobile vs desktop)
5. Add performance metrics (time to interactive)
6. Test error states (API failures, slow network)

---

## Statistics

- **Files**: 4 (constants, tests, page object, navbar)
- **Tests**: 6 comprehensive
- **Constants**: 70+ organized in 7 classes
- **Lines of Code**: ~350 (tests + constants)
- **Import Lines**: 1 (vs 40+ old way)
- **Test Framework**: Playwright + unittest
- **Skip Conditions**: 5 smart skips
- **Explicit Waits**: 3 custom wait functions
- **No time.sleep()**: ✅ Replaced with wait_for_function

---

**Production Ready**: All tests refactored and documented! 🎉
