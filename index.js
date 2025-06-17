const express = require("express");
const cros = require("cors");
const sendPushNotification = require("./sendNotification.js");
const { google } = require("googleapis");
require("dotenv").config();
const app = express();
const fs = require("fs");
const path = require("path");
app.use(express.json());
app.use(cros());

let nextRondom = 0;
let history = {};

// Initialize Google Sheets API
const credentialsJson = Buffer.from(
  process.env.GOOGLE_CREDENTIALS_BASE64,
  "base64"
).toString("utf-8");
const tempPath = path.join("/tmp", "credentials.json");
fs.writeFileSync(tempPath, credentialsJson);

const auth = new google.auth.GoogleAuth({
  keyFile: tempPath,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const spreadsheetId = "14wKbS-ddV--wrrXvx-KM0GqMEsRrUAASlWKoLdNzIMA";

// Function to append data to Google Sheets
async function appendToSheet(data) {
  try {
    const authClient = await auth.getClient(); // 🔥 This is the key line
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:B",
      valueInputOption: "RAW",
      resource: {
        values: [[new Date().toISOString(), data]],
      },
    });

    console.log(
      "✅ Data appended to sheet:",
      response.data.updates.updatedRange
    );
  } catch (error) {
    console.error("❌ Error appending data to sheet:", error.message);
  }
}

app.get("/", (req, res) => {
  const rondom = Math.floor(Math.random() * 9);
  nextRondom += rondom;

  if (nextRondom > 100) {
    nextRondom = 0; // Reset the counter if it exceeds 100
    console.log("Resetting nextRondom to 0");
  }
  appendToSheet(nextRondom); // Append the current value to Google Sheets
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
    history: Object.entries(history)
      .slice()
      .reverse()
      .map(([time, value]) => ({ time, value })), // Reverse the history to show the latest values first
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
