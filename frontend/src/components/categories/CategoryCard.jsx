const CategoryCard = ({ id, title, item, img, isSelected, onClick }) => (
  <div
    key={id}
    className="group cursor-pointer relative"
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyPress={(e) => e.key === "Enter" && onClick()}
  >
    <div className="relative overflow-hidden rounded-[2px] h-[200px] mb-3">
      <img
        src={img}
        alt={`${title} category`}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4">
        <h2 className="text-xl font-semibold text-white group-hover:text-gray-300 transition-colors">
          {title}
        </h2>
        <p className="text-gray-200 text-sm">{item}</p>
      </div>
    </div>
    {/* Fixed: Added relative positioning to the parent and positioned the line correctly */}
    <div className="relative">
      <div
        className={`${
          isSelected ? "w-full" : "w-0"
        } h-1.5 absolute bottom-0 left-0 group-hover:w-full transition-all duration-300 bg-black`}
      />
    </div>
  </div>
);

export default CategoryCard;
