import { useAuth } from "@/context/AuthContext";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  return (
    <div>
      <footer className="bg-black text-white pt-10">
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 md:grid-cols-5 gap-6 text-sm">
          {/* Explore */}
          <div>
            <h3 className="font-semibold mb-3">{t('common:footer.quickLinks')}</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link to="/about" className="hover:text-white">
                  {t('common:navbar.about')}
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="hover:text-white">
                  Sitemap
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white">
                  {t('common:navbar.wishlist')}
                </Link>
              </li>
              {!user && (
                <li>
                  <Link to="/login" className="hover:text-white">
                    {t('common:navbar.login')} / {t('common:navbar.signup')}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-3">{t('common:footer.customerService')}</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link to="/help-center" className="hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/product-recalls" className="hover:text-white">
                  Product Recalls
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">
                  {t('common:navbar.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h3 className="font-semibold mb-3">Policy</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link to="/terms" className="hover:text-white">
                  {t('common:footer.termsConditions')}
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-white">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white">
                  {t('common:footer.privacyPolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-3">{t('common:navbar.categories')}</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link to="/categories" className="hover:text-white">
                  Action
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white">
                  Comedy
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white">
                  Drama
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white">
                  Horror
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white">
                  Comedy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold mb-3">{t('common:footer.followUs')}</h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 transition-colors text-xl"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors text-xl"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t text-[14px] border-gray-700 mt-8 pt-4 text-center pb-5 text-gray-400">
          {t('common:footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </footer>
    </div>
  );
};

export default Footer;
