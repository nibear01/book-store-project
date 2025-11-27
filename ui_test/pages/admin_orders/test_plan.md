# Admin Order Management Test Plan

## Overview
This plan documents the Admin Order Management workflow and the UI tests we maintain for it. It reflects the actual backend workflow stages, role permissions, endpoints, and the frontend admin pages and selectors currently implemented.

## Current Implementation Status

- Last updated: October 22, 2025
- Primary UI under test: `frontend/src/components/adminComponents/Order.jsx`
- Supporting workflow pages: `frontend/src/components/adminComponents/Support.jsx`, `Finance.jsx`, `Printing.jsx`, `Delivery.jsx`
- Test file here: `ui_test/pages/admin_orders/test_admin_orders_page.py`
- Total tests in this suite: 9 (see list below)
- Latest run outcome: Use pytest to confirm; previous run exited with non-zero status during development

---

## System model and workflow (source of truth)

- Internal stages (single source of truth): defined in `backend/models/order-model.js` and transitions in `backend/utils/order-workflow.js`.
- Stage list in order flow:
  - OM_INTAKE → CSM_ADDRESS_CHECK → CSM_CLARIFIED → FM_REVIEW → FM_APPROVED → PM_QUEUE → PM_PREP → PM_RUN → PM_FINISH → DM_QUEUE → DM_PACKING → DM_IN_TRANSIT → DM_OUT_FOR_DELIVERY → DM_DELIVERED → CSM_FEEDBACK → OM_COMPLETED
  - Alternative/cancellation endings: TERMINATED_OM, CANCELLED_CSM, CANCELLED_FM, FM_REJECTED
- Transition rules:
  - Allowed next stages per `WORKFLOW_TRANSITIONS`.
  - `canTransition({ current, target, userRoles })` enforces both adjacency and actor role scope; `admin` can always transition.
  - Terminal transitions require remarks (validated in controller): TERMINATED_OM, CANCELLED_CSM, CANCELLED_FM, FM_REJECTED.
  - On transition, `current_handler_role` is set to the role owning the target stage.
- Visibility rules (list/workflow endpoints):
  - `stageVisibleToRoles(stage, userRoles)` returns true for admin; globally visible for order_manager and all workflow roles; otherwise hidden.
- Public vs internal status mapping (auto-sync in model pre-save):
  - public `order_status` is derived from `internal_stage` via `mapInternalToPublic()`.
  - Key mapping: shipping states → shipped; delivered/feedback/completed → delivered; finance/printing/delivery progress → processing; cancellations → cancelled; default → pending.

---

## Backend endpoints relevant to admin

- List/admin aggregate view: GET `/api/orders/admin/all` (roles: admin, order_manager; filters: status, internal_stage, handler, search, pagination params)
- Public order detail: GET `/api/orders/details/:id` (owner or role visibility)
- Public status update: PUT `/api/orders/admin/:id/status` (admin, order_manager)
- Delete order: DELETE `/api/orders/admin/:id` (admin, order_manager)
- Import CSV: POST `/api/orders/admin/import` (admin, order_manager) [UI not present yet]
- Dashboard stats: GET `/api/orders/admin/stats` (any non-user role)
- Workflow-specific:
  - List by workflow: GET `/api/orders/workflow` (roles: admin, order_manager, customer_support, finance_manager, printing_manager, delivery_manager; supports stage/handler/date/search)
  - Get workflow order (with history): GET `/api/orders/workflow/:id`
  - Next allowed stages: GET `/api/orders/workflow/:id/next-stages`
  - Advance stage: PATCH `/api/orders/workflow/:id/advance` (requires `targetStage` and remarks if terminal)

---

## Frontend admin pages and capabilities

- Orders Management (`Order.jsx`)
  - Toggle views: Workflow vs Public Status
  - Filters: search, date, sort, and stage filter (workflow) or public status filter (public)
  - Table shows order_number, customer, totals, created (BD time), status/internal_stage
  - Actions per row:
    - View (opens OrderDetailModal)
    - History (opens WorkflowHistoryModal; workflow mode only)
    - Actions (opens WorkflowActionsModal; workflow mode only)
  - Public status is editable via select when in Public view (PUT status API)

- Workflow queues:
  - `Support.jsx` (CSM stages)
  - `Finance.jsx` (FM stages)
  - `Printing.jsx` (PM stages)
  - `Delivery.jsx` (DM stages)
  - Each lists orders for that role’s stages, with search, optional stage filter, pagination, and opens `support/WorkflowOrderModal` for advance.

---

## UI selectors used in tests (stable contract)

- Page header/title: name="orders-page-title"
- Refresh: name="orders-refresh-btn"
- Search input: name="orders-search-input"
- Workflow stage filter: name="orders-stage-filter"
- Public status filter: name="orders-status-filter"
- Date filter: name="orders-date-filter"
- Sort-by: name="orders-sort-filter"
- Sort-direction: name="orders-sort-direction"
- View toggle buttons: name="orders-view-workflow-btn", name="orders-view-public-btn"
- Showing counts: name="orders-showing-counts"
- Orders table: name="orders-table"
- Order rows: name="orders-row"
- Public status select (per-row): name="order-status-select"
- Row actions: name="orders-view-btn", name="orders-history-btn", name="orders-actions-btn"

- OrderDetailModal:
  - Title: name="order-modal-title"
  - Close (header): name="order-modal-close-btn"
  - Edit, Save: name="order-modal-edit-btn", name="order-modal-save-btn"
  - Print: name="order-modal-print-btn"
  - Delete: name="order-modal-delete-btn"

