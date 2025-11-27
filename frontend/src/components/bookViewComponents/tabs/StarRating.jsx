import React from "react";
import PropTypes from "prop-types";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export default function StarRating({ value = 0 }) {
  const safe = Number.isFinite(value) ? value : 0;
  const full = Math.floor(safe);
  const half = safe % 1 >= 0.5;
  const icons = [];

  for (let i = 0; i < full && icons.length < 5; i++) {
    icons.push(<FaStar key={`f-${i}`} className="text-yellow-500" />);
  }
  if (half && icons.length < 5)
    icons.push(<FaStarHalfAlt key="h" className="text-yellow-500" />);
  while (icons.length < 5)
    icons.push(
      <FaRegStar key={`e-${icons.length}`} className="text-yellow-500" />
    );

  return (
    <div
      className="inline-flex items-center gap-1"
      aria-label={`Rating ${safe.toFixed(1)} out of 5`}
    >
      {icons}
    </div>
  );
}

StarRating.propTypes = { value: PropTypes.number };
