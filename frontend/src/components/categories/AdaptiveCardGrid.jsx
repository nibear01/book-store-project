// AdaptiveCardGrid.jsx
import React from "react";

const AdaptiveCardGrid = ({ children, viewMode = "grid" }) => {
  const gridClass = viewMode === "grid" 
    ? "grid grid-cols-2 gap-3 sm:gap-4"
    : "flex flex-col gap-4";
  
  return (
    <div className={gridClass}>
      {children}
    </div>
  );
};

export default AdaptiveCardGrid;