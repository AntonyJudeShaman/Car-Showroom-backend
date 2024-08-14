const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const authMiddleware = require("./config/middleware");
require("./config/passport");
const userRoutes = require("./Routes/user");
const carRoutes = require("./Routes/car");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(passport.initialize());

const publicRoutes = [
  "/api/user/login",
  "/api/user/register",
  "/api/user/verify-user",
  "/api/car/view-all-cars",
];

app.use((req, res, next) => {
  if (publicRoutes.includes(req.path)) {
    return next();
  }
  return authMiddleware(req, res, next);
});

app.use("/api/user", userRoutes);
app.use("/api/car", carRoutes);

const db = process.env.MONGODB_URI;
mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Server Online");
});

app.listen(3000, () => {
  console.log("Server is running");
});

module.exports = app;
