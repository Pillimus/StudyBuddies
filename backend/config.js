const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
      continue;
    }

    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFile(envPath);

function requireEnv(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const config = {
  mongodbUri: requireEnv("MONGODB_URI"),
  jwtSecret: requireEnv("JWT_SECRET"),
  frontendUrl: requireEnv("FRONTEND_URL", "http://localhost:5173"),
  apiBaseUrl: requireEnv("API_BASE_URL", "http://localhost:5000"),
  emailService: requireEnv("EMAIL_SERVICE", "gmail"),
  emailUser: requireEnv("EMAIL_USER"),
  emailPass: requireEnv("EMAIL_PASS"),
  emailFrom: requireEnv("EMAIL_FROM", process.env.EMAIL_USER),
  port: Number(process.env.PORT || 5000),
};

module.exports = config;
