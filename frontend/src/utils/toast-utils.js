import React from "react";
import { toast } from "react-toastify";

/**
 * Safe toast wrapper that prevents errors from being thrown
 * Useful for async operations where component might unmount
 */
class SafeToast {
  constructor() {
    this.mounted = true;
  }

  setMounted(value) {
    this.mounted = value;
  }

  success(message, options) {
    if (this.mounted) {
      try {
        return toast.success(message, options);
      } catch (error) {
        console.warn("Toast error:", error);
      }
    }
  }

  error(message, options) {
    if (this.mounted) {
      try {
        return toast.error(message, options);
      } catch (error) {
        console.warn("Toast error:", error);
      }
    }
  }

  info(message, options) {
    if (this.mounted) {
      try {
        return toast.info(message, options);
      } catch (error) {
        console.warn("Toast error:", error);
      }
    }
  }

  warning(message, options) {
    if (this.mounted) {
      try {
        return toast.warning(message, options);
      } catch (error) {
        console.warn("Toast error:", error);
      }
    }
  }

  dismiss(id) {
    if (this.mounted) {
      try {
        return toast.dismiss(id);
      } catch (error) {
        console.warn("Toast error:", error);
      }
    }
  }
}

/**
 * Hook to create a safe toast instance that respects component lifecycle
 * Usage:
 * ```jsx
 * const safeToast = useSafeToast();
 * 
 * useEffect(() => {
 *   fetchData().then(() => {
 *     safeToast.success("Data loaded!");
 *   });
 * }, []);
 * ```
 */
export function useSafeToast() {
  const toastRef = React.useRef(new SafeToast());

  React.useEffect(() => {
    const instance = toastRef.current;
    instance.setMounted(true);
    return () => {
      instance.setMounted(false);
    };
  }, []);

  return toastRef.current;
}

/**
 * Simple debounced toast to prevent duplicate messages
 */
const toastCache = new Map();
const DEBOUNCE_TIME = 1000; // 1 second

export function debouncedToast(type, message, options) {
  const key = `${type}-${message}`;
  const now = Date.now();
  const lastCall = toastCache.get(key);

  if (lastCall && now - lastCall < DEBOUNCE_TIME) {
    return; // Skip duplicate
  }

  toastCache.set(key, now);
  
  try {
    switch (type) {
      case "success":
        return toast.success(message, options);
      case "error":
        return toast.error(message, options);
      case "info":
        return toast.info(message, options);
      case "warning":
        return toast.warning(message, options);
      default:
        return toast(message, options);
    }
  } catch (error) {
    console.warn("Toast error:", error);
  }
}

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of toastCache.entries()) {
    if (now - timestamp > DEBOUNCE_TIME * 2) {
      toastCache.delete(key);
    }
  }
}, DEBOUNCE_TIME * 3);

export default toast;
