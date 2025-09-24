export default function Support() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Customer Support</h2>
        <p className="text-gray-600 text-sm">
          Manage tickets, priorities, and response SLAs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Open Tickets</p>
          <p className="text-2xl font-semibold">14</p>
        </div>
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">In Progress</p>
          <p className="text-2xl font-semibold">6</p>
        </div>
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Resolved Today</p>
          <p className="text-2xl font-semibold">21</p>
        </div>
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Avg. Response</p>
          <p className="text-2xl font-semibold">12m</p>
        </div>
      </div>

      <div className="p-3 border rounded bg-white flex flex-col md:flex-row gap-2 md:items-center">
        <select className="border p-2 rounded">
          <option>All Status</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>
        <select className="border p-2 rounded">
          <option>Priority</option>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <input
          className="border p-2 rounded flex-1"
          placeholder="Search ticket or customer"
        />
        <button className="px-3 py-2 bg-black text-white rounded">
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto border rounded bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Ticket</th>
              <th className="p-2 text-left">Customer</th>
              <th className="p-2 text-left">Priority</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-t">
                <td className="p-2">TCK-20{i}</td>
                <td className="p-2">customer{i}@mail.com</td>
                <td className="p-2">High</td>
                <td className="p-2">Open</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 border rounded">Assign</button>
                    <button className="px-2 py-1 border rounded">
                      Resolve
                    </button>
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
