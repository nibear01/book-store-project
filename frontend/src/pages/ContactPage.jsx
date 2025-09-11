import React from "react";
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import XIcon from '@mui/icons-material/X';

export default function ContactUs() {
  return (
    <div className="w-full">
      {/* Map Section */}
      <div className="w-full h-96">
        <iframe
          title="Google Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509406!2d144.95373531531696!3d-37.817209979751554!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf5778e37d3e10d6f!2sEnvato%20Pty%20Ltd!5e0!3m2!1sen!2sau!4v1600000000000!5m2!1sen!2sau"
          className="w-full h-full border-0"
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>

      {/* Contact Information */}
      <section className="py-12 px-4 md:px-16 lg:px-28">
        <h2 className="text-3xl font-semibold text-center mb-6">Contact Us</h2>
        <p className="text-center italic text-gray-600 max-w-2xl mx-auto mb-12">
          We will answer any questions you may have about our online sales, rights or partnership service right here.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 text-center md:text-left md:items-start">
          <div className="md:text-right">
            <h3 className="font-semibold text-lg">New York Office</h3>
            <p className="italic ">1418 River Drive, Suite 35 Cottonhall, CA 9622<br />United States</p>
            <p className="italic mt-2 text-gray-700">sale@bookworm.com<br />+1 246-345-0695</p>
          </div>

          <div className="md:text-left">
            <h3 className="font-semibold text-lg">London Office</h3>
            <p className="italic">1418 River Drive, Suite 35 Cottonhall, CA 9622<br />United States</p>
            <p className="italic mt-2 text-gray-700">sale@bookworm.com<br />+1 246-345-0695</p>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-14">
          <h3 className="text-center text-lg font-medium mb-4">Social Media</h3>
          <div className="flex justify-center gap-8 text-xl">
            <a href="#" className="hover:text-gray-600"><FacebookIcon /></a>
            <a href="#" className="hover:text-gray-600"><InstagramIcon /></a>
            <a href="#" className="hover:text-gray-600"><YouTubeIcon /></a>
            <a href="#" className="hover:text-gray-600"><XIcon /></a>
          </div>
        </div>
      </section>

      {/* Get In Touch Form */}
      <section className="py-12 px-4 md:px-16 lg:px-28">
        <h2 className="text-3xl font-semibold text-center mb-6">Get In Touch</h2>
        <form className="max-w-3xl mx-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name *"
              required
              className="border border-gray-300 rounded-sm p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
            />
            <input
              type="email"
              placeholder="Email *"
              required
              className="border border-gray-300 rounded-sm p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
            />
          </div>
          <input
            type="text"
            placeholder="Subject"
            className="border border-gray-300 rounded-sm p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
          />
          <textarea
            placeholder="Details please! Your review helps other shoppers."
            rows="5"
            className="border border-gray-300 rounded-sm p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
          ></textarea>
          <button
            type="submit"
            className="cursor-pointer bg-black text-white px-6 py-3 rounded-xs hover:bg-gray-800 transition"
          >
            Submit Message
          </button>
        </form>
      </section>
    </div>
  );
}
