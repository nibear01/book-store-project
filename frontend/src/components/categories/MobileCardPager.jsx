import React, { useRef } from "react";

const MobileCardPager = ({
  children,
  activeGroupIndex,
  groupCount,
  onGroupChange,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) => {
  const viewportRef = useRef(null);

  return (
    <div
      className="mobile-card-pager h-full w-full overflow-hidden relative"
      ref={viewportRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-roledescription="swipeable book groups"
      aria-label={`Book groups, swipe left or right to navigate`}
    >
      {/* Viewport container - ensures full screen coverage */}
      <div className="h-full w-full">
        {/* Groups container - slides horizontally */}
        <div
          className="h-full w-full flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${activeGroupIndex * 100}%)`,
            width: `${groupCount * 100}%`,
          }}
        >
          {children}
        </div>
      </div>

      {/* Pagination indicators */}
      {groupCount > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {Array.from({ length: groupCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => onGroupChange(index)}
              className={`w-2.5 h-2.5 rounded-[2px] transition-all ${
                index === activeGroupIndex
                  ? "bg-black w-3.5"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to book group ${index + 1}`}
              aria-current={index === activeGroupIndex ? "true" : "false"}
            />
          ))}
        </div>
      )}

      {/* Keyboard navigation hints */}
      <div className="sr-only" aria-live="polite">
        Use left and right arrow keys to navigate between book groups
      </div>
    </div>
  );
};

export default MobileCardPager;
