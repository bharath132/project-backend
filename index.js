const express = require("express");
const cros = require("cors");
const sendPushNotification = require("./sendNotification.js");
const { log } = require("console");
const app = express();
app.use(express.json());
app.use(cros());

app.get("/", (req, res) => {
  const rondom = Math.floor(Math.random() * 100);
  res.json({
    productName: "Smart Watch",
    deviceName: "Heart Monitor",
    userValue: `${rondom}`,
  });
  if (rondom > 50) {
    console.log("High heart rate detected:", rondom);
    sendPushNotification(
      "fRob3roCSq-GDeRd4rqv57:APA91bFZpoXyFLrXsJwAaeiM5W2ySWZLDyGm2Uk7Rl9QGUN6l9gWgfdaWHCdReyNaOGHPuV_Hdzqmg39-JNpcTBv29gE6nsXphqPNC3ARmt5Cv8o8CxDfJ0",
      "Alert",
      "Your heart rate is high!"
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
