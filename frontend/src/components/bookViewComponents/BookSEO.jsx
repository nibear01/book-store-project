import { Helmet } from "react-helmet";

const BookSEO = ({ book, currentImageIndex }) => {
  const currentImage = Array.isArray(book.cover_image) && book.cover_image.length > 0
    ? book.cover_image[currentImageIndex]
    : book.cover_image;

  return (
    <Helmet>
      <title>{book.meta_title || book.title} | BookStore</title>
      <meta name="description" content={book.meta_description || book.description} />
      {book.meta_keywords && book.meta_keywords.length > 0 && (
        <meta name="keywords" content={book.meta_keywords.join(', ')} />
      )}
      <meta property="og:title" content={book.meta_title || book.title} />
      <meta property="og:description" content={book.meta_description || book.description} />
      {currentImage && (
        <meta property="og:image" content={`http://localhost:5000${currentImage}`} />
      )}
      <meta property="og:type" content="book" />
    </Helmet>
  );
};

export default BookSEO;