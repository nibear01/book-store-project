import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const DeliveryCostSettings = () => {
  const [deliveryCost, setDeliveryCost] = useState({
    insideDhaka: 0,
    outsideDhaka: 0,
  });

  const [savingDeliveryCost, setSavingDeliveryCost] = useState(false);

  // Load delivery costs
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings/delivery-cost");
        const data = await res.json();
        if (data.success && data.data) {
          setDeliveryCost({
            insideDhaka: Number(data.data.insideDhaka) || 0,
            outsideDhaka: Number(data.data.outsideDhaka) || 0,
          });
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingDeliveryCost(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/settings/delivery-cost", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(deliveryCost),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.message || "Failed to save";
        toast.error(`Error: ${errorMsg}`, { autoClose: 5000 });
        console.error("Delivery cost update error:", {
          status: res.status,
          statusText: res.statusText,
          message: data.message,
          error: data.error,
          fullResponse: data
        });
        return;
      }
      toast.success("Delivery costs saved successfully!");
    } catch (e) {
      toast.error(`Failed to save: ${e.message}`, { autoClose: 5000 });
      console.error("Delivery cost exception:", e);
    } finally {
      setSavingDeliveryCost(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex-col sm:items-center sm:justify-between gap-3 mb-2 sm:mb-3">
        <h1 className="text-xl sm:text-xl font-bold">Delivery Cost Settings</h1>
        <p className="text-gray-600 text-sm">
          Configure delivery charges for inside and outside Dhaka
        </p>
      </div>

      <section className="bg-white rounded-md border p-3 sm:p-4 md:p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 font-medium">
                Inside Dhaka (৳)
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={deliveryCost.insideDhaka}
                onChange={(e) =>
                  setDeliveryCost((p) => ({
                    ...p,
                    insideDhaka: Number(e.target.value),
                  }))
                }
                className="border border-gray-300 rounded-md p-2 sm:p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Delivery cost for addresses inside Dhaka city
              </p>
            </div>
            <div>
              <label className="block text-sm mb-1 font-medium">
                Outside Dhaka (৳)
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={deliveryCost.outsideDhaka}
                onChange={(e) =>
                  setDeliveryCost((p) => ({
                    ...p,
                    outsideDhaka: Number(e.target.value),
                  }))
                }
                className="border border-gray-300 rounded-md p-2 sm:p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Delivery cost for addresses outside Dhaka city
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="submit"
              className="cursor-pointer bg-black text-white px-2 sm:px-6 py-2 sm:py-2.5 rounded-md hover:bg-gray-800 transition w-full sm:w-auto text-center"
              disabled={savingDeliveryCost}
            >
              {savingDeliveryCost ? "Saving..." : "Save Delivery Costs"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default DeliveryCostSettings;
