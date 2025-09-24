export default function Printing() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Printing Management</h2>
        <p className="text-gray-600 text-sm">
          Manage print queues, job priorities, and press status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Queued Jobs</p>
          <p className="text-2xl font-semibold">12</p>
        </div>
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">In Progress</p>
          <p className="text-2xl font-semibold">5</p>
        </div>
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Completed Today</p>
          <p className="text-2xl font-semibold">18</p>
        </div>
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Press Online</p>
          <p className="text-2xl font-semibold">3/4</p>
        </div>
      </div>

      <div className="p-3 border rounded bg-white flex flex-col md:flex-row gap-2 md:items-center">
        <select className="border p-2 rounded">
          <option>All Status</option>
          <option>Queued</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <select className="border p-2 rounded">
          <option>All Press</option>
          <option>Press A</option>
          <option>Press B</option>
        </select>
        <input
          className="border p-2 rounded flex-1"
          placeholder="Search job ID or title"
        />
        <button className="px-3 py-2 bg-black text-white rounded">
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto border rounded bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Job ID</th>
              <th className="p-2 text-left">Book</th>
              <th className="p-2 text-left">Press</th>
              <th className="p-2 text-left">Priority</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-t">
                <td className="p-2">PJ-100{i}</td>
                <td className="p-2">Sample Book Title {i}</td>
                <td className="p-2">Press A</td>
                <td className="p-2">High</td>
                <td className="p-2">Queued</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 border rounded">Start</button>
                    <button className="px-2 py-1 border rounded">Cancel</button>
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
