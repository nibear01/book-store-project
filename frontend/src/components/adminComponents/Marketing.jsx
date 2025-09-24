export default function Marketing() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Marketing Management</h2>
        <p className="text-gray-600 text-sm">
          Campaigns, promotions, and conversions overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Active Campaigns</p>
          <p className="text-2xl font-semibold">3</p>
        </div>
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">CTR</p>
          <p className="text-2xl font-semibold">4.2%</p>
        </div>
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Spend (Today)</p>
          <p className="text-2xl font-semibold">$220</p>
        </div>
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Conversions</p>
          <p className="text-2xl font-semibold">58</p>
        </div>
      </div>

      <div className="p-3 border rounded bg-white flex flex-col md:flex-row gap-2 md:items-center">
        <select className="border p-2 rounded">
          <option>All Channels</option>
          <option>Email</option>
          <option>Social</option>
          <option>Paid</option>
        </select>
        <select className="border p-2 rounded">
          <option>Status</option>
          <option>Active</option>
          <option>Paused</option>
          <option>Completed</option>
        </select>
        <input
          className="border p-2 rounded flex-1"
          placeholder="Search campaign"
        />
        <button className="px-3 py-2 bg-black text-white rounded">
          New Campaign
        </button>
      </div>

      <div className="overflow-x-auto border rounded bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Campaign</th>
              <th className="p-2 text-left">Channel</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Spend</th>
              <th className="p-2 text-left">CTR</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-t">
                <td className="p-2">Autumn Sale {i}</td>
                <td className="p-2">Email</td>
                <td className="p-2">Active</td>
                <td className="p-2">$10{i}</td>
                <td className="p-2">3.{i}%</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 border rounded">Pause</button>
                    <button className="px-2 py-1 border rounded">Edit</button>
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
