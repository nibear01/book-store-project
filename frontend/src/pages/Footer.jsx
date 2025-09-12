import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-10">
      <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 md:grid-cols-5 gap-6 text-sm">
        {/* Explore */}
        <div>
          <h3 className="font-semibold mb-3">Explore</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="hover:text-white cursor-pointer">About Us</li>
            <li className="hover:text-white cursor-pointer">Sitemap</li>
            <li className="hover:text-white cursor-pointer">Bookmarks</li>
            <li className="hover:text-white cursor-pointer">Sign In / Join</li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="font-semibold mb-3">Customer Service</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="hover:text-white cursor-pointer">Help Center</li>
            <li className="hover:text-white cursor-pointer">Returns</li>
            <li className="hover:text-white cursor-pointer">Product Recalls</li>
            <li className="hover:text-white cursor-pointer">Accessibility</li>
            <li className="hover:text-white cursor-pointer">Contact Us</li>
            <li className="hover:text-white cursor-pointer">Store Pickup</li>
          </ul>
        </div>

        {/* Policy */}
        <div>
          <h3 className="font-semibold mb-3">Policy</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="hover:text-white cursor-pointer">Return Policy</li>
            <li className="hover:text-white cursor-pointer">Terms Of Use</li>
            <li className="hover:text-white cursor-pointer">Security</li>
            <li className="hover:text-white cursor-pointer">Privacy</li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-semibold mb-3">Categories</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="hover:text-white cursor-pointer">Action</li>
            <li className="hover:text-white cursor-pointer">Comedy</li>
            <li className="hover:text-white cursor-pointer">Drama</li>
            <li className="hover:text-white cursor-pointer">Horror</li>
            <li className="hover:text-white cursor-pointer">Kids</li>
            <li className="hover:text-white cursor-pointer">Romantic Comedy</li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="font-semibold mb-3">Follow Us</h3>
          <div className="flex gap-4">
            <Link
              to="/"
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition-colors text-xl"
            >
              <FaFacebookF />
            </Link>
            <Link
              to="/"
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors text-xl"
            >
              <FaTwitter />
            </Link>
            <Link
              to="/"
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-400 transition-colors text-xl"
            >
              <FaInstagram />
            </Link>
            <Link
              to="/"
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors text-xl"
            >
              <FaLinkedinIn />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center pb-5 text-gray-400 text-[12px]">
        © {new Date().getFullYear()} BookStop. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
