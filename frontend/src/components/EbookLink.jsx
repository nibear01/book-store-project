import { Link } from 'react-router-dom';
import { FaBookOpen, FaMobile, FaPrint, FaStar } from 'react-icons/fa';

const EbookLink = () => {
  return (
    <div className="max-w-2xl mx-auto my-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl border border-blue-200 overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-2 mb-4">
            <FaBookOpen className="text-3xl text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-800">Featured E-Book Product</h2>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed">
            Experience our innovative pricing system with dynamic price ranges based on format and customization options.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <FaMobile className="text-2xl text-green-500" />
              <h3 className="font-bold text-gray-800">Digital Format</h3>
            </div>
            <p className="text-sm text-gray-600">
              Price ranges based on book category (Educational, Fiction, Kids, etc.)
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <FaPrint className="text-2xl text-orange-500" />
              <h3 className="font-bold text-gray-800">Hardcopy Format</h3>
            </div>
            <p className="text-sm text-gray-600">
              Dynamic pricing based on paper size (A4, A5, etc.) and quality (Standard, Premium)
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <FaStar className="text-yellow-500" />
            <h4 className="font-bold text-yellow-800">Key Features:</h4>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Real-time price updates based on selection</li>
            <li>• User-friendly format switcher</li>
            <li>• Responsive design for all devices</li>
            <li>• Ready for e-commerce integration</li>
          </ul>
        </div>
        
        <Link 
          to="/products/ebooks/sample-ebook"
          className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          🚀 View Dynamic E-Book Product Page
        </Link>
      </div>
    </div>
  );
};

export default EbookLink;