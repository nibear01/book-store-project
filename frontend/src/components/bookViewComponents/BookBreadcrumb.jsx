import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BookBreadcrumb = ({ book }) => {
  const { t } = useTranslation(['bookView', 'common']);
  return (
    <nav className="flex items-center text-[12px] text-gray-600 space-x-2">
      <Link
        to="/"
        className="hover:text-[var(--hover-color)] transition-colors"
      >
        {t('bookView.home')}
      </Link>
      <span>/</span>
      <Link
        to={`/categories`}
        className="hover:text-[var(--hover-color)] transition-colors"
      >
        {t('bookView.products')}
      </Link>
      <span>/</span>
      <span className="text-gray-900 font-medium truncate max-w-xs">
        {book.title}
      </span>
    </nav>
  );
};

export default BookBreadcrumb;