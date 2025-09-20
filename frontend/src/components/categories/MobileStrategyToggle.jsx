import React from "react";

const MobileStrategyToggle = ({
  isMobile,
  mobileViewStrategy,
  onStrategyChange,
}) => {
  if (!isMobile) return null;

  return (
    <div className="mb-4">
      <div className="text-sm font-medium text-gray-700 mb-2">Mobile View:</div>
      <div className="flex bg-gray-100 rounded-[2px] p-1">
        <button
          onClick={() => onStrategyChange("adaptive")}
          className={`flex-1 py-1.5 rounded-[2px] text-sm font-medium transition-colors ${
            mobileViewStrategy === "adaptive"
              ? "bg-white shadow-sm text-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
          aria-pressed={mobileViewStrategy === "adaptive"}
        >
          Adaptive Grid
        </button>
        <button
          onClick={() => onStrategyChange("carousel")}
          className={`flex-1 py-1.5 rounded-[2px] text-sm font-medium transition-colors ${
            mobileViewStrategy === "carousel"
              ? "bg-white shadow-sm text-gray-900"
              : "text-gray-600 hover:text-gray-900"
          }`}
          aria-pressed={mobileViewStrategy === "carousel"}
        >
          Swipe Pager
        </button>
      </div>
    </div>
  );
};

export default MobileStrategyToggle;
