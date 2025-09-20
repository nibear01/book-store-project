import React from "react";
import { Button } from "../../ui/button.jsx"; // Use the same Button component as Users.jsx

const PaginationBar = ({
  totalItems,
  startIdx,
  pageSize,
  totalPages,
  currentPage,
  onPrev,
  onNext,
  // onGoto, // Not needed for simple prev/next
}) => {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <Button
        onClick={onPrev}
        disabled={currentPage <= 1}
        variant="outline"
        size="sm"
      >
        Prev
      </Button>
      <div className="text-sm text-gray-600">
        Page <span className="font-medium">{currentPage}</span> of {totalPages}
      </div>
      <Button
        onClick={onNext}
        disabled={currentPage >= totalPages}
        variant="outline"
        size="sm"
      >
        Next
      </Button>
    </div>
  );
};

export default PaginationBar;
//             </button>
//           )
//         )}
//         <button
//           className="px-3 py-1 border rounded disabled:opacity-50"
//           onClick={onNext}
//           disabled={currentPage >= totalPages}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PaginationBar;
