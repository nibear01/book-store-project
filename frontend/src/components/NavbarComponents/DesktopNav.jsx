import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUser, FaSignOutAlt } from "react-icons/fa";
import { Heart } from "lucide-react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import SearchBar from "./SearchBar";

const DesktopNav = ({
  navigationLinks,
  authLinks,
  isAuthenticated,
  user,
  cartCount,
  setIsCartOpen,
  isProfileOpen,
  setIsProfileOpen,
  handleLogout,
  wishlistCount = 0,
}) => {
  const navigate = useNavigate();

  const roleToPath = (r) =>
    r === "admin"
      ? "/admin/dashboard"
      : r === "book_manager"
      ? "/admin/books"
      : r === "order_manager"
      ? "/admin/orders"
      : r === "author"
      ? "/admin/author"
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
      : r === "user_manager"
      ? "/admin/users"
      : "/account";

  const { t } = useTranslation('common');

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
        {navigationLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className="text-gray-700 hover:text-[var(--hover-color)] transition-colors text-sm lg:text-[14px] font-medium whitespace-nowrap"
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Search Bar (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-3 lg:mx-4">
        <SearchBar />
      </div>

      {/* Cart + Auth (Desktop) */}
      <div className="hidden md:flex items-center space-x-3">
        {/* Wishlist */}
        <button
          type="button"
          onClick={() => navigate("/wishlist")}
          className="relative text-gray-700 hover:text-[var(--hover-color)] transition"
          aria-label="Open wishlist"
        >
          <Heart className="h-5 w-5" />
          {wishlistCount > 0 && (
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] w-4 h-4">
              {wishlistCount}
            </span>
          )}
        </button>

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
              name="navbar_account_link_desktop"
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50"
            >
              {(() => {
                const src = String(user?.profile_image || "");
                const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://192.168.0.104:5000";
                const absolute = src
                  ? /^https?:\/\//i.test(src)
                    ? src
                    : `${BASE_URL}${
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
              {/* <span className="text-sm font-medium text-gray-700">
                {user?.name || user?.email}
              </span> */}
            </Link>

            {/* Chevron button toggles dropdown */}
            <button
              onClick={() => setIsProfileOpen((v) => !v)}
              className="p-2 rounded hover:bg-gray-50"
              aria-label="Open menu"
            >
              <ChevronDownIcon className="h-4 w-4 text-gray-700" />
            </button>

            {/* Dropdown with Account, Admin Roles quick access, Role switcher, etc. */}
            {isProfileOpen && (
              <div className="absolute right-0 top-[110%] w-56 bg-white border rounded shadow-md py-2 z-50">
                <Link
                  to="/account"
                  onClick={() => setIsProfileOpen(false)}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t('common:navbar.account')}
                </Link>

                {/* Admin Roles quick access (navigate directly without switching activeRole) */}
                {(() => {
                  const roles = Array.isArray(user?.roles)
                    ? user.roles
                    : user?.role
                    ? [user.role]
                    : [];
                  const adminish = roles.filter((r) =>
                    [
                      "admin",
                      "author",
                      "user_manager",
                      "book_manager",
                      "order_manager",
                      "printing_manager",
                      "delivery_manager",
                      "finance_manager",
                      "customer_support",
                      "marketing_manager",
                    ].includes(r)
                  );
                  if (!adminish.length) return null;
                  return (
                    (<div className="border-t my-1" />),
                    (
                      <div className="px-3 py-2">
                        <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                          {t('common:navbar.admin')}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {adminish.map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => {
                                const dest = roleToPath(r);
                                setIsProfileOpen(false);
                                navigate(dest, { replace: true });
                              }}
                              className="px-2 py-1 rounded text-xs border text-gray-700 hover:bg-gray-50 capitalize"
                            >
                              {r.replace("_", " ")}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  );
                })()}

                {/* Role switcher (optional): sets activeRole but quick-access above doesn't require switching) */}
                {/* <div
                  className="relative"
                  onMouseEnter={() => {
                    if (!isDesktop) return;
                    if (rolesCloseTimer.current) {
                      clearTimeout(rolesCloseTimer.current);
                      rolesCloseTimer.current = null;
                    }
                    setIsRolesOpen(true);
                    computeRolesSide && setIsRolesOpen(true);
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
                        user?.roles || (user?.role ? [user.role] : ["user"]);
                      const current = activeRole || roles[0];
                      const go = (r) => {
                        const ok = switchRole(r);
                        if (!ok) return;
                        setIsRolesOpen(false);
                        setIsProfileOpen(false);
                        const dest = roleToPath(r);
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
                </div> */}

                <Link
                  to="/orders"
                  onClick={() => setIsProfileOpen(false)}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t('common:navbar.orders')}
                </Link>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FaSignOutAlt className="h-4 w-4" /> {t('common:navbar.logout')}
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
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                link.name === "Sign Up"
                  ? "bg-red-500 text-white hover:bg-white hover:text-red-500 border hover:border-red-500 shadow-xs transition duration-300"
                  : "text-gray-700 hover:text-[var(--hover-color)]"
              }`}
            >
              {link.name}
            </Link>
          ))
        )}
      </div>
    </>
  );
};

export default DesktopNav;
