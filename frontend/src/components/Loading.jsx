import React from "react";

const Loading = ({ text = "Loading...", size = "default" }) => {
  const sizeClasses = {
    small: "w-8 h-8",
    default: "w-12 h-12",
    large: "w-16 h-16",
  };

  const textSizes = {
    small: "text-sm",
    default: "text-base",
    large: "text-lg",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl border border-white/20 dark:border-gray-700/30 transform transition-all duration-300 hover:scale-105">
        {/* Modern spinner with gradient */}
        <div className="relative">
          <div
            className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 rounded-full`}
          ></div>
          <div
            className={`${sizeClasses[size]} border-4 border-transparent rounded-full absolute top-0 left-0 animate-spin border-t-black border-r-gray-500 border-b-black border-l-gray-500`}
          ></div>

          {/* Pulsing dot in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Animated text with dots */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`text-gray-800 dark:text-gray-200 ${textSizes[size]} font-medium flex items-center gap-1`}
          >
            {text}
          </div>

          {/* Progress bar */}
          <div className="w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-black to-gray-500 rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
