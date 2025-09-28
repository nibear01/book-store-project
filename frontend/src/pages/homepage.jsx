import Category from "@/components/homeComponents/category";
import Feature from "@/components/homeComponents/Feature";
import Hero from "@/components/homeComponents/Hero";
import Deals from "@/components/homeComponents/Deals";
import Book from "@/components/homeComponents/Book";
import Join from "@/components/homeComponents/Join";

const homepage = () => {
  return (
    <div className="min-h-screen bg-gray-50 mx-20 ">
      <Hero />
      <Category />
      <Feature />
      <Deals />
      <Book />
      <Join />
    </div>
  );
};

export default homepage;
