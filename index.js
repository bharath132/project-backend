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


// function downsampleTo10Seconds(data) {
//   const result = [];

//   for (let i = 0; i < data.length; i += 10) {
//     const group = data.slice(i, i + 10);

//     // Extract numeric values
//     const values = group.map(d => Number(d[1])).filter(v => !isNaN(v));
//     if (values.length === 0) continue;

//     const avg = values.reduce((a, b) => a + b, 0) / values.length;

//     // Use the last timestamp in the group
//     const rawTime = group[group.length - 1][0];
//     const formattedTime = dayjs(rawTime).format("YYYY-MM-DDTHH:mm:ss");

//     result.push({
//       time: formattedTime,
//       value: Math.round(avg), // rounded for cleaner display
//     });
//   }

//   return result;
// }

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

setInterval(async () => {
   if( nextRondom > 2000) {
     nextRondom = 0; // Reset if value exceeds 2000
   }
   nextRondom = nextRondom + 10;
     await appendToSheet(nextRondom);
 }, 1000);
app.get("/", async (req, res) => {

  //value simulation

  //simulate send notification if value is high
  if (nextRondom > 50) {
    console.log("High rate detected:", nextRondom);
    sendPushNotification(
      process.env.FCM_TOKEN,
      "Alert",
      `Your bag filled 50%  `
    );
  }


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
// const reducedData = downsampleTo10Seconds(ChartData);
  // respond
  res.json({
    userValue: `${nextRondom}`,
    history: simplified.map(([time, value]) => ({
      time,
      value: Number(value),
    })),
    // ChartData: reducedData,
    ChartData: ChartData.map(([time, value]) => ({
      time: new Date(time).toLocaleString("sv-SE").replace(" ", "T"),
      value: Number(value)
    }))});
  });
app.get("/live", async (req, res) => {
  await getFromSheet();
  //filter and simplify the data
  let simplified = sheetData.filter(
    (data) => Number(data[1]) !== 0 && Number(data[1]) % 50 === 0
  );
   if (simplified.length > 50) {
    simplified = simplified.slice(-50).reverse();
  }
  // Get the last 1 entries for ChartData
  ChartData = sheetData.slice(-1);
  res.json({
    userValue: `${nextRondom}`,
    history: simplified.map(([time, value]) => ({
      time,
      value: Number(value),
    })),
    ChartData: ChartData.map(([time, value]) => ({
      time: new Date(time).toLocaleString("sv-SE").replace(" ", "T"),
      value: Number(value)
    }))
  });
});
app.post("/post", (req, res) => {
  value = req.body;


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
