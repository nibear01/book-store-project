import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import XIcon from "@mui/icons-material/X";

export default function ContactUs() {
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/contact`,
        formData
      );
      toast.success(res.data.message);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Map Section */}
      <div className="w-full h-96">
        <iframe
          title="Google Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.902393075262!2d90.392500!3d23.751000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755bf54a6a1a34b%3A0x6b8f9a29d3cbe4f0!2s123%20Main%20Street%2C%20Gulshan%2C%20Dhaka%2C%20Bangladesh!5e0!3m2!1sen!2sbd!4v1699999999999!5m2!1sen!2sbd"
          className="w-full h-full border-0"
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>

      {/* Contact Information */}
      <section className="py-12 px-4 md:px-16 lg:px-28">
        <h2 className="text-3xl font-semibold text-center mb-6">{t('common:navbar.contact')}</h2>
        <p className="text-center italic text-gray-600 max-w-2xl mx-auto mb-12">
          We will answer any questions you may have about our online sales,
          rights, or partnership service right here.
        </p>

        <div className="text-center">
          <h3 className="font-semibold text-lg">Bangladesh Office</h3>
          <p className="italic">
            123 Main Street, Gulshan, Dhaka
            <br />
            Bangladesh
          </p>
          <p className="italic mt-2 text-gray-700">
            contact@bookworm.com
            <br />
            +880 1234-567890
          </p>
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
        <form className="max-w-3xl mx-auto space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name *"
              value={formData.name}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-[2px] p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
            />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-[2px] p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
            />
          </div>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            className="border border-gray-300 rounded-[2px] p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
          />
          <textarea
            name="message"
            placeholder="Details please! Your review helps other shoppers."
            rows="5"
            value={formData.message}
            onChange={handleChange}
            className="border border-gray-300 rounded-[2px] p-3 w-full focus:outline-none focus:ring focus:ring-gray-400"
          ></textarea>
          <button
            type="submit"
            disabled={loading}
            className={`cursor-pointer bg-black text-white px-6 py-3 rounded-[2px] hover:bg-gray-800 transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Submit Message"}
          </button>
        </form>
      </section>
    </div>
  );
}
