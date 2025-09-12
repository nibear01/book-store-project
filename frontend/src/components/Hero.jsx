import React, { useState, useEffect } from "react";
import img1 from "../assets/images/img1-12 (4).png";
import img2 from "../assets/pexels-pixabay-159866.jpg";
import img3 from "../assets/pexels-minan1398-694740.jpg";
import img4 from "../assets/images/img1-12 (4).png";

const Hero = () => {
  const images = [img1, img2, img3, img4];
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play every 4s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <section className="w-full bg-white py-16 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 px-6">
        {/* Left Text Section */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <p className="uppercase text-gray-500 text-sm tracking-widest">
            The Bookworm Editors'
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3">
            Featured Book of the{" "}
            <span className="text-indigo-600">February</span>
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Discover our handpicked recommendation — a book that inspires,
            educates, and entertains. Dive in and explore the story everyone’s
            talking about this month.
          </p>
          <button className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-500 transition-colors shadow-sm">
            See More
          </button>
        </div>

        {/* Right Image Carousel */}
        <div className="w-full md:w-1/2 relative flex justify-center">
          <img
            src={images[activeIndex]}
            alt={`Featured Book ${activeIndex + 1}`}
            className="w-full h-auto max-w-xs sm:max-w-sm md:max-w-md rounded-md shadow-md object-cover transition-all duration-700 ease-in-out"
          />

          {/* Prev Button */}
          {/* <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 shadow-md p-2 rounded-full"
          >
            <ChevronLeft size={22} />
          </button> */}

          {/* Next Button */}
          {/* <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 shadow-md p-2 rounded-full"
          >
            <ChevronRight size={22} />
          </button> */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
