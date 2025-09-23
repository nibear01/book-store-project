import { LayoutGrid, List } from "lucide-react";

const ViewToggle = ({ currentView, onViewChange }) => {
  const handleToggle = () => {
    const newView = currentView === "grid" ? "list" : "grid";
    if (onViewChange) onViewChange(newView);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-md border hover:bg-gray-100 transition-colors"
      aria-label={`Switch to ${currentView === "grid" ? "list" : "grid"} view`}
    >
      {currentView === "grid" ? (
        <LayoutGrid className="w-5 h-5" />
      ) : (
        <List className="w-5 h-5" />
      )}
    </button>
  );
};

export default ViewToggle;
