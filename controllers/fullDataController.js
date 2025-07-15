const { google } = require("googleapis");
const fs = require("fs");
const os = require("os");
const path = require("path");
const dayjs = require("dayjs");
let sheetData = [];
let ChartData = [];
const sendPushNotification = require("../sendNotification.js");
const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
//Decode credentials
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
function downsampleTo10Seconds(data) {
  const result = [];

  for (let i = 0; i < data.length; i += 3) {
    const group = data.slice(i, i + 3);

    // Extract numeric values
    const values = group.map(d => Number(d[1])).filter(v => !isNaN(v));
    if (values.length === 0) continue;

    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    // Use the last timestamp in the group
    const rawTime = group[group.length - 1][0];
    const formattedTime = dayjs(rawTime).format("YYYY-MM-DDTHH:mm:ss");

    result.push({
      time: formattedTime,
      value: Math.round(avg), // rounded for cleaner display
    });
  }

  return result;
}
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