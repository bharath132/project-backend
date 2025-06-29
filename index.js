const express = require("express");
const cors = require("cors");
const fs = require("fs");
const os = require("os");
const path = require("path");
require("dotenv").config();
const sendPushNotification = require("./sendNotification.js");
const { google } = require("googleapis");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const app = express();
app.use(express.json());
app.use(cors());

let nextRondom = 0;
let sheetData = [];
let ChartData = [];
let value;
const warning1Threshold = 500;
const warning2Threshold = 1000;
const warning3Threshold = 1500;
const alertThreshold = 2000;
const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

//Decode credentials
const credentialsJson = Buffer.from(
  process.env.GOOGLE_CREDENTIALS_BASE64,
  "base64"
).toString("utf-8");

//Write to temp path (safe for Vercel and Windows)
const tempPath = path.join(os.tmpdir(), "credentials.json");
fs.writeFileSync(tempPath, credentialsJson);

//Auth setup
const auth = new google.auth.GoogleAuth({
  keyFile: tempPath, //  Use the temp path
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

//IST time
function getISTTime() {
  const utcDate = new Date();

  return utcDate.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "numeric",
  });
}

// Append function
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

//READ data from sheet
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
  //value simulation
  const rondom = Math.floor(Math.random() * 9);
  nextRondom += rondom;
  if (nextRondom > 1000) {
    nextRondom = 0; // Reset the counter if it exceeds 100
    console.log("Resetting nextRondom to 0");
  }
  //simulate send notification if value is high
  if (nextRondom > 50) {
    console.log("High rate detected:", nextRondom);
    sendPushNotification(
      process.env.FCM_TOKEN,
      "Alert",
      `Your bag filled 50%  `
    );
  }
  await appendToSheet(nextRondom);

  await getFromSheet();
  //filter and simplify the data
  let simplified = sheetData.filter(
    (data) => Number(data[1]) !== 0 && Number(data[1]) % 50 === 0
  );
  if (simplified.length > 50) {
    simplified = simplified.slice(-50).reverse();
  }
  ChartData = sheetData.slice(-3600);
  console.log("Sheet data:", simplified);

  // respond
  res.json({
    userValue: `${nextRondom}`,
    history: simplified.map(([time, value]) => ({
      time,
      value: Number(value),
    })),
    ChartData: ChartData.map(([time, value]) => ({
      time: new Date(time).toLocaleString("sv-SE")
  .replace(" ", "T"),
      value: Number(value),
    })), // Reverse the history to show the latest values first
  });
});

app.post("/post", (req, res) => {
  value = req.body;
  appendToSheet(value);

  if (value == 0) {
    isWarning1ThresholdSended = false;
    isWarning2ThresholdSended = false;
    isWarning3ThresholdSended = false;
    isAlertThresholdSended = false; // Reset all notification flags when value is 0
  }
  // Check thresholds and send notifications
  if (
    value > warning1Threshold &&
    value <= warning2Threshold &&
    !isWarning1ThresholdSended
  ) {
    sendPushNotification(
      process.env.FCM_TOKEN,
      "Warning",
      `Your bag filled ${value} ml`
    );
    isWarning1ThresholdSended = true; // Set the flag to true after sending the notification
  } else if (
    value > warning2Threshold &&
    value <= warning3Threshold &&
    !isWarning2ThresholdSended
  ) {
    sendPushNotification(
      process.env.FCM_TOKEN,
      "Warning",
      `Your bag filled ${value} ml`
    );
    isWarning2ThresholdSended = true; // Set the flag to true after sending the notification
  } else if (
    value > warning3Threshold &&
    value <= alertThreshold &&
    !isWarning3ThresholdSended
  ) {
    sendPushNotification(
      process.env.FCM_TOKEN,
      "Warning",
      `Your bag filled ${value} ml`
    );
    isWarning3ThresholdSended = true; // Set the flag to true after sending the notification
  } else if (value > alertThreshold && !isAlertThresholdSended) {
    sendPushNotification(
      process.env.FCM_TOKEN,
      "Alert",
      `Your bag filled ${value} ml`
    );
    isAlertThresholdSended = true; // Set the flag to true after sending the notification
  }

  // Log the received data
  console.log(`Received data: ${JSON.stringify(req.body)}`);
  res.json({
    receivedData: req.body,
  });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on http://0.0.0.0:3000");
});
