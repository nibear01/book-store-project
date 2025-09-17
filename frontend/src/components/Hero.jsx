/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import img1 from "../assets/images/img1-12 (4).png";
import img2 from "../assets/pexels-pixabay-159866.jpg";
import img3 from "../assets/pexels-minan1398-694740.jpg";
import img4 from "../assets/images/img1-12 (4).png";

const Hero = () => {
  const images = [img1, img2, img3, img4];
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);

  // Auto-play
  useEffect(() => {
    const t = setInterval(() => {
      setActiveIndex((p) => (p + 1) % images.length);
    }, 4000);
    return () => clearInterval(t);
  }, [images.length]);

  // Keyboard nav (optional)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") setActiveIndex((p) => (p - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setActiveIndex((p) => (p + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length]);

  const prevSlide = () => setActiveIndex((p) => (p - 1 + images.length) % images.length);
  const nextSlide = () => setActiveIndex((p) => (p + 1) % images.length);

  // Inline style for the track to ensure exact vw-based width & transform using translate3d
  const trackStyle = {
    width: `${images.length * 100}vw`,
    transform: `translate3d(-${activeIndex * 100}vw, 0, 0)`,
    transition: "transform 700ms ease-in-out",
    willChange: "transform",
    WebkitBackfaceVisibility: "hidden",
    backfaceVisibility: "hidden",
    transformStyle: "preserve-3d",
  };

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* Track */}
      <div
        ref={trackRef}
        className="flex h-full gap-0"
        style={trackStyle}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="relative w-screen h-screen flex-shrink-0 overflow-hidden"
            style={{ lineHeight: 0 }} // helps avoid any inline gaps
          >
            <img
              src={src}
              alt={`Slide ${i + 1}`}
              draggable={false}
              className="block w-full h-full object-cover"
              style={{ display: "block" }}
            />
            {/* Dark overlay to make text readable */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Centered overlay text */}
      <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
        <div className="text-center max-w-3xl">
          <p className="uppercase text-gray-200 text-sm md:text-base tracking-widest">
            The Bookworm Editors'
          </p>
          <h1 className="text-3xl md:text-6xl font-bold text-white mt-3 leading-tight">
            Featured Book of the <span className="text-indigo-400">February</span>
          </h1>
          <p className="mt-4 text-gray-200 text-sm md:text-lg">
            Discover our handpicked recommendation — a book that inspires, educates,
            and entertains. Dive in and explore the story everyone’s talking about this month.
          </p>
          <button className="mt-6 md:mt-8 bg-indigo-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-md hover:bg-indigo-500 transition-colors">
            See More
          </button>
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 shadow-md p-2 md:p-3 rounded-full z-30"
      >
        &#10094;
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 shadow-md p-2 md:p-3 rounded-full z-30"
      >
        &#10095;
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-transform ${
              activeIndex === i ? "bg-indigo-600 scale-110" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;