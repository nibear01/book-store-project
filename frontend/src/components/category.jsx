import { useEffect, useState } from 'react';
import { FaCameraRetro, FaGlassMartiniAlt, FaHeart, FaNotesMedical, FaUserTie, FaBookOpen, FaLaptopCode, FaPlane, FaMusic, FaLandmark } from 'react-icons/fa';
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

function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8 text-red-500">Error: {error}</div>
      </div>
    );
  }

  const iconColors = [
    'text-purple-600',
    'text-orange-600',
    'text-red-600',
    'text-cyan-600',
    'text-pink-600',
    'text-gray-600',
    'text-blue-600',
    'text-green-600',
    'text-yellow-600',
    'text-indigo-600',
  ];

  return (
    <div className="flex justify-center items-center p-4 ">
      <div className="rounded-[2px] p-8 max-w-10xl w-full ">
        <div className="flex flex-col justify-center items-center md:flex justify-between items-center mb-6 ">
          <h2 className="text-3xl font-bold text-gray-800 ml-2">Featured Categories</h2>
          <Link
            to="/categories"
            className="flex items-center text-red-600 font-medium hover:text-red-800 transition-colors"
          >
            All Categories <BsArrowRight className="ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => {
            const IconComponent = iconMap[category.name];
            const iconColorClass = iconColors[index % iconColors.length];

            return (
              <a
                key={index}
                href={category.action_link}
                className="flex flex-col items-start p-6 rounded-[2px] shadow-sm transition-transform duration-300 transform hover:scale-105"
              >
               
                <h3 className="text-xl font-semibold text-gray-800 mb-1">{category.name}</h3>
            
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Category;