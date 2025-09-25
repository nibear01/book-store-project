import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, activeRole, switchRole } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRolesOpen, setIsRolesOpen] = useState(false);
  const rolesCloseTimer = useRef(null);
  const containerRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 768; // Tailwind md breakpoint
  });
  const rolesHeaderRef = useRef(null);
  const [rolesOpenLeft, setRolesOpenLeft] = useState(false);

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

  // Handle resize to toggle desktop/mobile behaviors
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close dropdowns on outside click or ESC
  useEffect(() => {
    const onClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setIsProfileOpen(false);
        setIsRolesOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsProfileOpen(false);
        setIsRolesOpen(false);
        setIsMenuOpen(false);
        setIsCartOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const computeRolesSide = () => {
    // On mobile, always open to the left so it stays on-screen
    if (!isDesktop) return true;
    const el = rolesHeaderRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const spaceRight = window.innerWidth - rect.right;
    // If less than submenu width (~220px), open to the left
    return spaceRight < 220;
  };

  return (
    <nav ref={containerRef} className="bg-white shadow-md sticky top-0 z-50">
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
              <div className="relative flex items-center gap-2">
                {/* Avatar + name go to account */}
                <Link
                  to="/account"
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50"
                >
                  {(() => {
                    const src = String(user?.profile_image || "");
                    const absolute = src
                      ? /^https?:\/\//i.test(src)
                        ? src
                        : `http://localhost:5000${
                            src.startsWith("/") ? src : `/${src}`
                          }`
                      : "";
                    return absolute ? (
                      <img
                        src={absolute}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <FaUser className="h-4 w-4" />
                      </div>
                    );
                  })()}
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name || user?.email}
                  </span>
                </Link>

                {/* Chevron button toggles dropdown (click on both desktop/mobile) */}
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  className="p-2 rounded hover:bg-gray-50"
                  aria-label="Open menu"
                >
                  <ChevronDownIcon className="h-4 w-4 text-gray-700" />
                </button>

                {/* Dropdown (no Admin Panel link) */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-[110%] w-56 bg-white border rounded shadow-md py-2 z-50">
                    <Link
                      to="/account"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Account
                    </Link>
                    {/* Roles submenu header + side list (hover on desktop, click toggle on mobile) */}
                    <div
                      className="relative"
                      onMouseEnter={() => {
                        if (!isDesktop) return;
                        if (rolesCloseTimer.current) {
                          clearTimeout(rolesCloseTimer.current);
                          rolesCloseTimer.current = null;
                        }
                        setIsRolesOpen(true);
                        setRolesOpenLeft(computeRolesSide());
                      }}
                      onMouseLeave={() => {
                        if (!isDesktop) return;
                        if (rolesCloseTimer.current) {
                          clearTimeout(rolesCloseTimer.current);
                        }
                        rolesCloseTimer.current = setTimeout(() => {
                          setIsRolesOpen(false);
                          rolesCloseTimer.current = null;
                        }, 200);
                      }}
                    >
                      <div
                        ref={rolesHeaderRef}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-default"
                      >
                        <span>
                          Role:{" "}
                          {(
                            activeRole ||
                            user?.roles?.[0] ||
                            user?.role ||
                            "user"
                          ).replace("_", " ")}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = !isRolesOpen;
                            setIsRolesOpen(next);
                            if (next) setRolesOpenLeft(computeRolesSide());
                          }}
                          className="p-1 rounded hover:bg-gray-100"
                          aria-label="Toggle roles"
                        >
                          <ChevronDownIcon
                            className={`h-4 w-4 transition-transform ${
                              isRolesOpen
                                ? rolesOpenLeft
                                  ? "rotate-90"
                                  : "rotate-270"
                                : "rotate-0"
                            }`}
                          />
                        </button>
                      </div>
                      <div
                        className={`absolute top-0 ${
                          rolesOpenLeft ? "right-full mr-2" : "left-full ml-2"
                        } w-48 bg-white border rounded shadow-md py-1 z-50 ${
                          isRolesOpen ? "block" : "hidden"
                        }`}
                      >
                        {(() => {
                          const roles =
                            user?.roles ||
                            (user?.role ? [user.role] : ["user"]);
                          const current = activeRole || roles[0];
                          const go = (r) => {
                            const ok = switchRole(r);
                            if (!ok) return;
                            setIsRolesOpen(false);
                            setIsProfileOpen(false);
                            const dest =
                              r === "admin"
                                ? "/admin/dashboard"
                                : r === "book_manager"
                                ? "/admin/books"
                                : r === "order_manager"
                                ? "/admin/orders"
                                : r === "printing_manager"
                                ? "/admin/printing"
                                : r === "delivery_manager"
                                ? "/admin/delivery"
                                : r === "finance_manager"
                                ? "/admin/finance"
                                : r === "customer_support"
                                ? "/admin/support"
                                : r === "marketing_manager"
                                ? "/admin/marketing"
                                : r === "operations_manager"
                                ? "/admin/dashboard"
                                : "/account";
                            navigate(dest, { replace: true });
                          };
                          return roles.map((r) => (
                            <button
                              key={r}
                              onClick={() => go(r)}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 capitalize ${
                                current === r ? "font-semibold" : ""
                              }`}
                            >
                              {r.replace("_", " ")}
                              {current === r ? " (current)" : ""}
                            </button>
                          ));
                        })()}
                      </div>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FaSignOutAlt className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
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

          {/* Mobile Menu Button + Cart */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <FaShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] w-4 h-4">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
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

                  {/* Roles (mobile) */}
                  <div className="px-3">
                    <div className="text-xs text-gray-500 mb-1">Roles</div>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const roles =
                          user?.roles || (user?.role ? [user.role] : ["user"]);
                        const current = activeRole || roles[0];
                        const go = (r) => {
                          const ok = switchRole(r);
                          if (!ok) return;
                          setIsMenuOpen(false);
                          const dest =
                            r === "admin"
                              ? "/admin/dashboard"
                              : r === "book_manager"
                              ? "/admin/books"
                              : r === "order_manager"
                              ? "/admin/orders"
                              : r === "printing_manager"
                              ? "/admin/printing"
                              : r === "delivery_manager"
                              ? "/admin/delivery"
                              : r === "finance_manager"
                              ? "/admin/finance"
                              : r === "customer_support"
                              ? "/admin/support"
                              : r === "marketing_manager"
                              ? "/admin/marketing"
                              : r === "operations_manager"
                              ? "/admin/dashboard"
                              : "/account";
                          navigate(dest, { replace: true });
                        };
                        return roles.map((r) => (
                          <button
                            key={r}
                            onClick={() => go(r)}
                            className={`px-2 py-1 text-xs rounded border ${
                              current === r
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-700 border-gray-300"
                            }`}
                          >
                            {r.replace("_", " ")}
                          </button>
                        ));
                      })()}
                    </div>
                  </div>

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
                  {state.items.map((item, index) => (
                    <li
                      key={item._id || item.id || index}
                      className="p-4 flex items-start gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">
                            {item.title}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              removeItem({ id: item._id || item.id })
                            }
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
                                id: item._id || item.id,
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
                                id: item._id || item.id,
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
