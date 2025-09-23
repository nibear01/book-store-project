import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.warn('ErrorBoundary caught an error:', error, errorInfo);
    
    // Don't log browser extension errors to avoid spam
    if (error?.stack?.includes('extension://') || 
        error?.stack?.includes('content.js') ||
        error?.name === 'i' ||
        error?.code === 403) {
      return;
    }
  }

  render() {
    if (this.state.hasError) {
      // Don't show error UI for browser extension errors
      if (this.state.error?.stack?.includes('extension://') || 
          this.state.error?.stack?.includes('content.js') ||
          this.state.error?.name === 'i' ||
          this.state.error?.code === 403) {
        return this.props.children;
      }

      // Show error UI for actual app errors
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please refresh the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;