import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow this in production with debug parameter
  if (process.env.NODE_ENV === "production" && req.query.debug !== "true") {
    return res.status(404).json({ error: "Not found" });
  }

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,

    // Environment variables check
    envVars: {
      AUTH0_BASE_URL: process.env.AUTH0_BASE_URL ? "✓ Set" : "✗ Missing",
      AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL
        ? "✓ Set"
        : "✗ Missing",
      AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ? "✓ Set" : "✗ Missing",
      AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET
        ? "✓ Set"
        : "✗ Missing",
      AUTH0_SECRET: process.env.AUTH0_SECRET ? "✓ Set" : "✗ Missing",
    },

    // URL validation
    urls: {
      baseUrl: process.env.AUTH0_BASE_URL,
      baseUrlValid: process.env.AUTH0_BASE_URL
        ? isValidUrl(process.env.AUTH0_BASE_URL)
        : false,
      issuerUrl: process.env.AUTH0_ISSUER_BASE_URL,
      issuerUrlValid: process.env.AUTH0_ISSUER_BASE_URL
        ? isValidUrl(process.env.AUTH0_ISSUER_BASE_URL)
        : false,
    },

    // Expected callback URLs
    expectedCallbacks: {
      login: `${process.env.AUTH0_BASE_URL}/api/auth/login`,
      logout: `${process.env.AUTH0_BASE_URL}/api/auth/logout`,
      callback: `${process.env.AUTH0_BASE_URL}/api/auth/callback`,
    },

    // Common issues to check
    commonIssues: [
      {
        check: "Base URL matches domain",
        status: process.env.AUTH0_BASE_URL?.includes(req.headers.host || "")
          ? "✓ OK"
          : "⚠ Mismatch",
        current: process.env.AUTH0_BASE_URL,
        expected: `https://${req.headers.host}`,
      },
      {
        check: "HTTPS in production",
        status: process.env.AUTH0_BASE_URL?.startsWith("https://")
          ? "✓ OK"
          : "⚠ Not HTTPS",
      },
      {
        check: "Issuer URL format",
        status: process.env.AUTH0_ISSUER_BASE_URL?.includes(".auth0.com")
          ? "✓ OK"
          : "⚠ Invalid format",
      },
    ],

    // Request info
    requestInfo: {
      host: req.headers.host,
      userAgent: req.headers["user-agent"],
      origin: req.headers.origin,
      referer: req.headers.referer,
      protocol: req.headers["x-forwarded-proto"] || "http",
    },
  };

  return res.status(200).json(diagnostics);
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
