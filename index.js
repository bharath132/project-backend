const express = require("express");
const cros = require("cors");
const app = express();
app.use(express.json());
app.use(cros());
const rondom = Math.floor(Math.random() * 1000);

app.get("/", (req, res) => {
  const rondom = Math.floor(Math.random() * 100);
  res.json({
  "productName": "Smart Watch",
  "deviceName": "Heart Monitor",
  "userValue": `${rondom}`,
});
});

app.post("/post", (req, res) => {
  
  console.log(`Received data: ${JSON.stringify(req.body)}`);
  res.json({
    "receivedData": req.body,
  });
});
// Binding the server to '0.0.0.0' allows it to accept connections from any network interface,
// making it accessible not only from localhost but also from other devices in the same network.
app.listen(3000, '0.0.0.0', () => {
    console.log("Server is running on http://0.0.0.0:3000");
});