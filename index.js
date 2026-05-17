const express = require("express");
const cookieParser = require("cookie-parser");
const authRoute = require("./src/routes/auth.route");
const profileRoute = require("./src/routes/profile.route");
const uploadRoute = require("./src/routes/upload.route");
const app = express();

const PORT = 8000;

app.use(cookieParser());
app.use(express.json());
app.use("/test", (req, res) => {
  res.send({ messgae: "server ok" });
});
app.use("/api", authRoute);
app.use("/api", profileRoute);
app.use("/api", uploadRoute);

app.listen(PORT, () => {
  console.log("server is running on port " + PORT);
});
