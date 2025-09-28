import React from "react";
import { Link } from "react-router-dom";

const TopNavbar = () => {
  return (
    <div className="w-full border-b border-gray-200 bg-white text-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <nav
        aria-label="Top navigation"
        className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-2 px-3 py-2 sm:px-4 md:grid-cols-3"
      >
        {/* Middle (promo) shown first on mobile */}
        <div className="order-1 flex items-center justify-center md:order-2">
          <p className="truncate text-center text-[9px] text-gray-600 dark:text-gray-400 sm:text-[12px]">
            Free Shipping on orders over 2000!
          </p>
        </div>

        {/* Left */}
        <div className="order-2 flex items-center justify-center md:order-1 md:justify-start">
          <p className="truncate text-gray-700 dark:text-gray-300">
            Welcome to the bookshop
          </p>
        </div>

        {/* Right */}
        <div className="order-3 -mx-1 flex items-center justify-center gap-1 overflow-x-auto md:mx-0 md:justify-end md:gap-4">
          <Link
            to="/marketing"
            className="shrink-0 rounded px-2 py-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring dark:text-gray-400 dark:hover:text-gray-200"
          >
            Marketing
          </Link>
          <span className="hidden h-4 w-px bg-gray-200 md:block dark:bg-gray-700" />
          <Link
            to="/distribution"
            className="shrink-0 rounded px-2 py-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring dark:text-gray-400 dark:hover:text-gray-200"
          >
            Book distribution
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default TopNavbar;
