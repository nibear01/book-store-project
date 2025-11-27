import { memo } from "react";
import CategorySlider from "./CategorySlider";

const Category = () => {
  return (
    <div>
      <CategorySlider />
    </div>
  );
};

export default memo(Category);
