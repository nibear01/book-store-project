import React from 'react';

function Join() {
  return (
    <div className="py-12 md:py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center  rounded-2xl p-6 md:p-8 lg:p-12">
        {/* Icon/Emoji for visual appeal */}
        <div className="mb-4 md:mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-full">
            <span className="text-2xl md:text-3xl">📬</span>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
          Join Our Newsletter
        </h2>

        {/* Description */}
        <p className="text-[12px] sm:text-[14px] lg:text-[16px] text-gray-600 mb-6 md:mb-8 leading-relaxed max-w-3xl mx-auto">
          Sign up to be the first to hear about exclusive deals, special offers and upcoming collections.
        </p>

        {/* Form */}
        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-1 md:px-6 md:py-2 border border-gray-300 rounded-[2px] text-base md:text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 transition-all duration-200"
            aria-label="Email address for newsletter subscription"
          />
          <button
            className="w-full sm:w-auto px-6 py-1 md:px-8 md:py-2 text-base md:text-lg rounded-[2px] transition-all duration-300
            cursor-pointer bg-black text-white hover:bg-gray-800 active:bg-gray-900"
          >
            Subscribe
          </button>
        </div>

        {/* Privacy Note */}
        <p className="mt-4 md:mt-6 text-sm md:text-base text-gray-500 max-w-md mx-auto">
          We respect your privacy. Unsubscribe at any time.
        </p>

        {/* Success/Error Messages (can be conditionally rendered) */}
        {/* <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
          Success! Thank you for subscribing.
        </div> */}
      </div>

      {/* Decorative Elements */}
      <div className="absolute left-0 right-0 -z-10">
        <div className="absolute top-10 left-5 w-24 h-24 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute bottom-10 right-5 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>
    </div>
  );
}

export default Join;