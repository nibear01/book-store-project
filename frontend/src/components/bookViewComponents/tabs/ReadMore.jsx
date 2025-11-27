import React, { useState } from "react";
import PropTypes from "prop-types";

export default function ReadMore({ text = "", initial = 220 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text)
    return <span className="text-gray-500">No content available.</span>;
  if (text.length <= initial) return <span>{text}</span>;
  return (
    <span>
      {expanded ? text : `${text.slice(0, initial)}…`}{" "}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-blue-600 hover:opacity-80 text-[14px]"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </span>
  );
}

ReadMore.propTypes = { text: PropTypes.string, initial: PropTypes.number };
