const BookError = ({ error }) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 text-red-600">
      {error}
    </div>
  );
};

export default BookError;