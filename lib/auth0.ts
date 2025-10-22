import { initAuth0 } from "@auth0/nextjs-auth0";

// Configure Auth0 with serverless-friendly options
export default initAuth0({
  secret: process.env.AUTH0_SECRET!,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL!,
  baseURL: process.env.AUTH0_BASE_URL!,
  clientID: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,

  // Serverless environment optimizations
  httpTimeout: 10000, // 10 second timeout
  clockTolerance: 60, // Allow 60 seconds clock skew

  // HTTP agent options to fix the "listener" error in serverless
  httpAgent: undefined, // Use default agent options

  // Session configuration
  session: {
    cookie: {
      // Ensure cookies work in production
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
    },
    // Reduce session size for serverless
    storeIDToken: false,
    rollingDuration: 60 * 60 * 24 * 7, // 7 days
  },

  // Auth0 routes
  routes: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    callback: "/api/auth/callback",
    postLogoutRedirect: "/",
  },
});
