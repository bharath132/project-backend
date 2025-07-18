const admin = require("firebase-admin");
const fs = require("fs");
const os = require("os");
const path = require("path");

// Decode base64 into a temporary JSON file
const credentialsJson = Buffer.from(
  process.env.FIREBASE_CREDENTIALS_BASE64,
  "base64"
).toString("utf-8");
const tempPath = path.join(os.tmpdir(), "firebase_credentials.json");
fs.writeFileSync(tempPath, credentialsJson);

// ✅ Parse the JSON instead of using the file path
const parsedCredentials = JSON.parse(credentialsJson);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(parsedCredentials),
});

module.exports = admin;
