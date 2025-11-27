import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const BookDetails = ({ book }) => {
  const { t } = useTranslation(['bookView', 'common']);
  const renderStars = (rating = book?.rating || 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++)
      stars.push(<FaStar key={i} className="text-yellow-500" />);
    if (halfStar)
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-500" />);
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++)
      stars.push(<FaRegStar key={"empty" + i} className="text-yellow-500" />);
    return stars;
  };

  return (
    <>
      <h1 className="text-3xl font-bold">{book.title}</h1>
      <h2 className="text-lg text-gray-700">{t('bookView.by')} {book.author}</h2>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex">{renderStars()}</div>
        <span className="text-gray-500 text-sm">
          ({book.num_reviews} {t('bookView.reviewsCount')})
        </span>
      </div>

      {/* Genres */}
      {book.genre && book.genre.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {book.genre.map((genre, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>
      )}

      {/* Price (supports configured price & discounts) */}
      <div className="mt-3">
        {typeof book._displayPrice === 'number' ? (
          book._compareAtPrice != null && book._compareAtPrice !== book._displayPrice ? (
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 line-through">{t('common:currency')}{Number(book._compareAtPrice).toFixed(2)}</span>
              <span className="text-2xl font-semibold">{t('common:currency')}{Number(book._displayPrice).toFixed(2)}</span>
              <span className="text-xs text-gray-500 mt-1">{t('bookView.priceNote')}</span>
            </div>
          ) : (
            <div className="text-2xl font-semibold">{t('common:currency')}{Number(book._displayPrice).toFixed(2)}</div>
          )
        ) : (
          // Fallback to legacy configuredPrice behavior
          <>
            {book.configuredPrice && book.configuredPrice !== book.price ? (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 line-through">{t('common:currency')}{Number(book.price).toFixed(2)}</span>
                <span className="text-2xl font-semibold">{t('common:currency')}{Number(book.configuredPrice).toFixed(2)}</span>
                <span className="text-xs text-gray-500 mt-1">{t('bookView.priceNote')}</span>
              </div>
            ) : (
              <div className="text-2xl font-semibold">{t('common:currency')}{Number(book.price).toFixed(2)}</div>
            )}
          </>
        )}
      </div>

      {/* Stock Status */}
      {/* <div className={`text-sm font-medium ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
      </div> */}

      {/* Additional Info */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div>
          <span className="font-semibold">{t('bookView.language')}:</span> {book.language}
        </div>
        <div>
          <span className="font-semibold">{t('bookView.isbn')}:</span> {book.isbn || t('bookView.details.notAvailable')}
        </div>
        <div>
          <span className="font-semibold">{t('bookView.published')}:</span>{" "}
          {book.published_date ? new Date(book.published_date).toLocaleDateString() : t('bookView.details.notAvailable')}
        </div>
      </div>
    </>
  );
};

export default BookDetails;