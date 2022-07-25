const express = require("express");
const route = require("./routes/route.js");
const mongoose = require("mongoose");
const app = express();
const multer = require("multer");

app.use(express.json());
app.use(multer().any());

mongoose
  .connect(
    "mongodb+srv://Prashant10:Cv4uY0uU1ijKMVpu@cluster0.j9jd1jo.mongodb.net/group56Database-DB?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )

  .then(() => console.log("MongoDb is Connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port" + (process.env.PORT || 3000));
});
