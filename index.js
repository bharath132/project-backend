const express = require("express");
const cros = require("cors");
const app = express();

app.use(cros());
const rondom = Math.floor(Math.random() * 1000);

app.get("/", (req, res) => {
  const rondom = Math.floor(Math.random() * 100);
  res.json(rondom);
});


// Binding the server to '0.0.0.0' allows it to accept connections from any network interface,
// making it accessible not only from localhost but also from other devices in the same network.
app.listen(3000, '0.0.0.0', () => {
    console.log("Server is running on http://0.0.0.0:3000");
});