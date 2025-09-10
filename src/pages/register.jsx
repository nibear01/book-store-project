import React from 'react';
import { createRoot } from 'react-dom/client';

// Assume Tailwind CSS is available.
// Assume react-icons is NOT available, so we'll use a simple inline SVG for the icons.

function App() {
  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">

        {/* Header Section */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
          <div className="flex items-center space-x-2">
            {/* User icon - using simple text for representation */}
            <span className="text-xl text-gray-700">📄</span>
            <h1 className="text-xl font-semibold text-gray-800">Create Account</h1>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <span className="text-sm font-light">Close</span>
            {/* Close icon - using inline SVG for simplicity */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Section */}
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <p className="text-gray-500 text-sm">A password will be sent to your email address.</p>

          <p className="text-gray-500 text-sm">
            Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our <a href="#" className="text-red-500 hover:underline">privacy policy</a>.
          </p>

          <button 
            type="submit" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
          >
            Create Account
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">Already have an account? <a href="#" className="text-black hover:underline">Login</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
