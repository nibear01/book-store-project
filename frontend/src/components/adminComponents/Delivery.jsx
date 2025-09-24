export default function Delivery() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Delivery Management</h2>
        <p className="text-gray-600 text-sm">
          Track shipments, couriers, and delivery SLAs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Out for Delivery</p>
          <p className="text-2xl font-semibold">22</p>
        </div>
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Delivered Today</p>
          <p className="text-2xl font-semibold">37</p>
        </div>
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Delayed</p>
          <p className="text-2xl font-semibold">4</p>
        </div>
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Couriers Active</p>
          <p className="text-2xl font-semibold">7</p>
        </div>
      </div>

      <div className="p-3 border rounded bg-white flex flex-col md:flex-row gap-2 md:items-center">
        <select className="border p-2 rounded">
          <option>All Status</option>
          <option>In Transit</option>
          <option>Out for Delivery</option>
          <option>Delivered</option>
          <option>Delayed</option>
        </select>
        <select className="border p-2 rounded">
          <option>All Couriers</option>
          <option>Courier A</option>
          <option>Courier B</option>
        </select>
        <input
          className="border p-2 rounded flex-1"
          placeholder="Search order or tracking"
        />
        <button className="px-3 py-2 bg-black text-white rounded">
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto border rounded bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Tracking</th>
              <th className="p-2 text-left">Order</th>
              <th className="p-2 text-left">Courier</th>
              <th className="p-2 text-left">ETA</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-t">
                <td className="p-2">TRK-900{i}</td>
                <td className="p-2">ORD-10{i}</td>
                <td className="p-2">Courier A</td>
                <td className="p-2">Tomorrow</td>
                <td className="p-2">In Transit</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 border rounded">
                      Mark Delivered
                    </button>
                    <button className="px-2 py-1 border rounded">Delay</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
