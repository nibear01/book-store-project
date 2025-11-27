# Admin Finance Page Constants
# Organized into classes for cleaner imports

class Stages:
    """Finance Manager workflow stages"""
    REVIEW = "FM_REVIEW"
    APPROVED = "FM_APPROVED"
    REJECTED = "FM_REJECTED"
    CANCELLED = "CANCELLED_FM"
    
    ALL = [REVIEW, APPROVED, REJECTED, CANCELLED]
    FILTER_ALL = "All Finance Stages"
    TERMINAL_STAGES = {REJECTED, CANCELLED}  # Stages requiring remarks


class Timeouts:
    """Wait timeouts in seconds"""
    DEFAULT = 20
    SHORT = 10
    QUICK = 2
    EXTENDED = 5


class UIText:
    """UI labels and text content"""
    PAGE_TITLE = "Finance Workflow"
    SUBTITLE = "Payment review and approval / rejection."
    NO_ORDERS = "No orders"
    SEARCH_PLACEHOLDER = "Search order/customer"
    SEARCH_PREFIX = "ORD-"
    ACCESS_DENIED = "Access restricted to Finance Manager or Admin."
    ANIMATION_CLASS = "animate-pulse"
    REFRESH_BTN = "Refresh"
    OPEN_BTN = "Open"
    CLOSE_BTN = "Close"
    CLEAR_BTN = "Clear"


class Messages:
    """Test messages and remarks"""
    TEST_REMARKS = "Test remarks for finance workflow transition"
    
    class Assert:
        PAGE_LOADED = "Finance page should be loaded"
        MODAL_OPEN = "Order modal should be open"
        MODAL_CLOSED = "Order modal should be closed"
        STAGE_FILTERED = "All rows should match the selected stage filter"
        MODAL_DETAILS = "Order details should be present in modal"
        ROWS_VISIBLE = "At least one order row should be visible"
        ADVANCE_SUCCESS = "Order should be advanced to next stage"
        FINANCIALS_VISIBLE = "Financial details should be visible in modal"
    
    class Skip:
        NO_ORDERS = "No orders available to test"
        TERMINAL_STAGE = "Order is at terminal stage with no transitions"
        NO_FINANCE_ROLE = "User does not have Finance Manager role"
    
    class Error:
        NO_OPEN_BUTTON = "No Open button found in finance table"
        NO_STAGE_FILTER = "Stage filter not found"
        MODAL_NOT_OPENED = "Modal failed to open"


class Config:
    """Configuration values"""
    DEFAULT_PAGE_SIZE = 10
    SHOWING_COUNTS_PATTERN = r"Showing\s+(\d+)\s+of\s+(\d+)"
