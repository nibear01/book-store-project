import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ className = "" }) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'bn' : 'en';
    i18n.changeLanguage(newLang);
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = newLang;
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${className}`}
      aria-label="Toggle Language"
      title={i18n.language === 'en' ? 'Switch to Bengali' : 'ইংরেজিতে পরিবর্তন করুন'}
    >
      <Globe className="w-5 h-5" />
      <span className="text-sm font-medium">
        {i18n.language === 'en' ? 'বাংলা' : 'English'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
