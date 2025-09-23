import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mock data
const mockBooks = [
  {
    _id: '1',
    title: 'All You Can Ever Know: A Memoir',
    author: 'J. D. Robb',
    genre: ['Biography'],
    price: 14.20,
    rating: 4.5,
    num_reviews: 125,
    stock: 25,
    cover_image: ['/images/img1-13.png'],
    slug: 'all-you-can-ever-know-memoir',
    is_active: true,
    is_featured: true
  },
  {
    _id: '2',
    title: 'Broken Faith: Inside the Word of Faith',
    author: 'Edward Lee',
    genre: ['History'],
    price: 10.29,
    rating: 4.2,
    num_reviews: 89,
    stock: 15,
    cover_image: ['/images/12-120x183.jpg'],
    slug: 'broken-faith-inside-word-faith',
    is_active: true,
    is_featured: false
  },
  {
    _id: '3',
    title: 'Love Story Collection',
    author: 'Emily March',
    genre: ['Romance'],
    price: 6.99,
    rating: 4.7,
    num_reviews: 203,
    stock: 40,
    cover_image: ['/images/14-120x183.jpg'],
    slug: 'love-story-collection',
    is_active: true,
    is_featured: true
  },
  {
    _id: '4',
    title: 'Jesus: The God Who Knows Your Name',
    author: 'Max Lucado',
    genre: ['Biography'],
    price: 16.59,
    rating: 4.8,
    num_reviews: 156,
    stock: 30,
    cover_image: ['/images/img1-13.png'],
    slug: 'jesus-god-knows-your-name',
    is_active: true,
    is_featured: false
  },
  {
    _id: '5',
    title: 'The Complete Guide to Healthy Living',
    author: 'Dr. Stassi Schroeder',
    genre: ['Health'],
    price: 4.72,
    rating: 4.3,
    num_reviews: 78,
    stock: 20,
    cover_image: ['/images/22-200x327.jpg'],
    slug: 'complete-guide-healthy-living',
    is_active: true,
    is_featured: true,
    is_on_sale: true,
    sale_price: 4.72
  },
  {
    _id: '6',
    title: 'Photography Mastery',
    author: 'Pieter du Toit',
    genre: ['Arts & Photography'],
    price: 29.95,
    rating: 4.6,
    num_reviews: 134,
    stock: 18,
    cover_image: ['/images/23-120x183.jpg'],
    slug: 'photography-mastery',
    is_active: true,
    is_featured: false
  },
  {
    _id: '7',
    title: 'JavaScript: The Definitive Guide',
    author: 'David Flanagan',
    genre: ['Technology'],
    price: 45.99,
    rating: 4.4,
    num_reviews: 245,
    stock: 12,
    cover_image: ['/images/img1-13.png'],
    slug: 'javascript-definitive-guide',
    is_active: true,
    is_featured: true
  },
  {
    _id: '8',
    title: 'The Complete Guide to Cooking',
    author: 'Gordon Ramsay',
    genre: ['Food & Drink'],
    price: 32.50,
    rating: 4.9,
    num_reviews: 189,
    stock: 22,
    cover_image: ['/images/12-120x183.jpg'],
    slug: 'complete-guide-cooking',
    is_active: true,
    is_featured: false
  },
  {
    _id: '9',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: ['Literature'],
    price: 12.99,
    rating: 4.8,
    num_reviews: 567,
    stock: 50,
    cover_image: ['/images/14-120x183.jpg'],
    slug: 'pride-and-prejudice',
    is_active: true,
    is_featured: true
  },
  {
    _id: '10',
    title: 'Lonely Planet Europe',
    author: 'Lonely Planet',
    genre: ['Travel'],
    price: 28.95,
    rating: 4.5,
    num_reviews: 98,
    stock: 35,
    cover_image: ['/images/22-200x327.jpg'],
    slug: 'lonely-planet-europe',
    is_active: true,
    is_featured: false
  },
  {
    _id: '11',
    title: 'The History of Music Theory',
    author: 'Sarah Johnson',
    genre: ['Music'],
    price: 41.20,
    rating: 4.2,
    num_reviews: 67,
    stock: 8,
    cover_image: ['/images/30-120x183.jpg'],
    slug: 'history-music-theory',
    is_active: true,
    is_featured: false
  },
  {
    _id: '12',
    title: 'World War II Chronicles',
    author: 'Michael Brown',
    genre: ['History'],
    price: 35.75,
    rating: 4.6,
    num_reviews: 234,
    stock: 16,
    cover_image: ['/images/23-120x183.jpg'],
    slug: 'world-war-ii-chronicles',
    is_active: true,
    is_featured: true
  }
];

