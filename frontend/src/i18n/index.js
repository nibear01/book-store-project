import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import English translations
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enShop from './locales/en/shop.json';
import enAuth from './locales/en/auth.json';
import enCart from './locales/en/cart.json';
import enAdmin from './locales/en/admin.json';
import enAffiliate from './locales/en/affiliate.json';
import enForms from './locales/en/forms.json';
import enBookView from './locales/en/bookView.json';

// Import Bengali translations
import bnCommon from './locales/bn/common.json';
import bnHome from './locales/bn/home.json';
import bnShop from './locales/bn/shop.json';
import bnAuth from './locales/bn/auth.json';
import bnCart from './locales/bn/cart.json';
import bnAdmin from './locales/bn/admin.json';
import bnAffiliate from './locales/bn/affiliate.json';
import bnForms from './locales/bn/forms.json';
import bnBookView from './locales/bn/bookView.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        home: enHome,
        shop: enShop,
        auth: enAuth,
        cart: enCart,
        admin: enAdmin,
        affiliate: enAffiliate,
        forms: enForms,
        bookView: enBookView
      },
      bn: {
        common: bnCommon,
        home: bnHome,
        shop: bnShop,
        auth: bnAuth,
        cart: bnCart,
        admin: bnAdmin,
        affiliate: bnAffiliate,
        forms: bnForms,
        bookView: bnBookView
      }
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache user language in localStorage
      caches: ['localStorage'],
      // localStorage key
      lookupLocalStorage: 'i18nextLng'
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
