import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import XIcon from "@mui/icons-material/X";

export default function ContactUs() {
  const { t } = useTranslation("common");
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

    // Validate required fields
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.message?.trim()) {
      toast.error("Please fill in all required fields!");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/api/contact`,
        formData
      );
      
      // Show success message
      const msg = res.data?.message || "Your message has been sent successfully!";
      toast.success(msg);

      // If Ethereal preview URL exists, surface it in console and optional toast
      if (res.data?.previewUrl) {
        console.log("Ethereal preview:", res.data.previewUrl);
        toast.info("Dev preview URL generated. Check console.");
      }
      
      // Reset form
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to send message. Please try again.";
      toast.error(errorMessage);
      console.error("Contact form error:", err);
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
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3649.805012369653!2d90.37073937479424!3d23.825531785888863!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c188b7204ee9%3A0x68239ece58591201!2simranslab!5e0!3m2!1sen!2sbd!4v1764433159414!5m2!1sen!2sbd"
          className="w-full h-full border-0"
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>

      {/* Contact Information */}
      <section className="py-12 px-4 md:px-16 lg:px-28">
        <h2 className="text-3xl font-semibold text-center mb-6">
          {t("common:navbar.contact")}
        </h2>
        <p className="text-center italic text-gray-600 max-w-2xl mx-auto mb-12">
          We will answer any questions you may have about our online sales,
          rights, or partnership service right here.
        </p>

        <div className="text-center">
          <h3 className="font-semibold text-lg">Bangladesh Office</h3>
          <p className="italic">
            House:41, Road:14, Block:D, Saction:12, Dhaka 1216
            <br />
            Bangladesh
          </p>
          <p className="italic mt-2 text-gray-700">
            demobookstore06@gmail.com
            <br />
            +880 1234-567890
          </p>
        </div>

        {/* Social Media */}
        <div className="mt-14">
          <h3 className="text-center text-lg font-medium mb-4">Social Media</h3>
          <div className="flex justify-center gap-8 text-xl">
            <a href="#" className="hover:text-gray-600">
              <FacebookIcon />
            </a>
            <a href="#" className="hover:text-gray-600">
              <InstagramIcon />
            </a>
            <a href="#" className="hover:text-gray-600">
              <XIcon />
            </a>
          </div>
        </div>
      </section>

      {/* Get In Touch Form */}
      <section className="py-12 px-4 md:px-16 lg:px-28">
        <h2 className="text-3xl font-semibold text-center mb-6">
          Get In Touch
        </h2>
        <form className="max-w-3xl mx-auto space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name *"
              value={formData.name}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
            />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
            />
          </div>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
          />
          <textarea
            name="message"
            placeholder="Details please! Your review helps other shoppers."
            rows="5"
            value={formData.message}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
          ></textarea>
          <button
            type="submit"
            disabled={loading}
            className={`cursor-pointer bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition ${
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
