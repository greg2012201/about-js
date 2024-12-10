export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? `https://${process.env.SITE_URL}`
    : `http://localhost:${process.env.PORT || 3000}`;
