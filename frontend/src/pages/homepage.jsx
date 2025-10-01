import Category from "@/components/homeComponents/category";
import Feature from "@/components/homeComponents/Feature";
import Hero from "@/components/homeComponents/Hero";
import Deals from "@/components/homeComponents/Deals";
import Join from "@/components/homeComponents/Join";
import NewReleases from "@/components/homeComponents/NewReleases";

const homepage = () => {
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
      <Hero />
      <Category />
      <Feature />
      <Deals />
      <NewReleases />
      <Join />
    </div>
  );
};

export default homepage;
