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
let lastLoggedTime = null;
let data = [];
exports.receiveData = (req, res) => {
    const { value } = req.body;
  const now = new Date();

  // Save to memory
  data.push({ time: now.toISOString(), value });

  setLatestValue(value);

  // Keep last 60
  if (data.length > 60) {
    data = data.slice(-60);
  }

  // Round to minute
  const currentMinuteKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;

  if (currentMinuteKey !== lastLoggedTime) {
    lastLoggedTime = currentMinuteKey;
    console.log("Appending to sheet:", value);
    appendToSheet(value);
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
