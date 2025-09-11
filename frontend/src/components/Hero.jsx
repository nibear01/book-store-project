import React, { useState } from "react";
import img1 from "../assets/images/img1-12 (4).png";

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0); // for highlighting active dot
  const totalDots = 4; // total number of dots you want

  return (
    <section className="w-full bg-white py-12 border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-4">
        {/* Left Text Section */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <p className="uppercase text-gray-500 text-sm font-medium tracking-wider">
            The Bookworm Editors'
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal mt-2 text-gray-800">
            Featured Book of the <span className="font-bold block">February</span>
          </h2>
          <button className="mt-6 bg-black text-white px-6 py-3 rounded-[2px] hover:bg-gray-800 transition-colors shadow-sm">
            See More
          </button>
        </div>

        {/* Right Single Book Image */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <img
            src={img1}
            alt="Featured Book"
            className="w-full h-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-[2px] shadow-md object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>

      {/* Carousel Dots */}
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: totalDots }).map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              index === activeIndex ? "bg-black" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;