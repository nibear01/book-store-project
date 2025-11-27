import { useEffect } from 'react';
const url = import.meta?.env?.VITE_BACKEND_URL || 'http://192.168.0.104:5000';

// Simple, dependency-free SEO component to avoid legacy UNSAFE lifecycles from react-helmet.
// Manages only the tags we need and cleans them up on change/unmount.
const BookSEO = ({ book, currentImageIndex = 0 }) => {
  useEffect(() => {
    if (!book) return;

    const head = document.head;
    const created = [];

    const setTag = (selector, createFn) => {
      let el = head.querySelector(selector);
      if (!el) {
        el = createFn();
        head.appendChild(el);
        created.push(el);
      }
      return el;
    };

    // Title
    const prevTitle = document.title;
    document.title = `${book.meta_title || book.title} | BookStore`;

    // Description
    if (book.meta_description || book.description) {
      const desc = setTag('meta[name="description"]', () => {
        const m = document.createElement('meta');
        m.setAttribute('name', 'description');
        return m;
      });
      desc.setAttribute('content', book.meta_description || book.description);
    }

    // Keywords
    if (book.meta_keywords && book.meta_keywords.length > 0) {
      const kw = setTag('meta[name="keywords"]', () => {
        const m = document.createElement('meta');
        m.setAttribute('name', 'keywords');
        return m;
      });
      kw.setAttribute('content', book.meta_keywords.join(', '));
    }

    // Open Graph basic tags
    const ogTitle = setTag('meta[property="og:title"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:title');
      return m;
    });
    ogTitle.setAttribute('content', book.meta_title || book.title);

    const ogDesc = setTag('meta[property="og:description"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:description');
      return m;
    });
    ogDesc.setAttribute('content', book.meta_description || book.description || '');

    const ogType = setTag('meta[property="og:type"]', () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:type');
      return m;
    });
    ogType.setAttribute('content', 'book');

    // Image (replace if exists)
    const currentImage = Array.isArray(book.cover_image) && book.cover_image.length > 0
      ? book.cover_image[Math.min(currentImageIndex, book.cover_image.length - 1)]
      : book.cover_image;
    if (currentImage) {
      const ogImg = setTag('meta[property="og:image"]', () => {
        const m = document.createElement('meta');
        m.setAttribute('property', 'og:image');
        return m;
      });
      // Consider env base URL later
      ogImg.setAttribute('content', `${url}${currentImage}`);
    }

    return () => {
      // Restore previous title (optional decision)
      document.title = prevTitle;
      // Only remove tags we created in this effect (others may belong to layout)
      created.forEach(el => {
        if (el && el.parentNode === head) head.removeChild(el);
      });
    };
  }, [book, currentImageIndex]);

  return null;
};

export default BookSEO;