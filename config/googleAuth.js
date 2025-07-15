const {google } = require('googleapis');
const fs = require('fs');
const os = require('os');
const path = require('path');
const credentialsJson = Buffer.from(
  process.env.GOOGLE_CREDENTIALS_BASE64,
  "base64"
).toString("utf-8");

//Write to temp path (safe for Vercel and Windows)
const tempPath = path.join(os.tmpdir(), "credentials.json");
fs.writeFileSync(tempPath, credentialsJson);

const auth = new google.auth.GoogleAuth({
  keyFile: tempPath, //  Use the temp path
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

exports.auth = auth;