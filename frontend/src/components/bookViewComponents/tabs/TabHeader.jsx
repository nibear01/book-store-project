import React, { useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { srOnly } from "./constants";

export default function TabHeader({ tabs, currentTab, setTab }) {
  const { t } = useTranslation('bookView');
  const listRef = useRef(null);

  const onKeyDown = useCallback(
    (e) => {
      const idx = tabs.findIndex((t) => t.id === currentTab);
      if (idx < 0) return;

      let nextIdx = idx;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % tabs.length;
      else if (e.key === "ArrowLeft")
        nextIdx = (idx - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") nextIdx = 0;
      else if (e.key === "End") nextIdx = tabs.length - 1;
      else return;

      e.preventDefault();
      setTab(tabs[nextIdx].id);

      const btns = listRef.current?.querySelectorAll("[role=tab]");
      btns?.[nextIdx]?.focus();
    },
    [tabs, currentTab, setTab]
  );

  return (
    <div className="relative">
      <div
        ref={listRef}
        role="tablist"
        className="bg-white backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-gray-200 flex overflow-x-auto"
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab) => {
          const selected = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(tab.id)}
              className={`relative shrink-0 px-4 sm:px-5 py-3 text-sm sm:text-base font-semibold transition
                focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40
                ${
                  selected ? "text-black" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab.labelKey ? t(tab.labelKey) : tab.label}
              <span className={srOnly}>{selected ? " (current)" : ""}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

TabHeader.propTypes = {
  tabs: PropTypes.array.isRequired,
  currentTab: PropTypes.string.isRequired,
  setTab: PropTypes.func.isRequired,
};
