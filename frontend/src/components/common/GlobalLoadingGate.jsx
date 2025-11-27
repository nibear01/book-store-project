import { useEffect, useState, useContext } from "react";

import { useAuth } from "@/context/AuthContext";
import { useAffiliate } from "@/context/AffiliateContext";
import { BooksContext } from "@/context/BooksContext";
import { useAuthors } from "@/context/AuthorContext";
import { useAuthorRequests } from "@/context/AuthorRequestContext";

const CentralLoader = () => {
  return (
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
        <div className="flex items-center gap-1 text-3xl font-extrabold tracking-tight">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Bookstore Logo"
              className="w-32 sm:w-36 md:w-40 lg:w-48 h-auto"
            />
          </div>
        </div>

        {/* Ultra-minimal 3-line "books" */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-20 h-2 rounded bg-red-500/70 pulse"
            style={{ animation: "fadePulse 1.6s ease-in-out infinite" }}
          />
          <div
            className="w-24 h-2 rounded bg-gray-300 dark:bg-gray-700 pulse"
            style={{ animation: "fadePulse 1.6s ease-in-out infinite .2s" }}
          />
          <div
            className="w-28 h-2 rounded bg-gray-400 dark:bg-gray-600 pulse"
            style={{ animation: "fadePulse 1.6s ease-in-out infinite .4s" }}
          />
        </div>

        {/* Simplest possible loading text */}
        <p className="text-xs font-medium tracking-wide text-gray-400 dark:text-gray-500">
          Loading your bookstore...
        </p>
      </div>
    </div>
  );
};

const GlobalLoadingGate = ({ children }) => {
  const { isLoading: authLoading } = useAuth();
  const { isLoading: affiliateLoading } = useAffiliate();
  const booksCtx = useContext(BooksContext);
  const { loading: authorsLoading } = useAuthors();
  const { loading: authorReqLoading } = useAuthorRequests();

  const [initialReady, setInitialReady] = useState(false);

  const anyLoading = Boolean(
    authLoading ||
      affiliateLoading ||
      booksCtx?.loading ||
      authorsLoading ||
      authorReqLoading
  );

  useEffect(() => {
    if (!anyLoading && !initialReady) {
      const t = setTimeout(() => setInitialReady(true), 16);
      return () => clearTimeout(t);
    }
  }, [anyLoading, initialReady]);

  if (!initialReady) return <CentralLoader />;

  return children;
};

export default GlobalLoadingGate;
