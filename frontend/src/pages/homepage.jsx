import Category from "@/components/category";
import Feature from "@/components/Feature";
import Hero from "@/components/Hero";
import Deals from "@/components/Deals";
import Book from "@/components/Book";
const homepage = () => {
  return (
    <div className="min-h-screen bg-gray-50 mx-20 ">
      <Hero />
      <Category />
      <Feature />
      <Deals />
      <Book />
    </div>
  );
};

export default homepage;
