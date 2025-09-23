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
      {/* Groups container - slides horizontally */}
      <div
        className="h-full flex transition-transform duration-300 ease-in-out"
        style={{
          transform: `translateX(-${activeGroupIndex * 100}%)`,
          width: `${groupCount * 100}%`,
        }}
      >
        {React.Children.map(children, (child, index) => (
          <div key={index} className="h-full w-full flex-shrink-0">
            {child}
          </div>
        ))}
      </div>

      {/* Pagination indicators */}
      {groupCount > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {Array.from({ length: groupCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => onGroupChange(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === activeGroupIndex
                  ? "bg-black w-6"
                  : "bg-gray-300 hover:bg-gray-400 w-2.5"
              }`}
              aria-label={`Go to book group ${index + 1}`}
              aria-current={index === activeGroupIndex ? "true" : "false"}
            />
          ))}
        </div>
      )}

      {/* Screen reader live region */}
      <div className="sr-only" aria-live="polite">
        Use swipe left or right to navigate between book groups
      </div>
    </div>
  );
};

export default MobileCardPager;
