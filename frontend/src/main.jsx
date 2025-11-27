import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import GlobalLoadingGate from "./components/common/GlobalLoadingGate.jsx";
import "./i18n"; // Initialize i18n

import { AuthProvider } from "./context/AuthContext";
import { AffiliateProvider } from "./context/AffiliateContext";
import { AffiliateAdminProvider } from "./context/AffiliateAdminContext";
import { BooksContextProvider } from "./context/BooksContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import { AuthorProvider } from "./context/AuthorContext.jsx";
import { AuthorRequestProvider } from "./context/AuthorRequestContext.jsx";
import "./index.css";
const AppTree = (
  <BrowserRouter>
    <AuthProvider>
      <AffiliateProvider>
        <AffiliateAdminProvider>
          <BooksContextProvider>
            <AuthorProvider>
              <AuthorRequestProvider>
                <WishlistProvider>
                  <CartProvider>
                    <GlobalLoadingGate>
                      <App />
                    </GlobalLoadingGate>
                  </CartProvider>
                </WishlistProvider>
              </AuthorRequestProvider>
            </AuthorProvider>
          </BooksContextProvider>
        </AffiliateAdminProvider>
      </AffiliateProvider>
    </AuthProvider>
  </BrowserRouter>
);

// In development, avoid StrictMode double-invocations that can make components
// render/effect-run multiple times. Keep StrictMode for production safety.
ReactDOM.createRoot(document.getElementById("root")).render(
  import.meta.env.DEV ? AppTree : <React.StrictMode>{AppTree}</React.StrictMode>
);
