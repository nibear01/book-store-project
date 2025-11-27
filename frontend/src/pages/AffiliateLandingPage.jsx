import { Link } from "react-router-dom";
import { useAffiliate } from "../context/AffiliateContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Icons
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import GroupIcon from "@mui/icons-material/Group";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const AffiliateLandingPage = () => {
  const { isAffiliateAuthenticated } = useAffiliate();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAffiliateAuthenticated) {
      navigate("/affiliate/dashboard");
    }
  }, [isAffiliateAuthenticated, navigate]);

  const features = [
    {
      icon: <MonetizationOnIcon className="text-5xl text-blue-600" />,
      title: "Earn 10% Commission",
      description: "Get 10% commission on every sale made through your unique promo code",
    },
    {
      icon: <LocalOfferIcon className="text-5xl text-green-600" />,
      title: "Unique Promo Code",
      description: "Receive your personalized promo code that customers can use for discounts",
    },
    {
      icon: <AssessmentIcon className="text-5xl text-purple-600" />,
      title: "Real-time Analytics",
      description: "Track your earnings, referrals, and performance with our intuitive dashboard",
    },
    {
      icon: <GroupIcon className="text-5xl text-orange-600" />,
      title: "Customer Discount",
      description: "Your customers get 5% discount, making it a win-win for everyone",
    },
    {
      icon: <TrendingUpIcon className="text-5xl text-red-600" />,
      title: "Unlimited Potential",
      description: "No cap on earnings - the more you promote, the more you earn",
    },
    {
      icon: <SupportAgentIcon className="text-5xl text-teal-600" />,
      title: "Dedicated Support",
      description: "Our team is here to help you succeed with marketing materials and support",
    },
  ];

  const benefits = [
    "💰 Competitive commission rates",
    "📊 Transparent reporting and tracking",
    "💳 Multiple withdrawal methods",
    "🎯 Marketing materials provided",
    "📈 Performance-based bonuses",
    "🤝 Dedicated affiliate manager",
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Sign Up",
      description: "Register as an affiliate marketer with your details",
    },
    {
      step: "2",
      title: "Get Approved",
      description: "Wait for admin approval (usually within 24-48 hours)",
    },
    {
      step: "3",
      title: "Receive Promo Code",
      description: "Get your unique promo code to share with customers",
    },
    {
      step: "4",
      title: "Promote & Earn",
      description: "Share your code and earn commissions on every sale",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Join Our Affiliate Program
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Earn money by promoting our bookstore. Get 10% commission on every sale!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/affiliate/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Register Now
            </Link>
            <Link
              to="/affiliate/login"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Login
            </Link>
          </div>
          <p className="mt-6 text-blue-100">
            Already have an account?{" "}
            <Link to="/affiliate/login" className="underline font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Why Join Our Affiliate Program?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            How It Works
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Additional Benefits
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-600"
            >
              <p className="text-lg text-gray-700">{benefit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Our Success in Numbers
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold mb-2">10%</p>
              <p className="text-xl text-blue-100">Commission Rate</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">5%</p>
              <p className="text-xl text-blue-100">Customer Discount</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">24/7</p>
              <p className="text-xl text-blue-100">Support Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-4xl font-bold mb-6 text-gray-800">
          Ready to Start Earning?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join hundreds of affiliate marketers earning passive income by promoting quality books
        </p>
        <Link
          to="/affiliate/register"
          className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
        >
          Get Started Today
        </Link>
      </div>

      {/* FAQ Preview */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                How much can I earn?
              </h3>
              <p className="text-gray-600">
                You earn 10% commission on every sale. There's no limit - the more you promote, the more you earn!
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                When do I get paid?
              </h3>
              <p className="text-gray-600">
                You can request withdrawals anytime. Payments are processed within 3-5 business days after approval.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                How do I promote my promo code?
              </h3>
              <p className="text-gray-600">
                Share your unique promo code on social media, your blog, email, or any platform you choose. We provide marketing materials to help!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateLandingPage;
