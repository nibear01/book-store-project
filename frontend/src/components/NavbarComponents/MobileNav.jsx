import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher";

const MobileNav = ({
  isMenuOpen,
  setIsMenuOpen,
  cartCount,
  setIsCartOpen,
  navigationLinks,
  isAuthenticated,
  authLinks,
  user,
  activeRole,
  switchRole,
  handleLogout,
  // NEW (optional): wishlist badge count
  wishlistCount = 0,
  setIsProfileOpen,
}) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    const isSmallScreen =
      typeof window !== "undefined" && window.innerWidth < 768;
    if (isSmallScreen) {
      document.body.style.overflow = isMenuOpen ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Mobile Menu Button + Cart */}
      <div className="md:hidden flex items-center space-x-2">
        {/* Language Switcher */}
        <div className="scale-90">
          <LanguageSwitcher className="px-2 py-1" />
        </div>

        <button
          type="button"
          onClick={() => navigate("/wishlist")}
          className="relative p-2 text-gray-700 hover:text-[var(--hover-color)] focus:outline-none active:opacity-80"
          aria-label="Open wishlist"
        >
          <Heart className="h-6 w-6" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] min-w-4 h-4 px-1">
              {wishlistCount}
            </span>
          )}
        </button>

        {/* Mobile Cart Button */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 text-gray-700 hover:text-gray-900 focus:outline-none active:opacity-80"
          aria-label="Open cart"
        >
          <FaShoppingCart className="h-6 w-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] min-w-4 h-4 px-1">
              {cartCount}
            </span>
          )}
        </button>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-[2px] text-gray-700 hover:text-gray-900 focus:outline-none active:opacity-80"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <XMarkIcon className="h-7 w-7" />
          ) : (
            <Bars3Icon className="h-7 w-7" />
          )}
        </button>
      </div>

      {/* Mobile Menu (full-screen overlay for better responsiveness) */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Panel (accounts for 64px header height; uses dynamic viewport) */}
          <div className="absolute left-0 right-0 top-16 bottom-0 bg-white rounded-t-lg shadow-xl overflow-y-auto">
            <div className="px-4 pt-3 pb-5 space-y-2">
              {/* Primary nav links */}
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-gray-800 px-3 py-3 rounded-md active:bg-gray-100 text-[15px] font-medium"
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-gray-200 pt-3">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    {/* User Info */}
                    <Link
                      to="/account"
                      name="navbar_account_link"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 text-gray-800 px-3 py-3 rounded-md active:bg-gray-100"
                    >
                      {user?.profile_image ? (
                        (() => {
                          const src = String(user.profile_image || "");
                          const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://192.168.0.104:5000";
                          const absolute = /^https?:\/\//i.test(src)
                            ? src
                            : `${BASE_URL}${
                                src.startsWith("/") ? src : `/${src}`
                              }`;
                          return (
                            <img
                              src={absolute}
                              alt="Profile"
                              className="h-8 w-8 rounded-full object-cover border"
                            />
                          );
                        })()
                      ) : (
                        <span className="grid place-items-center h-8 w-8 rounded-full bg-gray-200 text-gray-600">
                          <FaUser className="h-4 w-4" />
                        </span>
                      )}
                      <span className="text-[15px] font-medium truncate">
                        {user?.name || user?.email}
                      </span>
                    </Link>
                    {/* Roles */}
                    <div className="px-3">
                      <div className="text-xs text-gray-500 mb-2">{t('common:navbar.admin')}</div>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const roles =
                            user?.roles ||
                            (user?.role ? [user.role] : ["user"]);
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
                              className={`px-3 py-2 text-xs rounded-md border min-w-[88px] text-center
                                ${
                                  current === r
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-700 border-gray-300 active:bg-gray-100"
                                }`}
                            >
                              {r.replace("_", " ")}
                            </button>
                          ));
                        })()}
                      </div>
                    </div>
                    <div className="border-t border-gray-200" />
                    <Link
                      to="/orders"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsProfileOpen && setIsProfileOpen(false);
                      }}
                      className="block px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                    >
                      {t('common:navbar.orders')}
                    </Link>{" "}
                    <div />
                    {/* Logout */}
                    <div className="px-3">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-3 text-[15px] font-medium text-gray-800 rounded-md active:bg-gray-100"
                      >
                        <FaSignOutAlt className="h-4 w-4" />
                        <span>{t('common:navbar.logout')}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {authLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block px-3 py-3 rounded-md text-[15px] font-medium text-center
                          ${
                            link.name === "Sign Up"
                              ? "bg-red-500 text-white active:bg-red-600 shadow-sm"
                              : "text-gray-800 border border-gray-300 active:bg-gray-100"
                          }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Extra bottom padding for safe areas */}
              <div className="h-6" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