- WorkflowActionsModal:
  - Title: name="workflow-actions-title"
  - Close (header): name="workflow-actions-close-btn"
  - Close (footer): name="workflow-actions-close-footer-btn"
  - Remarks textarea: name="workflow-actions-remarks"
  - Clear remarks button: name="workflow-actions-clear-remarks"
  - Advance to stage buttons: name="workflow-actions-advance-{STAGE_NAME}" (e.g., workflow-actions-advance-CSM_ADDRESS_CHECK)

- WorkflowHistoryModal:
  - Title: name="workflow-history-title"
  - Refresh: name="workflow-history-refresh-btn"
  - Start/Pause: name="workflow-history-toggle-btn"
  - Close: name="workflow-history-close-btn"

---

## Tests currently implemented in this suite (15)

1) Page loads and shows table or empty state: `test_orders_page_loads`
2) Refresh and view toggles (Workflow/Public) update UI: `test_refresh_and_toggles`
3) Search and clear maintain non-negative rows: `test_search_filters`
4) Filters and sorting (stage/status/date/sort fields): `test_filters_and_sorting`
5) Open/close order modal: `test_open_close_order_modal`
6) Edit and save customer info inside modal: `test_edit_customer_info`
7) Print order from modal (window.print stubbed): `test_print_order`
8) Delete order dismisses confirmation (no delete): `test_delete_order_dismiss`
9) Workflow history modal open/refresh/toggle/close: `test_history_modal`
10) **NEW:** Workflow actions modal open/close: `test_workflow_actions_modal_open_close`
11) **NEW:** Workflow actions remarks field input/clear: `test_workflow_actions_remarks_field`
12) **NEW:** Workflow actions advance stage buttons present: `test_workflow_actions_advance_stage_buttons`
13) **NEW:** Public status update via select dropdown: `test_public_status_update_via_select`
14) **NEW:** Delete order with confirmation accept: `test_delete_order_confirm_accept`

Note: Tests run against the Orders Management page only. Role-specific queue pages have their own potential suites to be added.

---

## High-value gaps and proposed new tests

- **PARTIALLY IMPLEMENTED:** Workflow actions (advance stage) via WorkflowActionsModal
  - ✅ Modal open/close test added
  - ✅ Remarks field input/clear test added
  - ✅ Stage button presence verification added
  - ⚠️ TODO: Full end-to-end advance flow tests with API validation (one per role):
    - OM_INTAKE → CSM_ADDRESS_CHECK (order_manager)
    - CSM_ADDRESS_CHECK → CSM_CLARIFIED (customer_support)
    - CSM_CLARIFIED → FM_REVIEW (customer_support)
    - FM_REVIEW → FM_APPROVED and FM_REVIEW → FM_REJECTED (finance_manager)
    - FM_APPROVED → PM_QUEUE (printing_manager)
    - PM_FINISH → DM_QUEUE (printing_manager)
    - DM_OUT_FOR_DELIVERY → DM_DELIVERED (delivery_manager)
    - DM_DELIVERED → CSM_FEEDBACK → OM_COMPLETED
  - ⚠️ TODO: Terminal transitions with missing remarks should show validation error
  - ⚠️ TODO: After advancing, verify `internal_stage`, `current_handler_role`, and public `order_status` mapping updated

- Permissions/visibility
  - ⚠️ TODO: Non-admin without relevant role cannot see or operate on certain stages (403 checks mirrored via UI error toasts)
  - ⚠️ TODO: Admin override can view/advance any stage

- Next-stage helper
  - ⚠️ TODO: GET `/orders/workflow/:id/next-stages` returns allowed set by role; UI buttons reflect same

- **IMPLEMENTED:** Public status update select (Public view)
  - ✅ Change status via dropdown test added
  - ⚠️ TODO: Verify backend persistence and subsequent refetch correctness

- **IMPLEMENTED:** Deletion confirm path
  - ✅ Accept the confirmation and verify order row removal test added

- CSV import (backend present, UI not yet)
  - ⚠️ TODO: When a UI is introduced, add tests to upload CSV and verify counts

---

## Test data guidance

- Prepare at least 6–10 orders spanning early, mid, and late stages.
- Include at least one cancellable scenario to exercise terminal transitions (with remarks).
- Ensure items include `book_title` snapshot and totals for table rendering.
- Test users/roles: admin, order_manager, customer_support, finance_manager, printing_manager, delivery_manager.

---

## Run instructions

Use either unittest or pytest. Examples:

```bash
# Run only this suite
pytest ui_test/pages/admin_orders/test_admin_orders_page.py -v

# Or via unittest
python -m unittest ui_test.pages.admin_orders.test_admin_orders_page -v
```

---

## Priorities

- P0: Page load, refresh/toggles, history modal open/close, public status updates, deletion confirm path, one end-to-end advance path from OM_INTAKE to OM_COMPLETED.
- P1: Role-specific advance tests for Support/Finance/Printing/Delivery.
- P2: Negative/permission cases and missing-remarks validation for terminal transitions.
- P3: CSV import UI (when added), dashboard stats smoke test.

---

## Notes

- The Orders page toggles between Workflow and Public views; role tabs are not present.
- Public status is a simplified view; internal workflow is the authority for lifecycle and visibility. Keep tests aligned to this model.

## Architecture 

Test File (test_admin_orders_page.py)
├──  NO Selenium imports
├──  NO direct driver access
├──  Only page object method calls
└──  Only constants imported

Page Object (admin_orders_page.py)
├──  ALL Selenium imports here
├──  ALL driver interactions
├──  ALL element locators
└──  ALL wait logic

Constants (admin_orders_constants.py)
├──  ALL hardcoded strings
├──  ALL timeout values
└──  ALL messages