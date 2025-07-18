const express = require("express");
const cors = require("cors");






const app = express();
app.use(express.json());
app.use(cors());



const FullData = require("./routes/routes.js");
app.use("/api", FullData);

app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on http://0.0.0.0:3000");
});
