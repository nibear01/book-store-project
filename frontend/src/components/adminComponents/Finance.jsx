export default function Finance() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Finance Management</h2>
        <p className="text-gray-600 text-sm">
          Revenue, expenses, settlements, and payouts overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Revenue (Today)</p>
          <p className="text-2xl font-semibold">$1,240</p>
        </div>
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Expenses (Today)</p>
          <p className="text-2xl font-semibold">$420</p>
        </div>
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Pending Payouts</p>
          <p className="text-2xl font-semibold">$3,180</p>
        </div>
        <div className="p-3 border rounded bg-white">
          <p className="text-xs text-gray-500">Refunds</p>
          <p className="text-2xl font-semibold">$90</p>
        </div>
      </div>

      <div className="p-3 border rounded bg-white flex flex-col md:flex-row gap-2 md:items-center">
        <select className="border p-2 rounded">
          <option>Period</option>
          <option>Today</option>
          <option>7 Days</option>
          <option>30 Days</option>
        </select>
        <select className="border p-2 rounded">
          <option>Type</option>
          <option>Revenue</option>
          <option>Expense</option>
          <option>Payout</option>
        </select>
        <input
          className="border p-2 rounded flex-1"
          placeholder="Search invoice or note"
        />
        <button className="px-3 py-2 bg-black text-white rounded">
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto border rounded bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Reference</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-t">
                <td className="p-2">2025-09-2{i}</td>
                <td className="p-2">Revenue</td>
                <td className="p-2">ORD-10{i}</td>
                <td className="p-2">$10{i}.00</td>
                <td className="p-2">Online order</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
