const { appendToSheet } = require("../services/sheetService.js");
const sendPushNotification = require("../services/notificationService.js");
const { setLatestValue } = require("../utils/sharedData.js");

let isWarning1ThresholdSended = false;
let isWarning2ThresholdSended = false;
let isWarning3ThresholdSended = false;
let isAlertThresholdSended = false;
let warning1Threshold = 500;
let warning2Threshold = 1000;
let warning3Threshold = 1500;
let alertThreshold = 2000;
let lastLoggedMinute = null;
let data = [];
exports.receiveData = (req, res) => {
 const { value } = req.body;
const now = new Date();
const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in ms
const istDate = new Date(now.getTime() + istOffset);

// Add new value to memory
data.push({
  time: istDate.toISOString(), // Store IST time
  value: value,
});

setLatestValue(value);

// Keep only the last 60 values in memory
if (data.length > 60) {
  oneMinuteData = data.slice(-1)[0]; // Get the last value
  console.log("Appending to sheet:", oneMinuteData);
  appendToSheet(oneMinuteData);
  data = []; // Clear the data after appending
}

// // Use IST minute
// const currentMinute = istDate.getMinutes();

// if (currentMinute !== lastLoggedMinute) {
//   console.log("Current minute (IST):", currentMinute);
//   console.log("Last logged minute:", lastLoggedMinute);
//   console.log("Append to sheet:", value);
//   lastLoggedMinute = currentMinute;
//   appendToSheet(value); // append only once per minute
// }

  if (value == 0 || value > 2000) {
    isWarning1ThresholdSended = false;
    isWarning2ThresholdSended = false;
    isWarning3ThresholdSended = false;
    isAlertThresholdSended = false; // Reset all notification flags when value is 0
  }
  // Check thresholds and send notifications
  if (
    value >= warning1Threshold &&
    value <= warning2Threshold &&
    !isWarning1ThresholdSended
  ) {
    sendPushNotification(
      process.env.FCM_TOKEN,
      "Bladder Warning",
      `Your bag filled ${value} ml`
    );
    isWarning1ThresholdSended = true; // Set the flag to true after sending the notification
  } else if (
    value >= warning2Threshold &&
    value <= warning3Threshold &&
    !isWarning2ThresholdSended
  ) {
    sendPushNotification(
      process.env.FCM_TOKEN,
      "Bladder Warning",
      `Your bladder capacity is full at ${value} ml`
    );
    isWarning2ThresholdSended = true; // Set the flag to true after sending the notification
  } else if (
    value >= warning3Threshold &&
    value <= alertThreshold &&
    !isWarning3ThresholdSended
  ) {
    sendPushNotification(
      process.env.FCM_TOKEN,
      "Bladder Warning",
      `Your bladder capacity is full at ${value} ml`
    );
    isWarning3ThresholdSended = true; // Set the flag to true after sending the notification
  } else if (value >= alertThreshold && !isAlertThresholdSended) {
    sendPushNotification(
      process.env.FCM_TOKEN,
      "Bladder Alert",
      `Your bladder capacity is full at ${value} ml`
    );
    isAlertThresholdSended = true; // Set the flag to true after sending the notification
  }

  res.json({
    receivedData: req.body,
  });
};
