const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const router = express.Router();
// const passport = require("passport");

const userRoutes = require("./Routes/user");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/user", userRoutes);

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

// router.post("/api/auth", (req, res, next) => {
//   const token = req.header("x-auth-token");
//   if (!token) {
//     return res.status(401).json({ msg: "No token, authorization denied" });
//   }
//   try {
//     const decoded = jwt.verify(token, "secret");
//     req.user = decoded.user;
//     next();
//   } catch (err) {
//     res.status(400).json({ msg: "Token is not valid" });
//   }
// });
