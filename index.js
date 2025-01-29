// Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//Environment Setup
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: [
    "https://blog-app-api-4c9z.onrender.com",
    "http://localhost:8000",
    "http://localhost:4000",
    "http://localhost:3000",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

//Route middlware and endpoints
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");

app.use("/users", userRoutes);
app.use("/posts", postRoutes);

//Database Connection
mongoose.connect(process.env.MONGODB_STRING, {});
mongoose.connection.once("open", () =>
  console.log("Now connected to MongoDB Atlas")
);

if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`API is now online on port ${process.env.PORT || 4000}`);
  });
}

module.exports = { app, mongoose };
