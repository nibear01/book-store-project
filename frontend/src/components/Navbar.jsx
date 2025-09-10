import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon } from "@heroicons/react/24/outline";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Categories", path: "/categories" },
    { name: "Shop", path: "/shop" },
    { name: "Terms and Conditions", path: "/terms" },
    { name: "Contact Us", path: "/contact" },
  ];

  const authLinks = [
    { name: "Login", path: "/login" },
    { name: "Sign Up", path: "/signup" },
  ];

  return (
    <nav className="bg-white border-b border-pink-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Hamburger Menu */}
          <div className="flex items-center">
            <button
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 ml-4">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                BOOK
                <span className="text-red-500">
                  S
                  <div className="absolute -top-1 left-0 w-full h-0.5 bg-red-500"></div>
                  <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-red-500"></div>
                </span>
                TOP
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigationLinks.map((link) => (
                <div key={link.name} className="relative group">
                  <Link
                    to={link.path}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center"
                  >
                    {link.name}
                    <svg
                      className="ml-1 h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Auth Links */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            {authLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  link.name === "Sign Up"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-700 hover:text-gray-900 block px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-2">
              {authLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    link.name === "Sign Up"
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
