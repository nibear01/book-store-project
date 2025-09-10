import React, { useState } from 'react';

const SignpPage = () => {
  const [email, setEmail] = useState('');
  const [showError, setShowError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() === '') {
      setShowError(true);
    } else {
      setShowError(false);
      // Logic for form submission
      console.log('Form submitted with email:', email);
    }
  };

  const handleClose = () => {
    // This function would typically close the modal or navigate away
    console.log('Close button clicked');
    // For this example, we'll just reset the state
    setEmail('');
    setShowError(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-6 border-gray-200">
          <div className="flex items-center space-x-2 text-xl font-semibold text-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span>Create Account</span>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email *
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  showError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {showError && (
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Password Info */}
          <p className="text-sm text-gray-500 my-4">
            A password will be automatically created and sent to your email address.
          </p>

          {/* Privacy Policy */}
          <p className="text-sm text-gray-700 my-6">
            Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our{' '}
            <a href="#" className="text-blue-600 hover:underline">
              privacy policy
            </a>
            .
          </p>

          {/* Create Account Button */}
          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-3 rounded-md font-semibold hover:bg-gray-900 transition-colors focus:outline-none"
          >
            Create Account
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignpPage;
