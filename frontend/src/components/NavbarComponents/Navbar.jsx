import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { XMarkIcon } from "@heroicons/react/24/outline";

import DesktopNavbar from "./DesktopNav";
import MobileNav from "./MobileNav";
import { useWishlist } from "../../context/WishlistContext";

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
    { name: "Authors", path: "/author" },
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
  const { count: wishlistCount } = useWishlist();

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

  useEffect(() => {
    // keep roles submenu side in sync when profile opens
    if (isProfileOpen) {
      setRolesOpenLeft(computeRolesSide());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProfileOpen, isDesktop]);

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

          {/* Desktop chunk */}
          <DesktopNavbar
            navigationLinks={navigationLinks}
            authLinks={authLinks}
            isAuthenticated={isAuthenticated}
            user={user}
            cartCount={cartCount}
            setIsCartOpen={setIsCartOpen}
            isProfileOpen={isProfileOpen}
            setIsProfileOpen={setIsProfileOpen}
            isRolesOpen={isRolesOpen}
            setIsRolesOpen={(v) => {
              setIsRolesOpen(v);
              if (v) setRolesOpenLeft(computeRolesSide());
            }}
            rolesHeaderRef={rolesHeaderRef}
            rolesOpenLeft={rolesOpenLeft}
            computeRolesSide={computeRolesSide}
            rolesCloseTimer={rolesCloseTimer}
            isDesktop={isDesktop}
            activeRole={activeRole}
            switchRole={switchRole}
            handleLogout={handleLogout}
            wishlistCount={wishlistCount}
          />

          {/* Mobile chunk */}
          <MobileNav
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            cartCount={cartCount}
            setIsCartOpen={setIsCartOpen}
            navigationLinks={navigationLinks}
            isAuthenticated={isAuthenticated}
            authLinks={authLinks}
            user={user}
            activeRole={activeRole}
            switchRole={switchRole}
            handleLogout={handleLogout}
            wishlistCount={wishlistCount}
          />
        </div>
      </div>

      {/* Cart Drawer (shared) */}
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  View Cart
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate("/checkout");
                  }}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"
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
