import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const PrintOnDemandSettings = () => {
  const [printCfg, setPrintCfg] = useState({
    basePerPage: 0.05,
    contentFee: 0,
    multipliers: {
      quality: { economy: 1.0, standard: 1.15, premium: 1.3 },
      side: { single: 1.0, double: 0.92 },
      size: { A5: 0.85, A4: 1.0, A3: 1.25 },
      color: { bw: 1.0, color: 1.4 },
    },
    margin: { type: "percent", value: 10 },
    mode: "derived",
  });

  const [savingPrintCfg, setSavingPrintCfg] = useState(false);

  // Load global print pricing config
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings/print-config");
        const data = await res.json();
        if (data.success && data.data) {
          setPrintCfg(data.data);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingPrintCfg(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/settings/print-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify(printCfg),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.message || "Failed to save";
        toast.error(`Error: ${errorMsg}`, { autoClose: 5000 });
        console.error("Print config update error:", {
          status: res.status,
          statusText: res.statusText,
          message: data.message,
          error: data.error,
          fullResponse: data
        });
        return;
      }
      toast.success("Print pricing configuration saved!");
    } catch (e) {
      toast.error(`Failed to save: ${e.message}`, { autoClose: 5000 });
      console.error("Print config exception:", e);
    } finally {
      setSavingPrintCfg(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex-col sm:items-center sm:justify-between gap-3 mb-2 sm:mb-3">
        <h1 className="text-xl sm:text-xl font-bold">Print-on-Demand Pricing</h1>
        <p className="text-gray-600 text-sm">
          Configure content fee, printing cost per page, option multipliers, and
          platform margin
        </p>
      </div>

      <section className="bg-white rounded-md border p-3 sm:p-4 md:p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Pricing Mode</label>
              <select
                value={printCfg.mode}
                onChange={(e) =>
                  setPrintCfg((p) => ({ ...p, mode: e.target.value }))
                }
                className="border border-gray-300 rounded-md p-2 w-full"
              >
                <option value="derived">
                  Derived (content + print + margin)
                </option>
                <option value="relative">Relative to admin book price</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Content Fee</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={printCfg.contentFee}
                onChange={(e) =>
                  setPrintCfg((p) => ({
                    ...p,
                    contentFee: Number(e.target.value),
                  }))
                }
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Base Cost Per Page</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={printCfg.basePerPage}
                onChange={(e) =>
                  setPrintCfg((p) => ({
                    ...p,
                    basePerPage: Number(e.target.value),
                  }))
                }
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Margin Type</label>
              <select
                value={printCfg.margin.type}
                onChange={(e) =>
                  setPrintCfg((p) => ({
                    ...p,
                    margin: { ...p.margin, type: e.target.value },
                  }))
                }
                className="border border-gray-300 rounded-md p-2 w-full"
              >
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Margin Value</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={printCfg.margin.value}
                onChange={(e) =>
                  setPrintCfg((p) => ({
                    ...p,
                    margin: { ...p.margin, value: Number(e.target.value) },
                  }))
                }
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring focus:ring-gray-400"
                required
              />
            </div>
          </div>

          {/* Multipliers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Paper Quality Multipliers</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(printCfg.multipliers.quality).map(([k, v]) => (
                  <label key={k} className="text-sm">
                    <span className="block mb-1 capitalize">{k}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={v}
                      onChange={(e) =>
                        setPrintCfg((p) => ({
                          ...p,
                          multipliers: {
                            ...p.multipliers,
                            quality: {
                              ...p.multipliers.quality,
                              [k]: Number(e.target.value),
                            },
                          },
                        }))
                      }
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Print Side Multipliers</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(printCfg.multipliers.side).map(([k, v]) => (
                  <label key={k} className="text-sm">
                    <span className="block mb-1 capitalize">{k}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={v}
                      onChange={(e) =>
                        setPrintCfg((p) => ({
                          ...p,
                          multipliers: {
                            ...p.multipliers,
                            side: {
                              ...p.multipliers.side,
                              [k]: Number(e.target.value),
                            },
                          },
                        }))
                      }
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Paper Size Multipliers</h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(printCfg.multipliers.size).map(([k, v]) => (
                  <label key={k} className="text-sm">
                    <span className="block mb-1">{k}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={v}
                      onChange={(e) =>
                        setPrintCfg((p) => ({
                          ...p,
                          multipliers: {
                            ...p.multipliers,
                            size: {
                              ...p.multipliers.size,
                              [k]: Number(e.target.value),
                            },
                          },
                        }))
                      }
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Color Mode Multipliers</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(printCfg.multipliers.color).map(([k, v]) => (
                  <label key={k} className="text-sm">
                    <span className="block mb-1 uppercase">{k}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={v}
                      onChange={(e) =>
                        setPrintCfg((p) => ({
                          ...p,
                          multipliers: {
                            ...p.multipliers,
                            color: {
                              ...p.multipliers.color,
                              [k]: Number(e.target.value),
                            },
                          },
                        }))
                      }
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="submit"
              className="cursor-pointer bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-gray-800 transition w-full sm:w-auto text-center"
              disabled={savingPrintCfg}
            >
              {savingPrintCfg ? "Saving..." : "Save Print Pricing"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default PrintOnDemandSettings;
