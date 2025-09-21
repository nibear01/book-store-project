import React from "react";

const Popup = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100]">
      <div className="bg-green-600 text-white px-6 py-3 rounded shadow-lg flex items-center gap-2">
        <span>{message}</span>
        <button className="ml-4 px-2 py-1 bg-white/20 rounded hover:bg-white/30" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Popup;
