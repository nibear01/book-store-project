import React from 'react';

function Join() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-2xl mx-auto text-center  rounded-xl  p-8">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
          Join Our Newsletter
        </h2>
        <p className="mt-2 text-xl text-gray-500">
          Sign up to be the first to hear about exclusive deals, special offers and upcoming collections.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="email"
            placeholder="Enter email for weekly newsletter"
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            className="w-full sm:w-auto px-6 py-3 text-lg font-semibold rounded-lg transition-all duration-300 bg-black text-white shadow-md hover:bg-gray-800"
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}

export default Join;
