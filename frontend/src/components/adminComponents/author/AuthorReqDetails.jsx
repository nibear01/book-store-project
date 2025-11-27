import React from 'react'

const AuthorReqDetails = ({ selected, setSelected, fmt }) => {
  return (
    <div>
      <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-md shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-semibold">Author Request Details</h3>
              <button
                onClick={() => setSelected(null)}
                className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
                aria-label="Close details"
              >
                Close
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Full Name</div>
                <div className="font-medium text-gray-900">
                  {selected.fullName || "—"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Email</div>
                <div className="font-medium text-gray-900">
                  {selected.email || "—"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Phone</div>
                <div className="font-medium text-gray-900">
                  {selected.phone || "—"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Affiliation</div>
                <div className="font-medium text-gray-900">
                  {selected.affiliation || "—"}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="text-gray-500">Address</div>
                <div className="font-medium text-gray-900">
                  {typeof selected.address === "string"
                    ? selected.address
                    : selected.address
                    ? [
                        selected.address.street,
                        selected.address.city,
                        selected.address.state,
                        selected.address.zip,
                        selected.address.country,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    : "—"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">Title</div>
                <div className="font-medium text-gray-900">
                  {selected.title || "—"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Type of Work</div>
                <div className="font-medium text-gray-900">
                  {selected.typeOfWork || "—"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Language</div>
                <div className="font-medium text-gray-900">
                  {selected.categoryType || "—"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Submitted</div>
                <div className="font-medium text-gray-900">
                  {fmt(selected.createdAt)}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="text-gray-500">Abstract</div>
                <div className="mt-1 whitespace-pre-wrap text-gray-900">
                  {selected.abstract || "—"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">Originality Confirmed</div>
                <div className="font-medium text-gray-900">
                  {selected.rightsOriginal ? "Yes" : "No"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Publish Permission</div>
                <div className="font-medium text-gray-900">
                  {selected.rightsPublish ? "Yes" : "No"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Agreed Editorial</div>
                <div className="font-medium text-gray-900">
                  {selected.agreeEditorial ? "Yes" : "No"}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="text-gray-500">Additional Requests</div>
                <div className="mt-1 whitespace-pre-wrap text-gray-900">
                  {selected.additionalRequests || "—"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">Signature</div>
                <div className="font-medium text-gray-900">
                  {selected.signature || "—"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Date</div>
                <div className="font-medium text-gray-900">
                  {selected.date || "—"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">Email Verified</div>
                <div className="font-medium text-gray-900">
                  {selected.emailVerified ? "Yes" : "No"}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Status</div>
                <div className="font-medium text-gray-900">
                  {selected.status}
                </div>
              </div>
              {selected.reviewNote && (
                <div className="md:col-span-2">
                  <div className="text-gray-500">Review Note</div>
                  <div className="mt-1 whitespace-pre-wrap text-gray-900">
                    {selected.reviewNote}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  )
}

export default AuthorReqDetails
