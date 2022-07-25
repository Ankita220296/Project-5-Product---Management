const userModel = require("../models/userModel");

// Validataion for empty request body
const checkBodyParams = function (value) {
  if (Object.keys(value).length === 0) return false;
  else return true;
};

const isValidBody = function (value) {
  if (typeof value === "undefined" || value === "null") return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "number" && value.toString().trim().length === 0)
    return false;
  return true;
};

const isValidEmail = function (email) {
  let checkemail = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
  if (checkemail.test(email)) {
    return true;
  }
  return false;
};

const isValidMobileNumber = function (mobile) {
  let checkMobile = /^\s*\+91\s[6-9]\d{9}$/;
  if (checkMobile.test(mobile)) {
    return true;
  }
  return false;
};

const isValidPassword = function (password) {
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,15}$/; //for password space not allowed, also handles !password
  return re.test(password);
};

// Validation for Strings contain numbers
const stringContainNumber = function (value) {
  if (!/^[ a-z ]+$/i.test(value)) return false;
  else return true;
};

// Validation for User
const validationForUser = async function (req, res, next) {
  try {
    let data = req.body;
    const { fname, lname, email, phone, password, address } = data;

    if (!checkBodyParams(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Please input Parameters" });
    }

    if (!isValidBody(fname)) {
      return res.status(400).send({
        status: false,
        message: "Please provide first name , eg.Ankita",
      });
    }
    if (!stringContainNumber(fname)) {
      return res.status(400).send({
        status: false,
        message: "Please provide first name with right format",
      });
    }

    if (!isValidBody(lname)) {
      return res.status(400).send({
        status: false,
        message: "Please provide last name , eg.Sangani",
      });
    }
    if (!stringContainNumber(lname)) {
      return res.status(400).send({
        status: false,
        message: "Please provide last name with right format",
      });
    }

    if (!isValidBody(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter email" });
    } else if (!isValidEmail(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email is not valid" });
    }
    const existEmail = await userModel.findOne({ email });
    if (existEmail) {
      return res
        .status(400)
        .send({ status: false, message: "This Email is already in use" });
    }

    if (!phone) {
      return res.status(400).send({
        status: false,
        message: "Please enter mobile number",
      });
    }
    if (!isValidMobileNumber(phone)) {
      return res.status(400).send({
        status: false,
        message: "Please enter 10 digit indian number",
      });
    }
    const existPhone = await userModel.findOne({ phone });
    if (existPhone) {
      return res.status(400).send({
        status: false,
        message: "This Mobile number is already in use",
      });
    }
    if (!isValidPassword(password)) {
      return res.status(400).send({
        status: false,
        message:
          "Please enter valid password with one uppercase ,lowercse and special character and length should be 8 to 15",
      });
    }
    if (!isValidBody(address.shipping.street)) {
      return res.status(400).send({
        status: false,
        message: "Please enter street in shipping address",
      });
    }
    if (!isValidBody(address.shipping.city)) {
      return res.status(400).send({
        status: false,
        message: "Please enter city in shipping address",
      });
    }
    if (isNaN(address.shipping.pincode)) {
      return res.status(400).send({
        status: false,
        message: "Please enter pincode in shipping address",
      });
    }
    if (!/^\d{6}$/.test(address.shipping.pincode)) {
      return res.status(400).send({
        status: false,
        message: "Please enter valid pincode",
      });
    }
    if (!isValidBody(address.billing.street)) {
      return res.status(400).send({
        status: false,
        message: "Please enter street in billing address",
      });
    }
    if (!isValidBody(address.billing.city)) {
      return res.status(400).send({
        status: false,
        message: "Please enter city in billing address",
      });
    }
    if (isNaN(address.billing.pincode)) {
      return res.status(400).send({
        status: false,
        message: "Please enter pincode in billing address",
      });
    }
    if (!/^\d{6}$/.test(address.billing.pincode)) {
      return res.status(400).send({
        status: false,
        message: "Please enter valid pincode",
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
  next();
};
module.exports = { validationForUser };
