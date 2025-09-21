// Mock book service to handle API requests when backend is unavailable

const mockBooks = [
  {
    _id: "1",
    title: "The Complete Guide to Modern Web Development",
    slug: "sample-ebook",
    author: "Jane Smith",
    cover_image: "/assets/images/book-cover.jpg",
    description: "A comprehensive guide to modern web development practices, frameworks, and tools.",
    rating: 4.5,
    num_reviews: 128,
    genre: ["Educational", "Technology", "Programming"],
    language: "English",
    isbn: "978-1234567890",
    published_date: "2023-05-15",
    stock: 50,
    price: 29.99,
    sale_price: 24.99,
    is_featured: true,
    is_trending: true,
    is_new: true,
    is_on_sale: true
  },
  {
    _id: "2",
    title: "JavaScript: The Good Parts",
    slug: "javascript-good-parts",
    author: "Douglas Crockford",
    cover_image: "/assets/images/js-book.jpg",
    description: "This book focuses on the good parts of JavaScript, the subset that's robust, maintainable, and expressive.",
    rating: 4.7,
    num_reviews: 245,
    genre: ["Technology", "Programming"],
    language: "English",
    isbn: "978-0596517748",
    published_date: "2008-05-01",
    stock: 30,
    price: 34.99,
    sale_price: 29.99,
    is_featured: true,
    is_trending: true,
    is_new: false,
    is_on_sale: true
  }
];

export const mockBookService = {
  // Get all books
  getBooks: () => {
    return Promise.resolve(mockBooks);
  },
  
  // Get featured books
  getFeaturedBooks: (limit = 10) => {
    const featured = mockBooks.filter(book => book.is_featured).slice(0, limit);
    return Promise.resolve(featured);
  },
  
  // Get trending books
  getTrendingBooks: (limit = 10) => {
    const trending = mockBooks.filter(book => book.is_trending).slice(0, limit);
    return Promise.resolve(trending);
  },
  
  // Get latest books
  getLatestBooks: (limit = 10) => {
    const latest = mockBooks.filter(book => book.is_new).slice(0, limit);
    return Promise.resolve(latest);
  },
  
  // Get on sale books
  getOnSaleBooks: (limit = 10) => {
    const onSale = mockBooks.filter(book => book.is_on_sale).slice(0, limit);
    return Promise.resolve(onSale);
  },
  
  // Get book by slug
  getBookBySlug: (slug) => {
    const book = mockBooks.find(book => book.slug === slug);
    return Promise.resolve(book || null);
  },
  
  // Get deals of the week
  getDealsOfWeek: (limit = 10) => {
    const deals = mockBooks.filter(book => book.is_on_sale).slice(0, limit);
    return Promise.resolve(deals);
  }
};