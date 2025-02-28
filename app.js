const express = require("express");
const bodyParser = require("body-parser");
const fs = require('fs');
const path = require('path');
const mongoose = require("mongoose");
const HttpError = require("./models/http-error");
const placesRoutes = require("./routes/places-routes");
const userRouter = require("./routes/users-routes");
var cors = require('cors')
const app = express();

app.use(cors())
app.use(bodyParser.json());
app.use("/api/places", placesRoutes);
app.use("/api/users", userRouter);
app.use('/uploads/images',express.static(path.join('uploads','images')))
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});
app.use((error, req, res, next) => {
  if(req.file){
    fs.unlink(req.file.path,err=>{
      console.log(err)
    })
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});
mongoose
  .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0edfa.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`)
  .then(() => {
    app.listen(process.env.PORT||5000);
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(error);
  });
