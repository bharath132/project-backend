const express = require("express");
const cros = require("cors");
const sendPushNotification = require("./sendNotification.js");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cros());

let nextRondom = 0;
let history = {};
app.get("/", (req, res) => {
  if (nextRondom > 100) {
    nextRondom = 0; // Reset the counter if it exceeds 100
    console.log("Resetting nextRondom to 0");
  }
  const rondom = Math.floor(Math.random() * 9);
  nextRondom += rondom;
  // Store the current value in history
  if (nextRondom % 50 == 0) {
    history = {
      ...history,
      [new Date().toISOString()]: nextRondom,
      
      
    };
    console.log(history)
  }
  if (Object.keys(history).length > 50) {
    const oldestKey = Object.keys(history)[0];
    delete history[oldestKey];
  }
  //send notification if value is high
  if (nextRondom > 50) {
    console.log("High heart rate detected:", nextRondom);
    sendPushNotification(
      process.env.FCM_TOKEN,
      "Alert",
      `Your heart rate is high! ${rondom} bpm`
    );
  }

  // respond
  res.json({
    productName: "Smart Watch",
    deviceName: "Heart Monitor",
    userValue: `${nextRondom}`,
    history: Object.entries(history).slice().reverse().map(([time, value]) => ({ time, value })), // Reverse the history to show the latest values first
  });
});

app.post("/post", (req, res) => {
  console.log(`Received data: ${JSON.stringify(req.body)}`);
  res.json({
    receivedData: req.body,
  });
});
// Binding the server to '0.0.0.0' allows it to accept connections from any network interface,
// making it accessible not only from localhost but also from other devices in the same network.
app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on http://0.0.0.0:3000");
});
