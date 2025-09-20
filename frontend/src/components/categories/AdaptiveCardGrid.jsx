import React from "react";

const AdaptiveCardGrid = ({ children }) => (
  <div className="adaptive-card-grid w-full h-full">
    <div className="grid grid-cols-2 gap-4 w-full h-full">{children}</div>
  </div>
);

export default AdaptiveCardGrid;
