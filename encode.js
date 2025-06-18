// encode.js
const fs = require("fs");

const credentials = fs.readFileSync("credentials.json"); // path to your service account file
const base64 = Buffer.from(credentials).toString("base64");

console.log("Paste this in your .env file:\n");
console.log("GOOGLE_CREDENTIALS_BASE64=" + base64);
