import { useEffect, useState } from 'react';
import { 
  FaCameraRetro, FaGlassMartiniAlt, FaHeart, FaNotesMedical, 
  FaUserTie, FaBookOpen, FaLaptopCode, FaPlane, FaMusic, 
  FaLandmark, FaSpinner, FaExclamationTriangle 
} from 'react-icons/fa';
import { BsArrowRight } from 'react-icons/bs';
import { Link } from 'react-router-dom';

const iconMap = {
  "Arts & Photography": FaCameraRetro,
  "Food & Drink": FaGlassMartiniAlt,
  "Romance": FaHeart,
  "Health": FaNotesMedical,
  "Biography": FaUserTie,
  "Literature": FaBookOpen, 
  "Technology": FaLaptopCode,
  "Travel": FaPlane,
  "Music": FaMusic,
  "History": FaLandmark,
};

const gradientColors = [
  'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-red-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-pink-500 to-rose-500',
  'from-gray-500 to-slate-600',
  'from-blue-500 to-indigo-600',
  'from-green-500 to-emerald-600',
  'from-yellow-500 to-amber-600',
  'from-indigo-500 to-purple-600',
];

const hoverEffects = [
  'hover:rple-500/20',
  'hover:ange-500/20',
  'hover:d-500/20',
  'hover:an-500/20',
  'hover:nk-500/20',
  'hover:ay-500/20',
  'hover:ue-500/20',
  'hover:een-500/20',
  'hover:llow-500/20',
  'hover:digo-500/20',
];

function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Simulate API call delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await fetch('/category.json');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data.featured_categories);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center p-8">
          <div className="animate-spin text-red-600 mb-4">
            <FaSpinner className="text-4xl mx-auto" />
          </div>
          <p className="text-gray-600 text-lg">Loading amazing categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">
            <FaExclamationTriangle className="text-4xl mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-[2px] hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 px-4 bg-gradient-to-br from-gray-50 to-white mt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Discover Your Next Read
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our curated collection of categories to find books that match your interests and passions.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {categories.map((category, index) => {
            const IconComponent = iconMap[category.name];
            const gradientClass = gradientColors[index % gradientColors.length];
            const hoverClass = hoverEffects[index % hoverEffects.length];

            return (
              <Link
                key={index}
                to={category.action_link || '#'}
                className="group relative bg-white rounded-[2px]  border border-gray-100 p-6 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Gradient Background Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-5 rounded-[2px] transition-opacity duration-300`}></div>
                
                {/* Icon Container */}
                <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-[2px] bg-gradient-to-br ${gradientClass} mb-4 group-hover:scale-103 transition-transform duration-300`}>
                  <IconComponent className="text-2xl text-white" />
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {category.description || 'Explore this fascinating category'}
                  </p>
                  
                  {/* View More Button */}
                  <div className="flex items-center text-red-600 font-medium group-hover:text-red-700 transition-colors">
                    <span className="text-sm">Explore</span>
                    <BsArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Hover Border Effect */}
                <div className={`absolute inset-0 rounded-[2px] border-2 border-transparent group-hover:border-opacity-20 group-hover:${hoverClass} transition-all duration-300`}></div>
              </Link>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            to="/categories"
            className="inline-flex items-center bg-red-600 text-white px-8 py-3 rounded-[2px] font-semibold hover:bg-red-700 transform hover:-translate-y-1 transition-all duration-300"
          >
            View All Categories
            <BsArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute left-0 right-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-100 rounded-[2px]ll mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-red-100 rounded-[2px]ll mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-100 rounded-[2px]ll mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </section>
  );
}

export default Category;