// GET /api/books
app.get('/api/books', (req, res) => {
  const { genre, limit = 10, page = 1 } = req.query;
  
  let filteredBooks = mockBooks.filter(book => book.is_active);
  
  if (genre) {
    filteredBooks = filteredBooks.filter(book => 
      book.genre.some(g => g.toLowerCase().includes(genre.toLowerCase()))
    );
  }
  
  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  
  const books = filteredBooks.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: books,
    pagination: {
      total: filteredBooks.length,
      page: pageNum,
      pages: Math.ceil(filteredBooks.length / limitNum),
      limit: limitNum
    }
  });
});

// GET /api/books/featured
app.get('/api/books/featured', (req, res) => {
  const { limit = 10 } = req.query;
  const limitNum = parseInt(limit);
  
  const featuredBooks = mockBooks
    .filter(book => book.is_featured && book.is_active)
    .slice(0, limitNum);
  
  res.json({
    success: true,
    data: featuredBooks
  });
});

// GET /api/books/latest
app.get('/api/books/latest', (req, res) => {
  const { limit = 10 } = req.query;
  const limitNum = parseInt(limit);
  
  const latestBooks = mockBooks
    .filter(book => book.is_active)
    .slice(0, limitNum);
  
  res.json({
    success: true,
    data: latestBooks
  });
});

// GET /api/books/deals
app.get('/api/books/deals', (req, res) => {
  const { limit = 10 } = req.query;
  const limitNum = parseInt(limit);
  
  const dealBooks = mockBooks
    .filter(book => book.is_on_sale && book.is_active)
    .slice(0, limitNum);
  
  res.json({
    success: true,
    data: dealBooks
  });
});

// GET /api/books/on-sale
app.get('/api/books/on-sale', (req, res) => {
  const { limit = 10 } = req.query;
  const limitNum = parseInt(limit);
  
  const saleBooks = mockBooks
    .filter(book => book.is_on_sale && book.is_active)
    .slice(0, limitNum);
  
  res.json({
    success: true,
    data: saleBooks
  });
});

// GET /api/books/most-viewed
app.get('/api/books/most-viewed', (req, res) => {
  const { limit = 10 } = req.query;
  const limitNum = parseInt(limit);
  
  const viewedBooks = mockBooks
    .filter(book => book.is_active)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, limitNum);
  
  res.json({
    success: true,
    data: viewedBooks
  });
});

// GET /api/books/:slug
app.get('/api/books/:slug', (req, res) => {
  const { slug } = req.params;
  const book = mockBooks.find(b => b.slug === slug && b.is_active);
  
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }
  
  res.json({
    success: true,
    data: book
  });
});

// GET /api/categories
app.get('/api/categories', (req, res) => {
  const categories = [
    {
      name: 'Arts & Photography',
      icon: '🖼️',
      action_link: '/shop/arts-photography'
    },
    {
      name: 'Food & Drink',
      icon: '🍔',
      action_link: '/shop/food-drink'
    },
    {
      name: 'Romance',
      icon: '❤️',
      action_link: '/shop/romance'
    },
    {
      name: 'Health',
      icon: '🩺',
      action_link: '/shop/health'
    },
    {
      name: 'Biography',
      icon: '✍️',
      action_link: '/shop/biography'
    },
    {
      name: 'Literature',
      icon: '📖',
      action_link: '/shop/literature'
    },
    {
      name: 'Technology',
      icon: '💻',
      action_link: '/shop/technology'
    },
    {
      name: 'Travel',
      icon: '🌍',
      action_link: '/shop/travel'
    },
    {
      name: 'Music',
      icon: '🎵',
      action_link: '/shop/music'
    },
    {
      name: 'History',
      icon: '🏛️',
      action_link: '/shop/history'
    }
  ];
  
  res.json({
    success: true,
    data: categories
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock Server running on http://localhost:${PORT}`);
  console.log('📚 Mock data loaded with ' + mockBooks.length + ' books');
  console.log('🎯 Available categories: ' + [...new Set(mockBooks.flatMap(b => b.genre))].join(', '));
});