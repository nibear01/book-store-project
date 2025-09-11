// src/components/Hero.jsx
import React, { useState } from "react";
import img1 from "../assets/images/img1-12 (4).png";

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0); // for highlighting active dot
  const totalDots = 4; // total number of dots you want

  return (
    <section className="w-full bg-pink-50 py-16 ">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-4">
        {/* Left Text Section */}
        <div className="w-full md:w-1/2 text-center md:text-left mt-20">
          <p className="uppercase text-gray-500 font-semibold">
            The Bookworm Editors’
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl  mt-2 ">
            Featured Book of the <span className="text-black font-bold"><br/>February</span>
          </h2>
          <button className="mt-6 bg-black text-white px-6 py-3 rounded-md shadow hover:bg-gray-800 transition">
            See More
          </button>
        </div>

        {/* Right Single Book Image */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <img
            src={img1}
            alt="Featured Book"
            className="w-full h-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-lg shadow-lg object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>

      {/* Carousel Dots */}
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: totalDots }).map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              index === activeIndex ? "bg-black" : "bg-gray-300"
            }`}
          ></span>
        ))}
      </div>
    </section>
  );
};

export default Hero;
