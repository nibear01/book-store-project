import React from "react";

const ButtonFill = ({ children }) => {
  return (
    <div>
      <button
        type="submit"
        className="cursor-pointer bg-black text-white px-6 py-3 hover:bg-gray-800 transition rounded-md"
      >
        {children}
      </button>
    </div>
  );
};

export default ButtonFill;
