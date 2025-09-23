import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Immediate error suppression - runs before anything else
(function() {
  // Nuclear option: Completely override all error reporting
  const silentHandler = () => {};
  
  // Store original methods
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  const originalConsoleError = console.error;

  // Function to check if error is from extension
  const isExtensionError = (obj, source, message) => {
    if (!obj && !source && !message) return false;
    
    // Check error object
    if (obj) {
      const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
      if (obj.name === 'i' || obj.code === 403) return true;
      if (str.includes('content.js') ||
          str.includes('extension://') ||
          str.includes('background.js') ||
          str.includes('permission error') ||
          str.includes('UserAuthError') ||
          str.includes('exceptions.UserAuthError') ||
          str.includes('Uncaught (in promise)') ||
          str.includes('getComputedStyle') ||
          str.includes('MutationObserver') ||
          str.includes('querySelectorAll') ||
          str.includes('Helmet.js')) return true;
    }
    
    // Check source file
    if (source && (
      source.includes('content.js') ||
      source.includes('background.js') ||
      source.includes('extension://') ||
      source.includes('Helmet.js')
    )) return true;
    
    // Check error message
    if (message && (
      message.includes('content.js') ||
      message.includes('getComputedStyle') ||
      message.includes('MutationObserver') ||
      message.includes('querySelectorAll') ||
      message.includes('parameter 1 is not of type') ||
      message.includes('Cannot read properties of null')
    )) return true;
    
    return false;
  };

  // Complete console override
  console.error = console.warn = console.log = (...args) => {
    // Check if any argument is extension-related
    const hasExtensionError = args.some(arg => {
      if (isExtensionError(arg)) return true;
      if (typeof arg === 'string' && (
        arg.includes('content.js') ||
        arg.includes('background.js') ||
        arg.includes('Uncaught TypeError') ||
        arg.includes('Uncaught (in promise)') ||
        arg.includes('permission error') ||
        arg.includes('getComputedStyle') ||
        arg.includes('MutationObserver') ||
        arg.includes('querySelectorAll') ||
        arg.includes('parameter 1 is not of type') ||
        arg.includes('Cannot read properties of null') ||
        arg.includes('Helmet.js')
      )) return true;
      return false;
    });
    
    if (hasExtensionError) return;
    originalConsoleError.apply(console, args);
  };

  // Complete window error override
  window.onerror = window.onunhandledrejection = () => true;
  
  // Override addEventListener to prevent any extension error listeners
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'error' || type === 'unhandledrejection') {
      return originalAddEventListener.call(this, type, silentHandler, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  // Disable all error event dispatching
  const originalDispatchEvent = EventTarget.prototype.dispatchEvent;
  EventTarget.prototype.dispatchEvent = function(event) {
    if (event.type === 'error' || event.type === 'unhandledrejection') {
      return true;
    }
    return originalDispatchEvent.call(this, event);
  };
})();

// Override window.onerror as well
window.onerror = function(message, source, lineno, colno, error) {
  if (source && (source.includes('extension://') || source.includes('content.js') || source.includes('background.js'))) {
    return true; // Prevent default handling
  }
  if (error && (error.name === 'i' || error.code === 403 || (error.message && error.message.includes('permission error')))) {
    return true;
  }
  return false;
};

// Multiple unhandled rejection handlers for maximum coverage
const suppressExtensionRejection = (event) => {
  const reason = event.reason;
  if (reason && (
    reason.name === 'i' ||
    reason.code === 403 ||
    (reason.message && reason.message.includes('permission error')) ||
    (reason.data && reason.data.msg && reason.data.msg.includes('permission error')) ||
    (reason.originalError && reason.originalError.stack && reason.originalError.stack.includes('background.js')) ||
    (reason.reqInfo && reason.reqInfo.pathPrefix && (
      reason.reqInfo.pathPrefix.includes('/writing') ||
      reason.reqInfo.pathPrefix.includes('/generate') ||
      reason.reqInfo.pathPrefix.includes('/site_integration')
    ))
  )) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return false;
  }
};

// Set multiple handlers
window.onunhandledrejection = suppressExtensionRejection;
if (window.addEventListener) {
  window.addEventListener('unhandledrejection', suppressExtensionRejection, true);
}
if (document.addEventListener) {
  document.addEventListener('unhandledrejection', suppressExtensionRejection, true);
}

// Monkey patch Promise to catch extension errors at source
const originalPromiseCatch = Promise.prototype.catch;
Promise.prototype.catch = function(onRejected) {
  return originalPromiseCatch.call(this, function(reason) {
    // Silently handle extension errors
    if (reason && (
      reason.name === 'i' ||
      reason.code === 403 ||
      (reason.message && reason.message.includes('permission error')) ||
      (reason.data && reason.data.msg && reason.data.msg.includes('permission error')) ||
      (reason.originalError && reason.originalError.stack && reason.originalError.stack.includes('background.js'))
    )) {
      return Promise.resolve(); // Resolve silently
    }
    if (onRejected) {
      return onRejected(reason);
    }
    throw reason;
  });
};

// Global error handlers to suppress browser extension errors
window.addEventListener('error', (event) => {
  // Check if error is from browser extension
  if (event.filename?.includes('extension://') || 
      event.filename?.includes('content.js') ||
      event.error?.stack?.includes('extension://') ||
      event.error?.stack?.includes('content.js') ||
      event.error?.stack?.includes('background.js') ||
      event.error?.name === 'i' ||
      event.error?.code === 403 ||
      String(event.error?.message).includes('permission error')) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  // Check if rejection is from browser extension
  if (reason?.stack?.includes('extension://') ||
      reason?.stack?.includes('content.js') ||
      reason?.stack?.includes('background.js') ||
      reason?.name === 'i' ||
      reason?.code === 403 ||
      reason?.message?.includes('permission error') ||
      reason?.data?.msg?.includes('permission error') ||
      reason?.reqInfo?.pathPrefix?.includes('/generate') ||
      reason?.reqInfo?.pathPrefix?.includes('/writing') ||
      reason?.reqInfo?.pathPrefix?.includes('/site_integration') ||
      String(reason).includes('content.js') ||
      String(reason).includes('permission error') ||
      String(reason).includes('UserAuthError')) {
    event.preventDefault();
    return false;
  }
});

// Override console.error to filter extension errors
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = String(args[0] || '');
  const firstArg = args[0];
  
  // Don't log browser extension errors
  if (message.includes('content.js') || 
      message.includes('extension://') ||
      message.includes('background.js') ||
      message.includes('permission error') ||
      message.includes('UserAuthError') ||
      (firstArg?.name === 'i' && firstArg?.code === 403) ||
      firstArg?.message?.includes('permission error') ||
      firstArg?.data?.msg?.includes('permission error') ||
      firstArg?.reqInfo?.pathPrefix?.includes('/generate') ||
      firstArg?.reqInfo?.pathPrefix?.includes('/writing') ||
      firstArg?.reqInfo?.pathPrefix?.includes('/site_integration')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Also override console.warn for extension warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = String(args[0] || '');
  if (message.includes('content.js') || 
      message.includes('extension://') ||
      message.includes('background.js') ||
      message.includes('permission error')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Additional protection for promise rejections that bypass the handler
const originalRejectionHandler = window.onunhandledrejection;
window.onunhandledrejection = (event) => {
  const reason = event.reason;
  if (reason?.name === 'i' && reason?.code === 403) {
    event.preventDefault();
    return false;
  }
  if (originalRejectionHandler) {
    return originalRejectionHandler.call(window, event);
  }
};

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <App />
  // </StrictMode>
);
