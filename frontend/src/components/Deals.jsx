import { useEffect, useState } from 'react';

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch('/deals.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setDeals(data.deals_of_the_week);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const nextSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex + 2) % deals.length);
  };

  const prevSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex - 2 + deals.length) % deals.length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] bg-white p-8">
        Loading deals...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px] bg-white p-8 text-red-500">
        Error: {error}
      </div>
    );
  }

  // Create a visible subset of deals for the current slide
  const visibleDeals = deals.slice(activeIndex, activeIndex + 2);
  const isNextButtonDisabled = activeIndex + 2 >= deals.length;
  const isPrevButtonDisabled = activeIndex === 0;

  return (
    <div className="bg-white rounded-[2px] p-8 max-w-8xl w-full mt-10 mx-auto relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Deals of the Week</h2>
        <a 
          href="/all-deals" 
          className="flex items-center text-gray-600 font-medium hover:text-black transition-colors"
        >
          View All 
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 ml-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </a>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 transition-transform duration-300 ease-in-out">
          {visibleDeals.map((deal, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-center p-4 rounded-[2px] border border-gray-200 min-h-[250px] sm:min-h-[200px] hover:shadow-md transition-all">
              <img 
                src={deal.cover_image} 
                alt={deal.title} 
                className="w-full sm:w-1/2 max-w-[150px] h-auto object-contain rounded-[2px] mb-4 sm:mb-0 sm:mr-4 flex-shrink-0" 
              />
              <div className="text-center sm:text-left flex-grow">
                <p className="text-sm text-red-600 font-semibold uppercase mb-1">{deal.format}</p>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{deal.title}</h3>
                <p className="text-md text-gray-600 mb-2">{deal.author}</p>
                <span className="font-bold text-2xl text-black mr-2">{deal.price}</span>
                {deal.original_price && <span className="text-gray-500 line-through">{deal.original_price}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Custom Navigation Buttons */}
        <button
          onClick={prevSlide}
          disabled={isPrevButtonDisabled}
          className={`absolute top-1/2 -left-8 transform -translate-y-1/2 bg-white p-3 rounded-[2px] border border-gray-300 z-10 hidden sm:block transition-opacity duration-300 ${isPrevButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          disabled={isNextButtonDisabled}
          className={`absolute top-1/2 -right-8 transform -translate-y-1/2 bg-white p-3 rounded-[2px] border border-gray-300 z-10 hidden sm:block transition-opacity duration-300 ${isNextButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Pagination (Circles at the bottom) */}
      <div className="flex justify-center mt-4 space-x-2">
        {deals.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(Math.floor(i / 2) * 2)}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${Math.floor(activeIndex / 2) === Math.floor(i / 2) ? 'bg-black' : 'bg-gray-300'}`}
          ></button>
        ))}
      </div>
    </div>
  );
}