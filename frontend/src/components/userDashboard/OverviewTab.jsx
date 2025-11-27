import React from "react";

const OverviewTab = ({ setActiveTab }) => {
  return (
    <div className="space-y-4" name="overview_tab">
      <div className="text-sm text-gray-600" name="overview_welcome_text">
        Welcome back! Use the tabs to update your profile, verify your
        email/phone, or change your password.
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        name="overview_sections"
      >
        {/* Profile Section */}
        <div
          className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
          name="overview_profile_section"
        >
          <h3
            className="font-medium text-gray-900 mb-2"
            name="overview_profile_title"
          >
            Profile
          </h3>
          <p
            className="text-sm text-gray-600 mb-3"
            name="overview_profile_desc"
          >
            Name, email, phone, address, and profile photo.
          </p>
          <button
            name="btn_edit_profile"
            value="edit_profile"
            onClick={() => setActiveTab("profile")}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition-colors"
          >
            Edit Profile
          </button>
        </div>

        {/* Verification Section */}
        <div
          className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
          name="overview_verification_section"
        >
          <h3
            className="font-medium text-gray-900 mb-2"
            name="overview_verification_title"
          >
            Verification
          </h3>
          <p
            className="text-sm text-gray-600 mb-3"
            name="overview_verification_desc"
          >
            Verify your email and phone number for account security.
          </p>
          <button
            name="btn_manage_verification"
            value="manage_verification"
            onClick={() => setActiveTab("verification")}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900 text-sm hover:bg-gray-200 transition-colors"
          >
            Manage Verification
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
