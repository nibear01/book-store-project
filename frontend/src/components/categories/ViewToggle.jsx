import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";

const ViewToggle = ({ onToggle }) => {
  const [view, setView] = useState("grid");

  const handleToggle = () => {
    const newView = view === "grid" ? "list" : "grid";
    setView(newView);
    if (onToggle) onToggle(newView);
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg border hover:bg-gray-100 transition"
    >
      {view === "grid" ? (
        <LayoutGrid className="w-5 h-5" />
      ) : (
        <List className="w-5 h-5" />
      )}
    </button>
  );
};

export default ViewToggle;
