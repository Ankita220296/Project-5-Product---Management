const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const aws = require("aws-sdk");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

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

    let uploadedFileURL = await uploadFile(files[0]);
    data.profileImage = uploadedFileURL;

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

// .................................. Login User .................................//
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

// .................................. Get User .............................//
const getUser = async function (req, res) {
  try {
    console.log(req.headers);
    let userId = req.params.userId;
    if (!ObjectId.isValid(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "UserId is not valid" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).send({ status: true, message: "User not found" });
    }

    // authorization
    if (req.headers.userId !== user._id.toString())
      return res
        .status(403)
        .send({ status: false, msg: "You are not authorized...." });

    return res
      .status(500)
      .send({ status: true, message: "User profile details", data: user });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// .................................. Update User .............................//
const updateUser = async function (req, res) {
  try {
    let userId = req.params.userId;
    let data = req.body;
    if (!ObjectId.isValid(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "UserId is not valid" });
    }

    const { fname, lname, email, phone, address, password } = data;
    let obj = {};

    if (fname) obj.fname = fname;
    if (lname) obj.lname = lname;
    if (email) {
      const existEmail = await userModel.findOne({ email });
      if (existEmail) {
        return res
          .status(400)
          .send({ status: false, message: "This email id is already in use" });
      }
      obj.email = email;
    }

    // ... validation for Profile Image ... //
    let profileImage = req.files;

    if (profileImage && profileImage.length > 0) {
      if (profileImage.length > 1) {
        return res
          .status(400)
          .send({ status: false, message: "Please upload only one image" });
      }
      if (!isValidImage(profileImage[0].originalname)) {
        return res.status(400).send({
          status: false,
          message:
            "Please upload only image file with extension jpg, png, gif, jpeg",
        });
      }
      let uploadedFileURL = await uploadFile(profileImage[0]);
      obj.profileImage = uploadedFileURL;
    }

    // ... validation for password ... //
    const saltRounds = 10;
    if (password) obj.password = await bcrypt.hash(password, saltRounds);

    if (phone) {
      const existPhone = await userModel.findOne({ phone });
      if (existPhone) {
        return res.status(400).send({
          status: false,
          message: "This phone number is already in use",
        });
      }
      obj.phone = phone;
    }

    // ... validation for Address ... //
    if (address) {
      if (address.shipping) {
        if (address.shipping.street) {
          obj["address.shipping.street"] = address.shipping.street;
        }
        if (address.shipping.city) {
          obj["address.shipping.city"] = address.shipping.city;
        }
        if (address.shipping.pincode) {
          obj["address.shipping.pincode"] = address.shipping.pincode;
        }
      }
      if (address.billing) {
        if (address.billing.street) {
          obj["address.billing.street"] = address.billing.street;
        }
        if (address.billing.city) {
          obj["address.billing.city"] = address.billing.city;
        }
        if (address.billing.pincode) {
          obj["address.billing.pincode"] = address.billing.pincode;
        }
      }
    }

    const updateUserDetails = await userModel.findOneAndUpdate(
      { _id: userId },
      obj,
      { new: true }
    );

    if (!updateUserDetails) {
      return res.status(403).send({ status: false, msg: "User not found" });
    }

    return res.status(200).send({
      status: true,
      message: "User profile updated",
      data: updateUserDetails,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  updateUser,
};
