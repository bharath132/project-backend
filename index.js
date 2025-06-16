const express = require("express");
const cros = require("cors");
const sendPushNotification = require("./sendNotification.js");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cros());

let nextRondom = 0;
app.get("/", (req, res) => {
  const rondom = Math.floor(Math.random() * 1);
  nextRondom += rondom;
  res.json({
    productName: "Smart Watch",
    deviceName: "Heart Monitor",
    userValue: `${nextRondom}`,
  });
  if (nextRondom > 50) {
    console.log("High heart rate detected:", nextRondom);
    sendPushNotification(
      process.env.FCM_TOKEN,
      "Alert",
      `Your heart rate is high! ${rondom} bpm`
    );
  }
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
