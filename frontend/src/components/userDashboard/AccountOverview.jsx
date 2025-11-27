import React from "react";

const AccountOverview = ({ form, emailVerified }) => {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
      name="account_overview_userdashboard"
    >
      <h2 className="text-sm font-semibold text-gray-800 mb-4">
        Account Overview
      </h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <span className="text-gray-600">Email</span>
          <span className="text-gray-900 flex items-center gap-2">
            <span className="truncate max-w-[150px] sm:max-w-none" name="overview_email_value_userdashboard">
              {form.email || "—"}
            </span>
            {emailVerified && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium"
                title="Email is verified"
                name="overview_email_verified_badge"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 1 0-1.414 1.414l2 2c.39.39 1.024.39 1.414 0l4-4Z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified
              </span>
            )}
          </span>
        </div>
        <div className="flex justify-between pb-3 border-b border-gray-100">
          <span className="text-gray-600">Phone</span>
          <span className="text-gray-900 truncate max-w-[60%]" name="overview_phone_value">
            {form.phone || "—"}
          </span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-gray-600">Address</span>
          <span
            className="text-gray-900 max-w-[60%] text-right truncate"
            title={form.address}
            name="overview_address_value"
          >
            {form.address || "—"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccountOverview;
