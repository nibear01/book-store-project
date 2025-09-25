import React from "react";

const StatusTimeline = ({ steps, currentStatus, statusStyles }) => {
  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="flex items-center justify-between mt-4 relative">
      {steps.map((step, index) => {
        const isActive = index <= currentIndex;
        return (
          <div key={step} className="flex flex-col items-center relative flex-1">
            {/* Icon Circle */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
              }`}
            >
              {statusStyles[step]?.icon}
            </div>
            {/* Label */}
            <span className={`text-xs font-semibold ${isActive ? "text-green-600" : "text-gray-400"}`}>
              {step.replaceAll("_", " ")}
            </span>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`absolute top-5 left-1/2 w-full h-1 ${
                  index < currentIndex ? "bg-green-400" : "bg-gray-300"
                }`}
                style={{ zIndex: -1 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
