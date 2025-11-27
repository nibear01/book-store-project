/**
 * Helper to make authenticated JSON requests for OTP operations
 */
export const requestJson = async (endpoint, payload) => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Request failed");

  return data;
};

/**
 * Get profile image URL from user object
 */
export const getProfileImageUrl = (user, baseUrl) => {
  const img = user?.profile_image ?? user?.data?.profile_image ?? null;
  return img ? `${baseUrl}${img}` : null;
};
