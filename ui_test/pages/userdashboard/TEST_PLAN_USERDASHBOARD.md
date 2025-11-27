# User Dashboard Test Plan

## Overview
This test plan covers automated UI testing for the User Dashboard functionality. Tests will be executed using Selenium WebDriver with the Page Object Model (POM) pattern.

## Test Scope

### Components Under Test
- **ProfileHeader**: User profile header with avatar and information
- **AccountOverview**: Sidebar account summary panel
- **DashboardTabs**: Tab navigation (Overview, Profile, Verification, Security)
- **OverviewTab**: Dashboard landing page
- **ProfileTab**: Profile editing functionality
- **SecurityTab**: Password change functionality

### Pre-requisites
- A new user account must be created before running UserDashboard tests
- User must be logged in to access the dashboard
- Backend API must be running and accessible

## Test Strategy

### Setup Phase
1. **User Registration** (via Signup flow)
   - Create a unique test user with valid credentials
   - Store credentials for login

2. **User Login**
   - Login with the created test user
   - Navigate to User Dashboard (`/account`)

### Test Categories

---

## 1. Navigation & UI Tests

### ✅ DONE - `test_dashboard_loads_successfully`
**Purpose**: Verify dashboard loads with all essential elements  
**Steps**:
1. Navigate to `/account`
2. Wait for dashboard to load
3. Verify ProfileHeader is visible
4. Verify AccountOverview panel is visible
5. Verify DashboardTabs are visible
6. Verify default "Overview" tab is active

**Expected**: All elements present and visible

---

### ✅ DONE - `test_tab_navigation`
**Purpose**: Verify all tabs are clickable and switch correctly  
**Steps**:
1. Click on "Profile" tab
2. Verify Profile tab content is displayed
3. Click on "Verification" tab  
4. Verify Verification tab content is displayed
5. Click on "Security" tab
6. Verify Security tab content is displayed
7. Click back to "Overview" tab
8. Verify Overview tab content is displayed

**Expected**: Tab switching works smoothly, active tab highlighted

---

### ✅ DONE - `test_account_overview_displays_user_data`
**Purpose**: Verify user data is displayed correctly in overview panel  
**Steps**:
1. Load dashboard
2. Locate AccountOverview panel
3. Verify email is displayed
4. Verify phone is displayed (or "—" if not set)
5. Verify address is displayed (or "—" if not set)

**Expected**: User data matches created account

---

## 2. Profile Edit Tests

### ✅ DONE - `test_edit_profile_name`
**Purpose**: Verify user can update their name  
**Steps**:
1. Navigate to "Profile" tab
2. Clear and enter new name
3. Click "Save Changes"
4. Wait for toast success notification
5. Navigate to "Overview" tab
6. Verify ProfileHeader shows updated name

**Expected**: Name updates successfully with toast notification

---

### ✅ DONE - `test_edit_profile_phone`
**Purpose**: Verify user can update their phone number  
**Steps**:
1. Navigate to "Profile" tab
2. Clear and enter new phone number (valid format)
3. Click "Save Changes"
4. Wait for toast success notification
5. Navigate to "Overview" tab
6. Verify AccountOverview shows updated phone

**Expected**: Phone updates successfully

---

### ✅ DONE - `test_edit_profile_address`
**Purpose**: Verify user can update their address  
**Steps**:
1. Navigate to "Profile" tab
2. Clear and enter new address
3. Click "Save Changes"
4. Wait for toast success notification
5. Navigate to "Overview" tab
6. Verify AccountOverview shows updated address

**Expected**: Address updates successfully

---

### ✅ DONE - `test_edit_profile_cancel_button`
**Purpose**: Verify cancel button discards changes  
**Steps**:
1. Navigate to "Profile" tab
2. Change name to something different
3. Click "Cancel" button
4. Verify returned to "Overview" tab
5. Go back to "Profile" tab
6. Verify name field still has original value

**Expected**: Changes discarded, no save occurs

---

### ✅ DONE - `test_profile_image_upload`
**Purpose**: Verify user can upload a profile image  
**Steps**:
1. Navigate to "Profile" tab
2. Upload a test image file (PNG/JPG)
3. Verify preview appears
4. Click "Save Changes"
5. Wait for success toast
6. Verify ProfileHeader shows uploaded image

**Expected**: Image uploads and displays correctly

---

## 3. Security/Password Tests

### ✅ DONE - `test_change_password_success`
**Purpose**: Verify user can successfully change password  
**Steps**:
1. Navigate to "Security" tab
2. Enter current password
3. Enter new valid password (8+ chars)
4. Confirm new password (matching)
5. Click "Update Password"
6. Wait for success toast notification
7. Verify form fields are cleared

**Expected**: Password changes successfully

---

### ✅ DONE - `test_change_password_incorrect_current`
**Purpose**: Verify error when current password is wrong  
**Steps**:
1. Navigate to "Security" tab
2. Enter incorrect current password
3. Enter new password
4. Confirm new password
5. Click "Update Password"
6. Wait for error toast

**Expected**: Error toast: "Current password is incorrect"

---

### ✅ DONE - `test_change_password_mismatch`
**Purpose**: Verify validation when passwords don't match  
**Steps**:
1. Navigate to "Security" tab
2. Enter current password
3. Enter new password
4. Enter different confirmation password
5. Click "Update Password"
6. Wait for error toast

**Expected**: Error toast: "New passwords do not match"

---

