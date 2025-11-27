import React, { memo } from "react";
import { useTranslation } from "react-i18next";

const DashboardTabs = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation('common');
  const tabs = [
    { key: "overview", label: t('dashboard.overview') },
    { key: "profile", label: t('dashboard.profile') },
    { key: "verification", label: t('dashboard.verification') },
    { key: "security", label: t('dashboard.security') },
  ];

  return (
    <div className="px-3 sm:px-4 pt-3 overflow-x-auto" name="dashboard_tabs_container">
      <div
        className="flex items-center gap-1 sm:gap-2 bg-gray-100/70 rounded-xl p-1 min-w-max"
        name="dashboard_tabs"
        role="tablist"
        aria-label="User dashboard sections"
      >
        {tabs.map(({ key, label }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              name={`tab_${key}`}
              id={`tab_${key}`}
              value={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-150 whitespace-nowrap ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel_${key}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default memo(DashboardTabs);
