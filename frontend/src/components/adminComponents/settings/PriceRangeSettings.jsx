import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const PriceRangeSettings = () => {
  const [priceRangeSetting, setPriceRangeSetting] = useState({
    min: 0,
    max: 1500,
  });

  const [savingPriceRange, setSavingPriceRange] = useState(false);

  // Load current price range from backend
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings/price-range");
        const data = await res.json();
        if (data.success && data.data) {
          setPriceRangeSetting({
            min: Number(data.data.min) || 0,
            max: Number(data.data.max) || 1500,
          });
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingPriceRange(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/settings/price-range", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(priceRangeSetting),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.message || "Failed to save";
        toast.error(`Error: ${errorMsg}`, { autoClose: 5000 });
        console.error("Price range update error:", {
          status: res.status,
          statusText: res.statusText,
          message: data.message,
          error: data.error,
          fullResponse: data
        });
        return;
      }
      toast.success("Price range saved successfully!");
    } catch (e) {
      toast.error(`Failed to save: ${e.message}`, { autoClose: 5000 });
      console.error("Price range exception:", e);
    } finally {
      setSavingPriceRange(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex-col sm:items-center sm:justify-between gap-3 mb-2 sm:mb-3">
        <h1 className="text-xl sm:text-xl font-bold">Global Price Range</h1>
        <p className="text-gray-600 text-sm">
          This controls the min/max limits users can select on the categories
          page price filter
        </p>
      </div>

      <section className="bg-white rounded-md border p-3 sm:p-4 md:p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="price-min">
                Minimum Price (BDT)
              </label>
              <input
                id="price-min"
                type="number"
                min={0}
                value={priceRangeSetting.min}
                onChange={(e) =>
                  setPriceRangeSetting((p) => ({
                    ...p,
                    min: Number(e.target.value),
                  }))
                }
                className="border border-gray-300 rounded-[2px] p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="price-max">
                Maximum Price (BDT)
              </label>
              <input
                id="price-max"
                type="number"
                min={priceRangeSetting.min}
                value={priceRangeSetting.max}
                onChange={(e) =>
                  setPriceRangeSetting((p) => ({
                    ...p,
                    max: Number(e.target.value),
                  }))
                }
                className="border border-gray-300 rounded-[2px] p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
                required
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="submit"
              className="cursor-pointer bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-[2px] hover:bg-gray-800 transition w-full sm:w-auto text-center"
              disabled={savingPriceRange}
            >
              {savingPriceRange ? "Saving..." : "Save Price Range"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default PriceRangeSettings;
