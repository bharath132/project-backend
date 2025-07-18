const sendPushNotification = require("../services/notificationService.js");
const { getFromSheet, appendToSheet } = require("../services/sheetService.js");
const downsampleTo10Seconds = require("../utils/downsample.js");
const { getLatestValue } = require("../utils/sharedData.js");
exports.getFullData = async (req, res) => {
  const latestValue = getLatestValue();
  //simulate send notification if value is high
  if (latestValue > 50) {
    console.log("High rate detected:", latestValue);
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
    userValue: `${latestValue}`,
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
};
