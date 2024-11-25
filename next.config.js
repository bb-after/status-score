module.exports = {
  reactStrictMode: true,
  env: {
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_SECRET: process.env.AUTH0_SECRET,
    AUTH0_COOKIE_SECURE: process.env.NODE_ENV === 'production' ? 'true' : 'false',
    AUTH0_COOKIE_SAME_SITE: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
  images: {
    domains: ['status-score-public.s3.us-east-2.amazonaws.com'],
  },
  async headers() {
    return [
      {
        // Allowing CORS for Auth0
        source: "/api/auth/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // You may want to restrict this to your domain
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};
