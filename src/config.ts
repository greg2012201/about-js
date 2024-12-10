export const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.SITE_URL}`
  : `http://localhost:${process.env.PORT || 3000}`;
