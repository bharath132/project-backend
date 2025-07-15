
const sendPushNotification = require("../services/notificationService.js");
const { getFromSheet } = require("../services/sheetService.js");
const downsampleTo10Seconds = require("../utils/downsample.js");
const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
//Decode credentials
const credentialsJson = Buffer.from(
  process.env.GOOGLE_CREDENTIALS_BASE64,
  "base64"
).toString("utf-8");


const nextRondom = Math.floor(Math.random() * 100); // Simulated value for demonstration
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