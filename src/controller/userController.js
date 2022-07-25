const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const aws = require("aws-sdk");
const jwt = require("jsonwebtoken");

// validation for Profile image
function isValidImage(value) {
  const regEx = /.+\.(?:(jpg|gif|png|jpeg))/; //It will handle all undefined, null, only numbersNaming, dot, space allowed in between
  const result = regEx.test(value);
  return result;
}

aws.config.update({
  accessKeyId: "AKIAY3L35MCRVFM24Q7U",
  secretAccessKey: "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",
  region: "ap-south-1",
});

let uploadFile = async (file) => {
  return new Promise(function (resolve, reject) {
    let s3 = new aws.S3({ apiVersion: "2006-03-01" });

    var uploadParams = {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",
      Key: "Group56/" + file.originalname,
      Body: file.buffer,
    };

    s3.upload(uploadParams, function (err, data) {
      if (err) {
        return reject({ error: err });
      }
      return resolve(data.Location);
    });
  });
};

// .................................. Create User .............................//
const registerUser = async function (req, res) {
  try {
    let data = req.body;
    const saltRounds = 10;
    let password = data.password;

    let files = req.files;
    if (files.length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Please Upload the Profile Image" });
    } else if (files.length > 1) {
      return res
        .status(400)
        .send({ status: false, message: "Please upload only one image" });
    }

    if (!isValidImage(files[0].originalname)) {
      return res.status(400).send({
        status: false,
        message:
          "Please upload only image file with extension jpg, png, gif, jpeg",
      });
    }
    if (files && files.length > 0) {
      let uploadedFileURL = await uploadFile(files[0]);
      data.profileImage = uploadedFileURL;
    } else {
      return res.status(400).send({ msg: "No file found" });
    }

    data.password = await bcrypt.hash(password, saltRounds);

    const user = await userModel.create(data);
    return res
      .status(201)
      .send({ status: true, message: "User created successfully", data: user });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

// .................................. Login User .............................//
const loginUser = async function (req, res) {
  try {
    let email = req.body.email;
    let password = req.body.password;

    let user = await userModel.findOne({ email });
    let validPassword = await bcrypt.compare(password, user.password);

    if (validPassword) {
      const token = jwt.sign(
        {
          userId: user._id.toString(),
        },
        "project5Group56",
        { expiresIn: "3h" }
      );
      res.status(200).send({
        status: true,
        message: "User login successfull",
        data: { userId: user._id, token: token },
      });
    } else {
      return res.status(400).send({
        status: false,
        message: "Invalid Credentials",
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
