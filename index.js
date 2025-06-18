const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const serverless = require("serverless-http");

const app = express();
app.use(express.json());
app.use(cors());

let nextRondom = 0;
let history = {};

// Decode credentials.json



const os = require("os");


// 1. Decode credentials
const credentialsJson = Buffer.from(
  process.env.GOOGLE_CREDENTIALS_BASE64,
  "base64"
).toString("utf-8");

// 2. Write to temp path (safe for Vercel and Windows)
const tempPath = path.join(os.tmpdir(), "credentials.json");
fs.writeFileSync(tempPath, credentialsJson);

// 3. Auth setup
const auth = new google.auth.GoogleAuth({
  keyFile: tempPath, // ✅ Use the temp path
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const spreadsheetId = "14wKbS-ddV--wrrXvx-KM0GqMEsRrUAASlWKoLdNzIMA";

// 4. Append function
async function appendToSheet(data) {
  try {
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:B",
      valueInputOption: "RAW",
      resource: {
        values: [[new Date().toISOString(), data]],
      },
    });

    console.log("✅ Appended to sheet:", data);
  } catch (err) {
    console.error("❌ Sheet error:", err.message);
  }
}

app.get("/", async (req, res) => {
  const rondom = Math.floor(Math.random() * 9);
  nextRondom += rondom;

  if (nextRondom > 100) nextRondom = 0;

  await appendToSheet(nextRondom);

  res.json({
    value: nextRondom,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
