import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const CentralLoader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900">
    <style>{`
      @keyframes fadePulse {
        0%, 100% { opacity: .35; }
        50%      { opacity: 1; }
      }
      @media (prefers-reduced-motion: reduce){
        .pulse { animation: none !important; }
      }
    `}</style>
    <div className="flex flex-col items-center gap-5 select-none">
      <div className="flex items-center">
        <img src="/logo.png" alt="Bookstore Logo" className="w-32 sm:w-36 md:w-40 lg:w-48 h-auto" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-20 h-2 rounded bg-red-500/70 pulse" style={{ animation: "fadePulse 1.6s ease-in-out infinite" }} />
        <div className="w-24 h-2 rounded bg-gray-300 dark:bg-gray-700 pulse" style={{ animation: "fadePulse 1.6s ease-in-out infinite .2s" }} />
        <div className="w-28 h-2 rounded bg-gray-400 dark:bg-gray-600 pulse" style={{ animation: "fadePulse 1.6s ease-in-out infinite .4s" }} />
      </div>
      <p className="text-xs font-medium tracking-wide text-gray-400 dark:text-gray-500">Loading...</p>
    </div>
  </div>
);

/**
 * Only gate on authentication check — the one truly essential blocker.
 * All other data (books, cart, wishlist, authors, affiliate) loads in the
 * background and individual pages show their own skeletons.
 */
const GlobalLoadingGate = ({ children }) => {
  const { isLoading: authLoading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authLoading && !ready) {
      // Paint one frame then reveal to avoid layout flash
      const id = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(id);
    }
  }, [authLoading, ready]);

  if (!ready) return <CentralLoader />;
  return children;
};

export default GlobalLoadingGate;
