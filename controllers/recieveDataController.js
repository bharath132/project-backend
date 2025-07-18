const { appendToSheet } = require("../services/sheetService.js");
const sendPushNotification = require("../services/notificationService.js");
const { setLatestValue } = require("../utils/sharedData.js");

let isWarning1ThresholdSended = false;
let isWarning2ThresholdSended = false;
let isWarning3ThresholdSended = false;
let isAlertThresholdSended = false;
let warning1Threshold = 50;
let warning2Threshold = 100;
let warning3Threshold = 150;
let alertThreshold = 200;
exports.receiveData = (req, res) => {
  const { value } = req.body;
  setLatestValue(value);

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
  // Append the value to the Google Sheet
  appendToSheet(value);
  // Log the received data
  console.log(`Received data: ${JSON.stringify(req.body)}`);
  res.json({
    receivedData: req.body,
  });
};
