import { srOnly } from "./constants";

export default function AuthorUnavailable() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div
        className="absolute inset-0 pointer-events-none opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg,#fafafa 0px,#fafafa 10px,#f0f0f0 10px,#f0f0f0 20px)",
        }}
      />
      <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row gap-6">
        {/* Avatar placeholder */}
        <div className="group">
          <div className="relative">
            <img
              src={
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(
                  `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
                     <defs>
                       <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
                         <stop offset='0%' stop-color='#e5e7eb'/>
                         <stop offset='100%' stop-color='#f3f4f6'/>
                       </linearGradient>
                     </defs>
                     <rect width='100%' height='100%' rx='64' fill='url(#g)'/>
                     <circle cx='64' cy='50' r='22' fill='#d1d5db'/>
                     <rect x='24' y='78' width='80' height='34' rx='17' fill='#d1d5db'/>
                   </svg>`
                )
              }
              alt="No author assigned"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-white shadow-lg shadow-black/10"
              loading="lazy"
            />
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] bg-black text-white tracking-wide shadow font-medium">
              AUTHOR
            </span>
          </div>
        </div>

        {/* Details placeholder */}
        <div className="flex-1 min-w-0 space-y-4">
          <span className={srOnly}>Author information unavailable. Showing placeholder.</span>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h3 className="font-semibold text-xl sm:text-2xl tracking-tight flex items-center gap-2">
              No Author Assigned
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-gray-100 text-gray-600 border-gray-200">
                N/A
              </span>
            </h3>
          </div>
          <div className="prose prose-sm max-w-none text-gray-800">
            <p>This book currently has no author information associated with it.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
