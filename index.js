const express = require("express");
const cros = require("cors");
const app = express();

app.use(cros());

app.get("/", (req, res) => {
  res.json({
    messages: [{
        id: 1,
        text: "Hello, world!",
    },{
        id: 2,
        text: "Welcome to the API!",
    }],
  });
});


// Binding the server to '0.0.0.0' allows it to accept connections from any network interface,
// making it accessible not only from localhost but also from other devices in the same network.
app.listen(3000, '0.0.0.0', () => {
    console.log("Server is running on http://0.0.0.0:3000");
});