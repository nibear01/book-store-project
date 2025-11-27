import React from 'react';

/*
  WorkflowSkeleton
  Props:
   - rows (number) how many placeholder rows/cards (default 8)
   - variant: 'table' | 'cards'
   - columns: number of visible columns for table layout (used for colSpan) default 5
*/
export default function WorkflowSkeleton({ rows = 8, variant = 'table', columns = 5 }) {
  if (variant === 'cards') {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="border rounded bg-white p-3 shadow-sm animate-pulse">
            <div className="flex justify-between items-start gap-3 mb-2">
              <div className="flex-1">
                <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-36 bg-gray-200 rounded" />
              </div>
              <div className="h-4 w-14 bg-gray-200 rounded" />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 mb-2">
              <div className="h-3 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }
  // table variant
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse border-t">
          <td colSpan={columns} className="p-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-40 bg-gray-200 rounded" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-8 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}
