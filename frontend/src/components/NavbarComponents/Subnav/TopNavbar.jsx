import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../LanguageSwitcher";

const TopNavbar = () => {
  const { t } = useTranslation('common');
  return (
    <div className="w-full border-b border-gray-200 bg-white text-xs dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
      {/* Mobile: Two-line layout */}
      <div className="md:hidden px-3 py-2 flex flex-col justify-center items-center gap-1">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px]">
          <span className="text-red-600 dark:text-red-400 font-medium">
            {t('navbar.freeShippingShort')} ৳10000
          </span>

          <span className="h-3 w-px bg-gray-300 dark:bg-gray-700" />

          <Link
            to="/affiliate"
            target="_blank"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {t('navbar.marketing')}
          </Link>

          <span className="h-3 w-px bg-gray-300 dark:bg-gray-700" />

          <Link
            to="/distribution"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {t('navbar.distribution')}
          </Link>

          <span className="h-3 w-px bg-gray-300 dark:bg-gray-700" />

          <LanguageSwitcher className="text-[10px] px-1 py-0.5 hover:bg-transparent" />
        </div>
      </div>

      {/* Desktop (unchanged) */}
      <nav
        aria-label="Top navigation"
        className="hidden md:grid mx-auto w-full max-w-7xl grid-cols-3 items-center gap-2 px-4 py-2"
      >
        {/* Left */}
        <div className="flex items-center justify-start">
          <p className="truncate text-gray-700 dark:text-gray-300">
            {t('navbar.welcome')}
          </p>
        </div>

        {/* Middle */}
        <div className="flex items-center justify-center">
          <p className="truncate text-center text-[12px] text-gray-600 dark:text-gray-400">
            {t('navbar.freeShipping')} ৳10000!
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/affiliate"
            className="rounded px-2 py-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring dark:text-gray-400 dark:hover:text-gray-200"
          >
            {t('navbar.marketing')}
          </Link>

          <span className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

          <Link
            to="/distribution"
            className="rounded px-2 py-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring dark:text-gray-400 dark:hover:text-gray-200"
          >
            {t('navbar.distribution')}
          </Link>

          <span className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

          <LanguageSwitcher className="px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-transparent dark:text-gray-400 dark:hover:text-gray-200" />
        </div>
      </nav>
    </div>
  );
};

export default TopNavbar;
