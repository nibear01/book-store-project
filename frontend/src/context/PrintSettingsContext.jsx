import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const PrintSettingsContext = createContext();

export const usePrintSettings = () => {
  const context = useContext(PrintSettingsContext);
  if (!context) {
    throw new Error('usePrintSettings must be used within PrintSettingsProvider');
  }
  return context;
};

export const PrintSettingsProvider = ({ children }) => {
  const [printSettings, setPrintSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();

    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/print-config", {
          signal: abortController.signal,
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        
        if (mounted && !abortController.signal.aborted && data?.success && data?.data) {
          setPrintSettings(data.data);
        }
      } catch (error) {
        // Ignore aborted requests
        if (error.name === 'AbortError') {
          return;
        }
        console.warn("Print settings not available:", error.message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, []);

  return (
    <PrintSettingsContext.Provider value={{ printSettings, loading }}>
      {children}
    </PrintSettingsContext.Provider>
  );
};

PrintSettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
