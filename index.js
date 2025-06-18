const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const sendPushNotification = require("./sendNotification.js");
const app = express();
app.use(express.json());
app.use(cors());

let nextRondom = 0;
let history = {};
let sheetData = [];

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
  keyFile: tempPath, //  Use the temp path
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const spreadsheetId = "14wKbS-ddV--wrrXvx-KM0GqMEsRrUAASlWKoLdNzIMA";
function getISTTime() {
  const utcDate = new Date("2025-06-18T20:15:50.000Z");

  return utcDate.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
        values: [[getISTTime(), data]],
      },
    });
    console.log(" Appended to sheet:", data);
  } catch (err) {
    console.error(" Sheet error:", err.message);
  }
}
async function getFromSheet() {
  try {
    await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth });
    const respond = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A:B",
    });
    sheetData = respond.data.values;
  } catch (err) {
    console.error("Error fetching data from sheet:", err.message);
  }
}
app.get("/", async (req, res) => {
  const rondom = Math.floor(Math.random() * 9);
  nextRondom += rondom;

  if (nextRondom > 100) {
    nextRondom = 0; // Reset the counter if it exceeds 100
    console.log("Resetting nextRondom to 0");
  }
  await appendToSheet(nextRondom);
  await getFromSheet();
  const simplified = sheetData.filter(
    (data) => Number(data[1]) !== 0 && Number(data[1]) % 50 === 0
  );
  if (simplified.length > 50) {
    simplified.slice(-50).reverse(); // Reverse the array to show the latest values first
  }
  console.log("Sheet data:", simplified);
  // Store the current value in history
  if (nextRondom % 50 == 0 && nextRondom != 0) {
    history = {
      ...history,
      [new Date().toISOString()]: nextRondom,
    };
    console.log(history);
  }

  // Limit the history to the last 50 entries
  if (Object.keys(history).length > 50) {
    const oldestKey = Object.keys(history)[0];
    delete history[oldestKey];
  }

  //send notification if value is high
  if (nextRondom > 50) {
    console.log("High rate detected:", nextRondom);
    sendPushNotification(
      process.env.FCM_TOKEN,
      "Alert",
      `Your bag filled 50% ${rondom} `
    );
  }

  // respond
  res.json({
    productName: "Urinary Bladder Monitor",
    deviceName: "Urinary Bladder Monitor",
    userValue: `${nextRondom}`,
    history: simplified.map(([time, value]) => ({
      time,
      value: Number(value),
    })), // Reverse the history to show the latest values first
  });
});

app.post("/post", (req, res) => {
  console.log(`Received data: ${JSON.stringify(req.body)}`);
  res.json({
    receivedData: req.body,
  });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on http://0.0.0.0:3000");
});
