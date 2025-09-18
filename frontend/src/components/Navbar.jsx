import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navigationLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Categories", path: "/categories" },
    { name: "Shop", path: "/shop" },
    { name: "Terms", path: "/terms" },
    { name: "Contact", path: "/contact" },
  ];

  const authLinks = [
    { name: "Login", path: "/login" },
    { name: "Sign Up", path: "/signup" },
  ];

  const { state, subtotal, removeItem, updateQuantity } = useCart();
  const cartCount = state?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                BOOK
                <span className="text-red-500">S</span>
                TOP
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-700 hover:text-[var(--hover-color)] transition-colors text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Cart + Auth (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative text-gray-700 hover:text-[var(--hover-color)] transition"
            >
              <FaShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] w-4 h-4">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* User Info */}
                <Link
                  to="/account"
                  className="flex items-center space-x-2 text-gray-700 hover:text-[var(--hover-color)]"
                >
                  {user?.profile_image ? (
                    // Ensure absolute URL if backend returns a relative path
                    (() => {
                      const src = String(user.profile_image || "");
                      const absolute = /^https?:\/\//i.test(src)
                        ? src
                        : `http://localhost:5000${
                            src.startsWith("/") ? src : `/${src}`
                          }`;
                      return (
                        <img
                          src={absolute}
                          alt="Profile"
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      );
                    })()
                  ) : (
                    <FaUser className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {user?.name || user?.email}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              /* Auth Links */
              authLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2 text-sm font-medium rounded-[2px] transition ${
                    link.name === "Sign Up"
                      ? "bg-red-500 text-white hover:bg-red-600 shadow-sm"
                      : "text-gray-700 hover:text-[var(--hover-color)]"
                  }`}
                >
                  {link.name}
                </Link>
              ))
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-[2px] text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
          <div className="px-4 pt-3 pb-4 space-y-2">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-700 p-3 hover:text-[var(--hover-color)] transition-colors text-sm font-medium"
              >
                {link.name}
              </Link>
            ))}

            <div className="border-t border-gray-200 pt-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  {/* User Info */}
                  <Link
                    to="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-gray-700 px-3 py-2 hover:text-[var(--hover-color)]"
                  >
                    {user?.profile_image ? (
                      (() => {
                        const src = String(user.profile_image || "");
                        const absolute = /^https?:\/\//i.test(src)
                          ? src
                          : `http://localhost:5000${
                              src.startsWith("/") ? src : `/${src}`
                            }`;
                        return (
                          <img
                            src={absolute}
                            alt="Profile"
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        );
                      })()
                    ) : (
                      <FaUser className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {user?.name || user?.email}
                    </span>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <FaSignOutAlt className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                authLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-3 rounded-[2px] text-sm font-medium transition ${
                      link.name === "Sign Up"
                        ? "bg-red-500 text-white hover:bg-red-600 shadow-sm"
                        : "text-gray-700 hover:text-[var(--hover-color)]"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60]">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsCartOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-[90%] sm:w-[420px] bg-white shadow-xl border-l border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Your Cart ({cartCount})</h3>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-gray-600 hover:text-black"
                aria-label="Close cart"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {state.items && state.items.length > 0 ? (
                <ul className="divide-y">
                  {state.items.map((item) => (
                    <li key={item.id} className="p-4 flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">
                            {item.title}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeItem({ id: item.id })}
                            className="text-xs text-gray-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          ${(item.price || 0).toFixed(2)}
                        </div>
                        <div className="mt-2 inline-flex items-center border">
                          <button
                            type="button"
                            className="px-2 py-1 text-sm hover:bg-gray-100"
                            onClick={() =>
                              updateQuantity({
                                id: item.id,
                                quantity: Math.max(1, item.quantity - 1),
                              })
                            }
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="px-3 text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            className="px-2 py-1 text-sm hover:bg-gray-100"
                            onClick={() =>
                              updateQuantity({
                                id: item.id,
                                quantity: item.quantity + 1,
                              })
                            }
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Your cart is empty
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-base font-semibold">
                  ${(subtotal || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate("/cart");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-[2px] text-sm hover:bg-gray-50"
                >
                  View Cart
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate("/checkout");
                  }}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-[2px] text-sm hover:bg-gray-800"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
