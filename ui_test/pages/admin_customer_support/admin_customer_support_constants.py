# Admin Customer Support Page Constants
# Organized into classes for cleaner imports

class Stages:
    """CSM workflow stages"""
    ADDRESS_CHECK = "CSM_ADDRESS_CHECK"
    CLARIFIED = "CSM_CLARIFIED"
    FEEDBACK = "CSM_FEEDBACK"
    CANCELLED = "CANCELLED_CSM"
    
    ALL = [ADDRESS_CHECK, CLARIFIED, FEEDBACK, CANCELLED]
    FILTER_ALL = "All CSM Stages"


class Timeouts:
    """Wait timeouts in seconds"""
    DEFAULT = 20
    SHORT = 10
    QUICK = 2
    EXTENDED = 5


class UIText:
    """UI labels and text content"""
    PAGE_TITLE = "Customer Support Queue"
    NO_ORDERS = "No orders in queue"
    SEARCH_PLACEHOLDER = "Search order/customer"
    SEARCH_PREFIX = "ORD-"
    ACCESS_DENIED = "Access restricted to Customer Support or Admin."
    ANIMATION_CLASS = "animate-pulse"


class Messages:
    """Test messages and remarks"""
    TEST_REMARKS = "Test remarks for CSM transition"
    
    class Assert:
        PAGE_LOADED = "Customer Support page should be loaded"
        MODAL_OPEN = "Order modal should be open"
        MODAL_CLOSED = "Order modal should be closed"
        STAGE_FILTERED = "All rows should match the selected stage filter"
        MODAL_DETAILS = "Order details should be present in modal"
        ROWS_VISIBLE = "At least one order row should be visible"
    
    class Skip:
        NO_ORDERS = "No orders available to test"
        TERMINAL_STAGE = "Order is at terminal stage with no transitions"
    
    class Error:
        NO_VIEW_BUTTON = "No View/Open button found in support queue table"
        NO_STAGE_FILTER = "Stage filter not found"


class Config:
    """Configuration values"""
    DEFAULT_PAGE_SIZE = 10
    SHOWING_COUNTS_PATTERN = r"Showing\s+(\d+)\s+(?:of|to)\s+(\d+)"
