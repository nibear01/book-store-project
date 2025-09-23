import CategorySections from "@/components/CategorySections";
import Feature from "@/components/Feature";
import Hero from "@/components/Hero";
import Deals from "@/components/Deals";
import Book from "@/components/Book";

const homepage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <div className="mx-4 md:mx-8 lg:mx-20">
        <CategorySections />
        <Feature />
        <Deals />
        <Book />
      </div>
    </div>
  );
};

export default homepage;
