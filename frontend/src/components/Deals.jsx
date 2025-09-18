import { useEffect, useState, useContext } from 'react';
import { BooksContext } from '@/context/BooksContext';

export default function Deals() {
  const { url, fetchDealsOfWeek } = useContext(BooksContext);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const loadDeals = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchDealsOfWeek(10);
        setDeals(Array.isArray(resp?.data) ? resp.data : []);
        setActiveIndex(0);
      } catch (e) {
        setError(e?.message || 'Failed to load deals');
      } finally {
        setLoading(false);
      }
    };
    loadDeals();
  }, [fetchDealsOfWeek]);

  const nextSlide = () => {
    if (deals.length === 0) return;
    setActiveIndex((prevIndex) => (prevIndex + 1) % deals.length);
  };

  const prevSlide = () => {
    if (deals.length === 0) return;
    setActiveIndex((prevIndex) => (prevIndex - 1 + deals.length) % deals.length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] bg-white p-4 md:p-8">
        Loading deals...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px] bg-white p-4 md:p-8 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!deals.length) {
    return (
      <div className="flex justify-center items-center min-h-[200px] bg-white p-4 md:p-8">
        No deals available.
      </div>
    );
  }

  const current = deals[activeIndex] || {};
  const img = Array.isArray(current?.cover_image) ? current.cover_image[0] : current?.cover_image;
  const isOnSale = !!current?.is_on_sale && typeof current?.sale_price === 'number';
  const displayPrice = isOnSale ? current.sale_price : current?.price;

  const isNextButtonDisabled = activeIndex === deals.length - 1;
  const isPrevButtonDisabled = activeIndex === 0;

  return (
    <div className="bg-white rounded-[2px] p-4 md:p-8 max-w-8xl w-full mt-6 md:mt-10 mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center sm:text-left">Deals of the Week</h2>
        <a 
          href="/all-deals" 
          className="flex items-center text-gray-600 font-medium hover:text-black transition-colors text-sm md:text-base"
        >
          View All 
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 ml-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </a>
      </div>

      <div className="relative">
        {/* Mobile Navigation (Visible on small screens) */}
        <div className="flex justify-center mb-4 sm:hidden">
          <button
            onClick={prevSlide}
            disabled={isPrevButtonDisabled}
            className={`p-2 rounded-[2px] border border-gray-300 mx-2 transition-opacity duration-300 ${isPrevButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            disabled={isNextButtonDisabled}
            className={`p-2 rounded-[2px] border border-gray-300 mx-2 transition-opacity duration-300 ${isNextButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Deal Item */}
        <div className="transition-transform duration-300 ease-in-out">
          <div className="flex flex-col sm:flex-row items-center p-4 md:p-6 rounded-[2px] border border-gray-200 min-h-[200px] md:min-h-[250px] transition-all">
            <img 
              src={`${url}${img || ''}`} 
              alt={current?.title || 'Deal book'} 
              className="w-full sm:w-1/3 md:w-1/4 max-w-[120px] md:max-w-[150px] h-auto object-contain rounded-[2px] mb-4 sm:mb-0 sm:mr-6 flex-shrink-0" 
            />
            <div className="text-center sm:text-left flex-grow">
              {!!current?.is_deal_of_the_week && (
                <p className="text-xs md:text-sm text-red-600 font-semibold uppercase mb-1 md:mb-2">
                  Deal of the Week
                </p>
              )}
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1 md:mb-2 line-clamp-2">
                {current?.title}
              </h3>
              <p className="text-sm md:text-md text-gray-600 mb-2 md:mb-3 line-clamp-1">
                {current?.author}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2">
                <span className="font-bold text-xl md:text-2xl text-black">
                  {displayPrice}
                </span>
                {isOnSale && (
                  <span className="text-gray-500 line-through text-sm md:text-base">
                    {current?.price}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation (Hidden on mobile) */}
        <button
          onClick={prevSlide}
          disabled={isPrevButtonDisabled}
          className={`absolute top-1/2 -left-4 md:-left-8 transform -translate-y-1/2 bg-white p-2 md:p-3 rounded-[2px] border border-gray-300 z-10 hidden sm:block transition-opacity duration-300 ${isPrevButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          disabled={isNextButtonDisabled}
          className={`absolute top-1/2 -right-4 md:-right-8 transform -translate-y-1/2 bg-white p-2 md:p-3 rounded-[2px] border border-gray-300 z-10 hidden sm:block transition-opacity duration-300 ${isNextButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-4 md:mt-6 space-x-2">
        {deals.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors duration-300 ${activeIndex === i ? 'bg-black' : 'bg-gray-300'}`}
          ></button>
        ))}
      </div>
    </div>
  );
}