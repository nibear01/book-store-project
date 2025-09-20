import React from "react";

const ViewToggle = ({ currentView, onViewChange }) => (
  <div className="flex bg-gray-100 rounded-[2px] p-1">
    <button
      onClick={() => onViewChange("grid")}
      className={`flex-1 py-1.5 rounded-[2px] text-sm font-medium transition-colors ${
        currentView === "grid"
          ? "bg-white shadow-sm text-gray-900"
          : "text-gray-600 hover:text-gray-900"
      }`}
      aria-pressed={currentView === "grid"}
      aria-label="Grid view"
    >
      <svg
        className="h-5 w-5 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2-2-2v-2z"
        />
      </svg>
    </button>
    <button
      onClick={() => onViewChange("list")}
      className={`flex-1 py-1.5 rounded-[2px] text-sm font-medium transition-colors ${
        currentView === "list"
          ? "bg-white shadow-sm text-gray-900"
          : "text-gray-600 hover:text-gray-900"
      }`}
      aria-pressed={currentView === "list"}
      aria-label="List view"
    >
      <svg
        className="h-5 w-5 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4 6h16M4 10h16M4 14h16M4 18h16"
        />
      </svg>
    </button>
  </div>
);

export default ViewToggle;
