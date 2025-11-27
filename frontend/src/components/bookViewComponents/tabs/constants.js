export const TABS = [
  { id: "description", labelKey: "bookView.tabs.description" },
  { id: "details", labelKey: "bookView.tabs.details" },
  { id: "reviews", labelKey: "bookView.tabs.reviews" },
  { id: "author", labelKey: "bookView.tabs.author" },
];

export const srOnly = "sr-only";

export const formatDate = (d) => {
  try {
    return d ? new Date(d).toLocaleDateString() : "N/A";
  } catch {
    return "N/A";
  }
};
