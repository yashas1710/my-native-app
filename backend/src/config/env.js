import dotenv from "dotenv";

dotenv.config({ quiet: true });

const requiredVariables = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY_ID",
  "FIREBASE_CLIENT_ID",
  "FIREBASE_CLIENT_X509_CERT_URL",
  "JWT_SECRET",
  "FRONTEND_URL",
];

export function validateEnv(env = process.env) {
  const production = env.NODE_ENV === "production";
  // Local development may omit FRONTEND_URL to use permissive CORS.
  const missing = requiredVariables.filter((name) =>
    (name !== "FRONTEND_URL" || production) && !env[name]?.trim()
  );
  if (!env.FIREBASE_PRIVATE_KEY_BASE64?.trim() && !env.FIREBASE_PRIVATE_KEY?.trim()) {
    missing.push("FIREBASE_PRIVATE_KEY_BASE64 or FIREBASE_PRIVATE_KEY");
  }
  if (missing.length) {
    console.error(`Startup environment validation failed. Missing variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  if (production && (env.JWT_SECRET.length < 32 ||
    ["dev-secret", "secret", "changeme"].includes(env.JWT_SECRET))) {
    console.error("Startup environment validation failed. JWT_SECRET must contain at least 32 characters and must not use a known default.");
    process.exit(1);
  }
}

validateEnv();
