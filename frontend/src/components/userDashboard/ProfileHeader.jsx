import React from "react";

const ProfileHeader = ({ preview, name, email }) => {
  return (
    <div
      className="bg-gradient-to-r from-emerald-600 to-teal-600"
      name="profile_header"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-white">
        <div className="flex items-center gap-4">
          <div
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden bg-white/20 border border-white/30 flex-shrink-0"
            name="profile_avatar"
          >
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-white/80 text-xs sm:text-sm">
                No Image
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className="text-xl sm:text-2xl font-semibold truncate"
              name="profile_header_name"
            >
              {name}
            </h1>
            <p
              className="text-white/90 text-sm truncate mt-1"
              name="profile_header_email"
            >
              {email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
