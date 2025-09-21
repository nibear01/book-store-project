import { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar, FaInfoCircle, FaShoppingCart, FaBolt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
// import { useParams } from "react-router"; // For future dynamic loading
import { useAuth } from "../context/AuthContext";
// import { Helmet } from "react-helmet"; // Temporarily disabled

const EbookProductPage = () => {
  // const { slug } = useParams(); // For future dynamic loading
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Book data state (in a real app, this would be fetched based on slug)
  const [book] = useState({
    title: "The Complete Guide to Modern Web Development",
    author: "Jane Smith",
    cover_image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    description: "A comprehensive guide to modern web development practices, frameworks, and tools. This book covers everything from HTML and CSS fundamentals to advanced JavaScript frameworks, responsive design, and modern deployment strategies. Perfect for both beginners and experienced developers looking to stay current with the latest web technologies.",
    rating: 4.5,
    num_reviews: 128,
    genre: ["Educational", "Technology", "Programming"],
    language: "English",
    isbn: "978-1234567890",
    published_date: "2023-05-15",
    stock: 50,
  });

  // Format and pricing states
  const [format, setFormat] = useState("digital"); // digital or hardcopy
  const [paperSize, setPaperSize] = useState("A4");
  const [paperQuality, setPaperQuality] = useState("standard");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // Price ranges based on category for digital format
  const digitalPriceRanges = {
    Educational: { min: 19.99, max: 29.99 },
    Technology: { min: 24.99, max: 34.99 },
    Programming: { min: 29.99, max: 39.99 },
    Fiction: { min: 9.99, max: 14.99 },
    Kids: { min: 7.99, max: 12.99 },
    Biography: { min: 12.99, max: 19.99 },
    History: { min: 14.99, max: 24.99 },
    Science: { min: 17.99, max: 27.99 },
    Romance: { min: 8.99, max: 13.99 },
    Mystery: { min: 11.99, max: 16.99 },
    SelfHelp: { min: 13.99, max: 22.99 },
    Business: { min: 18.99, max: 28.99 },
    Default: { min: 9.99, max: 19.99 },
  };

  // Paper size price modifiers
  const paperSizePrices = {
    A4: { base: 5.00, premium: 8.00 },
    A5: { base: 3.00, premium: 5.00 },
    B5: { base: 4.00, premium: 6.50 },
    Letter: { base: 4.50, premium: 7.50 },
    Legal: { base: 5.50, premium: 9.00 },
  };

  // Paper quality descriptions
  const paperQualityInfo = {
    standard: { description: "Standard paper quality, good for everyday reading", icon: "📄" },
    premium: { description: "Premium paper quality, enhanced durability and feel", icon: "⭐" },
  };

  // Calculate price range based on format and options
  const calculatePriceRange = () => {
    // Get the primary genre or use default
    const primaryGenre = book.genre && book.genre.length > 0 ? book.genre[0] : "Default";
    
    // Get price range for digital format based on category
    const digitalRange = digitalPriceRanges[primaryGenre] || digitalPriceRanges.Default;
    
    if (format === "digital") {
      return digitalRange;
    } else {
      // For hardcopy, add paper size and quality costs
      const sizePrice = paperSizePrices[paperSize] || paperSizePrices.A4;
      const qualityMultiplier = paperQuality === "premium" ? 1 : 0;
      
      const baseMin = digitalRange.min + sizePrice.base;
      const baseMax = digitalRange.max + sizePrice.base;
      
      // Add premium cost if selected
      const premiumCost = qualityMultiplier * (sizePrice.premium - sizePrice.base);
      
      return {
        min: baseMin + premiumCost,
        max: baseMax + premiumCost,
      };
    }
  };

  const priceRange = calculatePriceRange();

  const handleIncrement = () => {
    if (book?.stock && quantity < book.stock) setQuantity(quantity + 1);
  };
  
  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

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
      stars.push(<FaRegStar key={`empty${i}`} className="text-yellow-500" />);
    return stars;
  };

  return (
    <>
      {/* <Helmet>
        <title>{book.title} | BookStore</title>
        <meta name="description" content={book.description} />
      </Helmet> */}

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto pt-6 px-6">
          <nav className="flex items-center text-sm text-gray-600 space-x-2 mb-6">
            <Link
              to="/"
              className="hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              to="/categories"
              className="hover:text-blue-600 transition-colors"
            >
              Products
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {book.title}
            </span>
          </nav>
        </div>

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            
            {/* Product Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Book Cover */}
                <div className="lg:w-2/5 flex flex-col items-center">
                  <div className="relative w-full max-w-sm group">
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-full h-auto object-cover rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-105"
                      style={{ maxHeight: '480px' }}
                    />
                    <div className="absolute top-4 right-4">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        ⭐ {book.rating}
                      </div>
                    </div>
                    {book.stock > 0 && (
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          ✅ In Stock
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Book Details */}
                <div className="lg:w-3/5 flex flex-col gap-6">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-3 leading-tight">
                      {book.title}
                    </h1>
                    <h2 className="text-xl text-gray-600 mb-4">
                      By <span className="font-semibold text-gray-800">{book.author}</span>
                    </h2>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {book.genre?.map((category, index) => (
                        <span 
                          key={index} 
                          className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          {category}
                        </span>
                      ))}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex text-lg">{renderStars()}</div>
                      <span className="text-gray-600 font-medium">
                        {book.rating} out of 5 • {book.num_reviews} reviews
                      </span>
                    </div>
                  </div>

                  {/* Format Selector */}
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-800">
                      <FaInfoCircle className="text-blue-500" />
                      Choose Format
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setFormat("digital")}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                          format === "digital" 
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg" 
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-3">📱</div>
                          <div className="font-bold text-lg">Digital</div>
                          <div className="text-sm text-gray-600 mt-2">Instant download</div>
                          <div className="text-xs text-blue-600 mt-1">PDF + EPUB included</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setFormat("hardcopy")}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                          format === "hardcopy" 
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg" 
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-3">📚</div>
                          <div className="font-bold text-lg">Hardcopy</div>
                          <div className="text-sm text-gray-600 mt-2">Physical book</div>
                          <div className="text-xs text-blue-600 mt-1">Free shipping over $50</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Hardcopy Options */}
                  {format === "hardcopy" && (
                    <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-200 transition-all duration-500 animate-fadeIn">
                      <h4 className="font-bold text-lg mb-4 text-amber-800 flex items-center gap-2">
                        ⚙️ Customize Your Hardcopy
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            📏 Paper Size
                          </label>
                          <select
                            value={paperSize}
                            onChange={(e) => setPaperSize(e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                          >
                            <option value="A4">A4 (8.3 × 11.7 in)</option>
                            <option value="A5">A5 (5.8 × 8.3 in)</option>
                            <option value="B5">B5 (6.9 × 9.8 in)</option>
                            <option value="Letter">Letter (8.5 × 11 in)</option>
                            <option value="Legal">Legal (8.5 × 14 in)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            ✨ Paper Quality
                          </label>
                          <select
                            value={paperQuality}
                            onChange={(e) => setPaperQuality(e.target.value)}
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                          >
                            <option value="standard">Standard Quality</option>
                            <option value="premium">
                              Premium Quality (+${((paperSizePrices[paperSize]?.premium || 8) - (paperSizePrices[paperSize]?.base || 5)).toFixed(2)})
                            </option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-700 flex items-center gap-2">
                          {paperQualityInfo[paperQuality].icon}
                          <span className="font-medium">{paperQualityInfo[paperQuality].description}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Price Range Display */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-xl flex items-center gap-2 text-gray-800">
                        💰 Price Range
                      </h3>
                      <div className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
                        {format === "digital" ? "Instant Access" : "Physical Copy"}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="text-4xl font-bold text-green-600">
                        ${priceRange.min.toFixed(2)}
                      </span>
                      <span className="text-2xl text-gray-500 font-bold">–</span>
                      <span className="text-4xl font-bold text-green-600">
                        ${priceRange.max.toFixed(2)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 flex items-center gap-2 font-medium">
                        {format === "digital" ? (
                          <><FaBolt className="text-yellow-500" /> Instant digital download</>
                        ) : (
                          <>📦 Printed book ({paperSize}, {paperQuality} quality)</>
                        )}
                      </p>
                      {format === "digital" && (
                        <p className="text-xs text-blue-600 font-medium">• PDF, EPUB formats included</p>
                      )}
                      {format === "hardcopy" && (
                        <p className="text-xs text-blue-600 font-medium">• Free shipping on orders over $50</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Purchase Section */}
            <div className="p-8 bg-white">
              {/* Stock Status */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm border-2 ${
                  book.stock > 0 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {book.stock > 0 ? (
                    <>
                      ✅ <span>{book.stock} books available</span>
                    </>
                  ) : (
                    <>
                      ❌ <span>Currently out of stock</span>
                    </>
                  )}
                </div>
              </div>

              {/* Quantity and Action Buttons */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-700">Quantity:</span>
                  <div className="flex items-center border-2 border-gray-300 overflow-hidden rounded-lg">
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="px-4 py-3 bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-gray-700 hover:text-gray-900"
                    >
                      −
                    </button>
                    <span className="px-6 py-3 bg-white font-bold text-lg border-x-2 border-gray-300">{quantity}</span>
                    <button
                      onClick={handleIncrement}
                      disabled={book.stock && quantity >= book.stock}
                      className="px-4 py-3 bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-gray-700 hover:text-gray-900"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {isAuthenticated ? (
                    <>
                      <button
                        className="bg-blue-600 text-white px-8 py-4 hover:bg-blue-700 transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex-1"
                        onClick={() =>
                          addToCart({
                            item: {
                              id: "ebook-1", // This would be dynamic in a real app
                              title: book.title,
                              price: priceRange.min, // Using min price as base price
                              format: format,
                              ...(format === "hardcopy" && {
                                paperSize: paperSize,
                                paperQuality: paperQuality,
                              }),
                            },
                            quantity,
                          })
                        }
                        disabled={book.stock === 0}
                      >
                        <FaShoppingCart /> Add to Cart
                      </button>
                      <button 
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 px-8 py-4 transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex-1"
                        disabled={book.stock === 0}
                      >
                        <FaBolt /> Buy Now
                      </button>
                    </>
                  ) : (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 text-center">
                      <p className="text-gray-700 font-medium flex items-center justify-center gap-2">
                        🔒 Please{" "}
                        <Link to="/login" className="text-blue-600 underline font-bold hover:text-blue-800">
                          login
                        </Link>{" "}
                        to purchase this book.
                      </p>
                    </div>
                  )}
                </div>

                {/* Book Information */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="font-bold mb-4 text-gray-800 text-lg">📖 Book Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-600 font-medium">Language:</span>
                      <span className="font-bold">{book.language}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-600 font-medium">ISBN:</span>
                      <span className="font-bold">{book.isbn || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-600 font-medium">Published:</span>
                      <span className="font-bold">
                        {book.published_date ? new Date(book.published_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-600 font-medium">Formats:</span>
                      <span className="font-bold">Digital & Physical</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="border-t border-gray-200">
              <div className="flex border-b border-gray-200 bg-gray-50">
                {["description", "details", "reviews"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-4 font-bold transition-all ${
                      activeTab === tab
                        ? "border-b-4 border-blue-500 text-blue-600 bg-white"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-8 bg-white">
                {activeTab === "description" && (
                  <div className="prose max-w-none">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">About This Book</h3>
                    <p className="text-gray-700 leading-relaxed text-lg">{book.description}</p>
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-800">📚 Book Details</h3>
                      <div className="space-y-3 text-gray-700">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium">Title:</span>
                          <span className="font-bold">{book.title}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium">Author:</span>
                          <span className="font-bold">{book.author}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium">ISBN:</span>
                          <span className="font-bold">{book.isbn || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium">Publisher:</span>
                          <span className="font-bold">TechBooks Publishing</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium">Publication Date:</span>
                          <span className="font-bold">{book.published_date ? new Date(book.published_date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-800">📖 Format Information</h3>
                      <div className="space-y-3 text-gray-700">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium">Digital Formats:</span>
                          <span className="font-bold">PDF, EPUB</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium">Hardcopy Options:</span>
                          <span className="font-bold">Multiple sizes & qualities</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium">Language:</span>
                          <span className="font-bold">{book.language}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium">Genre(s):</span>
                          <span className="font-bold">{book.genre?.join(', ') || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span className="font-medium">Availability:</span>
                          <span className={`font-bold ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {book.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <div className="text-5xl font-bold text-gray-800">{book.rating}</div>
                      <div>
                        <div className="flex text-xl mb-2">{renderStars()}</div>
                        <p className="text-gray-600 font-medium">Based on {book.num_reviews} reviews</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <p className="text-gray-700 text-lg font-medium">No reviews yet. Be the first to review this book!</p>
                      
                      {isAuthenticated && (
                        <button className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-bold">
                          ✍️ Write a Review
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EbookProductPage;
