"""
Admin Orders Page Constants - Organized by Class for Easy Import

Usage:
    from ui_test.pages.admin_orders import admin_orders_constants as C
    
    # Then use as:
    C.FilterModes.WORKFLOW
    C.Stages.OM_INTAKE
    C.Messages.Assert.PAGE_LOADED
    C.Timeouts.DEFAULT
"""


class FilterModes:
    """Filter mode constants for switching between workflow and public status views"""
    WORKFLOW = "workflow"
    PUBLIC = "public"
    UNKNOWN = "unknown"


class Stages:
    """Workflow stage constants for OM (Operations Management) stages"""
    OM_INTAKE = "OM_INTAKE"
    ALL_STAGES = "All Stages"


class Status:
    """Public status constants for non-workflow order status"""
    PENDING = "Pending"
    PROCESSING = "processing"
    ALL_STATUS = "All Status"


class DateFilters:
    """Date filter constants for filtering orders by date range"""
    TODAY = "Today"
    ALL_DATES = "All Dates"


class Sort:
    """Sorting constants for order table"""
    # Sort By options
    BY_TOTAL_AMOUNT = "Total Amount"
    BY_CUSTOMER_NAME = "Customer Name"
    BY_ORDER_DATE = "Order Date"
    
    # Sort Direction options
    DIRECTION_OLDEST_FIRST = "Oldest First"
    DIRECTION_NEWEST_FIRST = "Newest First"


class Search:
    """Search-related constants"""
    QUERY_PREFIX_ORD = "ORD-"


class History:
    """History modal constants for real-time order tracking"""
    TOGGLE_LABEL_PAUSE = "Pause"
    TOGGLE_LABEL_START = "Start"


class Workflow:
    """Workflow action modal constants"""
    TEST_REMARKS = "Test remarks for workflow transition"
    ADVANCE_BUTTON_PREFIX = "workflow-actions-advance-"


class Timeouts:
    """Wait timeout durations in seconds"""
    DEFAULT = 20
    SHORT = 10
    EXTENDED = 5
    QUICK = 2


class UIText:
    """UI text labels and patterns"""
    NO_ORDERS = "no orders"
    SHOWING_COUNTS_PATTERN = r"Showing\s+(\d+)\s+of\s+(\d+)\s+orders"
    ANIMATION_CLASS_PULSE = "animate-pulse"


class Messages:
    """Test messages organized by type"""
    
    class Assert:
        """Assertion messages for test validations"""
        PAGE_LOADED = "Orders page failed to load"
        MODAL_OPEN = "Order modal should be open"
        MODAL_CLOSED = "Order modal should be closed"
        MODAL_REMAIN_OPEN_AFTER_PRINT = "Modal should remain open after print"
        MODAL_STAY_OPEN_AFTER_DISMISSING_DELETE = "Modal should stay open after dismissing delete"
        HISTORY_MODAL_OPEN = "History modal should be open"
        HISTORY_MODAL_CLOSED = "History modal should be closed"
        ACTIONS_MODAL_OPEN = "Actions modal should be open"
        ACTIONS_MODAL_CLOSED = "Actions modal should be closed"
        AT_LEAST_ONE_ADVANCE_BUTTON = "At least one advance stage button should be present"
        ORDER_VISIBLE_AFTER_STATUS_CHANGE = "Order should still be visible after status change"
        DELETE_OPERATION_COMPLETED = "Delete operation completed"
    
    class Skip:
        """Skip test messages for unavailable scenarios"""
        NO_ORDERS_FOR_DELETION = "No orders available to test deletion"
        NO_ORDERS_FOR_WORKFLOW = "No orders available to test workflow actions"
        TERMINAL_STAGE = "Order is at terminal stage with no available transitions"
    
    class Error:
        """Error messages for exception handling"""
        NO_VIEW_BUTTON = "No View button found in orders table"
        NO_HISTORY_BUTTON = "No History button found in orders table"
        NO_ACTIONS_BUTTON = "No Actions button found in orders table"
        STATUS_SELECT_NOT_FOUND = "Status select not found at row {}"
