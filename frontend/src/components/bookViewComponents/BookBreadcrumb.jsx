import { Link } from "react-router-dom";

const BookBreadcrumb = ({ book }) => {
  return (
    <nav className="flex items-center text-[12px] text-gray-600 space-x-2">
      <Link
        to="/"
        className="hover:text-[var(--hover-color)] transition-colors"
      >
        Home
      </Link>
      <span>/</span>
      <Link
        to={`/categories`}
        className="hover:text-[var(--hover-color)] transition-colors"
      >
        Products
      </Link>
      <span>/</span>
      <span className="text-gray-900 font-medium truncate max-w-xs">
        {book.title}
      </span>
    </nav>
  );
};

export default BookBreadcrumb;