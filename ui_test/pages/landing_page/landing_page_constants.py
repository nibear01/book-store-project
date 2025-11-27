"""
Landing Page (Home Page) Constants - Organized by Class for Easy Import

Usage:
    from ui_test.pages.landing_page import landing_page_constants as C
    
    # Then use as:
    C.Timeouts.DEFAULT
    C.Selectors.HERO_SECTION
    C.Messages.Assert.HERO_LOADED
    C.UIText.SHOP_NOW
"""


class Timeouts:
    """Wait timeout durations in seconds/milliseconds"""
    DEFAULT = 20  # Default wait time in seconds
    SHORT = 10    # Short wait for quick operations
    EXTENDED = 15 # Extended wait for slower sections
    QUICK = 5     # Quick operations timeout
    TRANSFORM_WAIT = 5000  # Milliseconds for transform changes


class Selectors:
    """CSS/XPath selectors and Playwright locator patterns"""
    # Hero Section
    HERO_SECTION = "section[aria-roledescription='carousel']"
    HERO_TRACK = "section[aria-roledescription='carousel'] div:has(> div[role='group'])"
    HERO_SLIDE_GROUP = "section[aria-roledescription='carousel'] [role='group']"
    HERO_NEXT_BUTTON = "button[aria-label='Next slide']"
    HERO_PREV_BUTTON = "button[aria-label='Previous slide']"
    SHOP_NOW_LINK = "section[aria-roledescription='carousel'] a[href='/shop']"
    
    # Categories Section
    CATEGORIES_REGION = "region"  # With aria-label matching "categories"
    CATEGORY_LINKS = "a[href*='/categories'][href*='category=']"
    
    # Featured Books Section
    FEATURED_HEADING = "heading"  # With name matching "featured books"
    FEATURE_TAB_BUTTON = "button"  # Role-based
    
    # Deals Section
    DEALS_REGION = "region"  # With aria-label matching "deals"
    DEALS_TITLE = "h3"
    DEALS_NEXT_BUTTON = "button"  # With name matching "next"
    DEALS_PREV_BUTTON = "button"  # With name matching "prev"
    
    # New Releases Section
    NEW_RELEASES_HEADING = "heading"  # With name matching "new releases"
    NEW_RELEASES_FILTER = "button"  # Filter buttons
    BOOK_CARD_LINK = "a[href*='/bookview/']"


class UIText:
    """UI text labels, patterns, and messages"""
    # Hero Section
    SHOP_NOW = r"shop\s+now"
    NEXT_SLIDE = r"next\s+slide"
    PREVIOUS_SLIDE = r"previous\s+slide"
    
    # Categories
    CATEGORIES = r"categories"
    
    # Featured Books
    FEATURED_BOOKS = r"featured\s+books"
    FEATURED_TAB = "Featured"
    ON_SALE_TAB = "On Sale"
    MOST_VIEWED_TAB = "Most Viewed"
    
    # Deals
    DEALS_OF_THE_WEEK = r"deals\s+of\s+the\s+week"
    NO_DEALS_AVAILABLE = r"no\s+deals\s+available"
    NEXT = r"next"
    PREV_PREVIOUS = r"prev|previous"
    
    # New Releases
    NEW_RELEASES = r"new\s+releases"
    NO_BOOKS_FOUND = r"no\s+books\s+found"
    
    # Filter Options
    FILTER_ALL = "All"
    FILTER_HISTORY = "History"
    FILTER_ROMANCE = "Romance"
    FILTER_TRAVEL = "Travel"
    
    # CSS Classes for active state
    ACTIVE_BG_CLASS = "bg-black"
    ACTIVE_TEXT_CLASS = "text-white"


class URLs:
    """URL patterns and paths"""
    HOME = "/"
    SHOP = "/shop"
    CATEGORIES_BASE = "/categories"
    CATEGORIES_QUERY = r"/categories\?category="
    BOOK_VIEW = "/bookview/"


class Messages:
    """Test messages organized by type"""
    
    class Assert:
        """Assertion messages for test validations"""
        HERO_LOADED = "Hero carousel section should be loaded"
        TRANSFORM_CHANGED = "Next should change hero track transform"
        TRANSFORM_RESTORED = "Prev should restore the initial hero slide"
        SHOP_NOW_NAVIGATES = "Shop Now button should navigate to /shop"
        CATEGORIES_REGION_PRESENT = "Categories region should be present"
        CATEGORY_LINK_NAVIGATES = "Category link should navigate to categories page"
        FEATURE_TAB_ACTIVE = "Feature tab should be active after click"
        DEALS_CONTROLS_WORK = "Deals controls should change displayed deal"
        NEW_RELEASES_HEADING_PRESENT = "New Releases heading should be present"
        FILTER_BUTTONS_CLICKABLE = "No New Releases filter buttons clickable"
        BOOKS_OR_MESSAGE = "Should show books or 'no books found' message"
    
    class Skip:
        """Skip test messages for unavailable scenarios"""
        NO_CATEGORIES_REGION = "Categories region not present"
        NO_CATEGORY_LINKS = "No category links available to click"
        NO_FEATURED_SECTION = "Feature section heading not found"
        NO_DEALS_SECTION = "Deals of the Week section not present"
        NO_NEW_RELEASES_SECTION = "New Releases heading not found"


class JavaScriptFunctions:
    """JavaScript functions for Playwright wait_for_function"""
    
    # Check if transform style has changed
    TRANSFORM_CHANGED = """
        (prev) => {
            const el = document.querySelector("section[aria-roledescription='carousel'] div:has(> div[role='group'])");
            if (!el) return false;
            const style = el.getAttribute('style') || '';
            return style && style !== prev;
        }
    """
    
    # Check if a button with specific text is active (has black bg and white text)
    BUTTON_IS_ACTIVE = """
        (targetName) => {
            const name = String(targetName).trim().toLowerCase();
            const buttons = Array.from(document.querySelectorAll('button'));
            const btn = buttons.find(b => (b.innerText || '').trim().toLowerCase() === name);
            if (!btn) return false;
            const cls = btn.className || '';
            return cls.includes('bg-black') && cls.includes('text-white');
        }
    """
    
    # Check if deals title has changed
    DEALS_TITLE_CHANGED = """
        (prev) => {
            const regions = Array.from(document.querySelectorAll('[role=region]'));
            const reg = regions.find(r => {
                const al = (r.getAttribute('aria-label') || '').toLowerCase();
                const txt = (r.innerText || '').toLowerCase();
                return al.includes('deals') || txt.includes('deals of the week');
            });
            if (!reg) return false;
            const h3 = reg.querySelector('h3');
            const txt = h3 ? (h3.innerText || '').trim() : '';
            return txt && txt !== prev;
        }
    """
