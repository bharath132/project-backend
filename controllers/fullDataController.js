const { google } = require("googleapis");
const { auth } = require("../config/googleAuth.js");
const sendPushNotification = require("../services/notificationService.js");
const { getFromSheet } = require("../services/sheetService.js");
const downsampleTo10Seconds = require("../utils/downsample.js");
const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
//Decode credentials
const credentialsJson = Buffer.from(
  process.env.GOOGLE_CREDENTIALS_BASE64,
  "base64"
).toString("utf-8");
let nextRondom = 0;
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

setInterval(async () => {
  if (nextRondom > 2000) {
    nextRondom = 0; // Reset if value exceeds 2000
  }
  nextRondom = nextRondom + 10;
  await appendToSheet(nextRondom);
}, 1000);
 // Simulated value for demonstration
exports.getFullData = async (req, res) => {

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
  const reducedData = downsampleTo10Seconds(ChartData);
  // respond
  res.json({
    userValue: `${nextRondom}`,
    history: simplified.map(([time, value]) => ({
      time,
      value: Number(value),
    })),
    ChartData: reducedData,
    // ChartData: ChartData.map(([time, value]) => ({
    //   time: new Date(time).toLocaleString("sv-SE").replace(" ", "T"),
    //   value: Number(value)
    // }))
  });
}

exports.getLiveData = async (req, res) => {
  await getFromSheet();
  //filter and simplify the data
  let simplified = sheetData.filter(
    (data) => Number(data[1]) !== 0 && Number(data[1]) % 50 === 0
  );
  if (simplified.length > 25) {
    simplified = simplified.slice(-25).reverse();
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
}