### ✅ DONE - `test_change_password_too_short`
**Purpose**: Verify validation for password length  
**Steps**:
1. Navigate to "Security" tab
2. Enter current password
3. Enter new password with < 8 characters
4. Confirm new password
5. Click "Update Password"
6. Wait for error toast

**Expected**: Error toast: "New password must be at least 8 characters"

---

### ✅ DONE - `test_change_password_same_as_current`
**Purpose**: Verify error when new password equals current  
**Steps**:
1. Navigate to "Security" tab
2. Enter current password
3. Enter same password as new password
4. Confirm new password
5. Click "Update Password"
6. Wait for error toast

**Expected**: Error toast: "New password must be different from current password"

---

## 4. Email & Phone Verification Tests

### ⏭️ SKIPPED - Email Verification Tests
- `test_send_email_otp`
- `test_verify_email_otp_success`
- `test_verify_email_otp_invalid_code`
- `test_email_already_verified_message`

**Reason**: As per requirement, email/phone verification tests are not included in this phase.

---

### ⏭️ SKIPPED - Phone Verification Tests
- `test_send_phone_otp`
- `test_verify_phone_otp_success`
- `test_verify_phone_otp_invalid_code`
- `test_phone_already_verified_message`

**Reason**: As per requirement, email/phone verification tests are not included in this phase.

---

## 5. Responsive Design Tests

### ✅ DONE - `test_mobile_view_tabs_scroll`
**Purpose**: Verify tabs scroll horizontally on mobile  
**Steps**:
1. Set viewport to mobile size (375x667)
2. Load dashboard
3. Verify tabs container is scrollable
4. All tabs are accessible

**Expected**: Tabs scroll horizontally on mobile, all tabs accessible

---

### ✅ DONE - `test_desktop_view_layout`
**Purpose**: Verify layout on desktop  
**Steps**:
1. Set viewport to desktop size (1920x1080)
2. Load dashboard
3. Verify two-column layout (sidebar + main content)
4. Verify tabs display in single row

**Expected**: Desktop layout displays correctly

---

## 6. Error Handling & Edge Cases

### ✅ DONE - `test_required_field_validation`
**Purpose**: Verify required fields cannot be empty  
**Steps**:
1. Navigate to "Profile" tab
2. Clear the "Name" field
3. Click "Save Changes"
4. Verify error toast or validation message

**Expected**: Form validation prevents saving empty required fields

---

### ✅ DONE - `test_profile_refresh_persists_data`
**Purpose**: Verify data persists after page refresh  
**Steps**:
1. Update profile with new data
2. Save successfully
3. Refresh the page
4. Verify updated data is still displayed

**Expected**: Updated data persists across page refresh

---

## Test Execution Guidelines

### Setup Rules
1. Always create a fresh test user before running the suite
2. Store user credentials in test class variables
3. Login once in `setUpClass`, logout in `tearDownClass`
4. Each test should be independent (use `setUp` to navigate to dashboard)

### Best Practices
1. **Use WebDriverWait** - Never use `time.sleep()`
2. **Use assertTrue** - For all assertions
3. **Follow POM** - Keep locators in page object, actions in page methods, tests in test file
4. **Explicit Waits** - Wait for elements to be present/clickable before interaction
5. **Toast Notifications** - Wait for toast messages to verify success/error states
6. **Cleanup** - Reset to original state if test modifies data

### File Structure
```
ui_test/pages/userdashboard/
├── test_userdashboard.py          # Test cases
├── page_userdashboard.py          # Page Object Model
├── base_userdashboard.py          # Helper methods & common actions
└── TEST_PLAN_USERDASHBOARD.md     # This file
```

---

## Test Data Requirements

### User Credentials
- **Email**: Generated via `unique_email()`
- **Phone**: Generated via `unique_phone()`
- **Password**: Generated via `unique_password()`
- **Name**: Generated via `unique_name()`
- **Address**: Generated via `unique_address()`

### Profile Update Data
- **New Name**: Use `unique_name()`
- **New Phone**: Use `unique_phone()` with different prefix
- **New Address**: Use `unique_address()`

### Password Test Data
- **Valid Password**: 8+ characters
- **Short Password**: 5-7 characters
- **Incorrect Password**: Random string not matching current

### Image Upload
- **Valid Image**: PNG/JPG file (< 5MB)
- **Test Image Path**: `ui_test/test_data/test_profile.jpg`

---

## Expected Results Summary

| Test Category | Total Tests | Done | Skipped |
|---------------|-------------|------|---------|
| Navigation & UI | 3 | 3 | 0 |
| Profile Edit | 5 | 5 | 0 |
| Security/Password | 5 | 5 | 0 |
| Email/Phone Verification | 8 | 0 | 8 |
| Responsive Design | 2 | 2 | 0 |
| Error Handling | 2 | 2 | 0 |
| **TOTAL** | **25** | **17** | **8** |

---

## Test Execution Command

```bash
# Run all UserDashboard tests
python -m pytest ui_test/pages/userdashboard/test_userdashboard.py -v

# Run specific test
python -m pytest ui_test/pages/userdashboard/test_userdashboard.py::TestUserDashboard::test_dashboard_loads_successfully -v

# Run with detailed output
python -m pytest ui_test/pages/userdashboard/test_userdashboard.py -v -s
```

---

## Notes
- Email and phone verification tests will be implemented in a future phase
- All tests use toast notifications for success/error feedback (no inline alerts)
- Tests are designed to be run independently or as a suite
- Mobile responsiveness tests verify Tailwind CSS responsive classes work correctly

---

**Last Updated**: December 2024  
**Status**: Ready for Implementation
