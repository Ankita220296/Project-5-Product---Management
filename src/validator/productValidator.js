const productModel = require("../models/productModel");
const { checkBodyParams, isValidBody } = require("../validator/userValidation");

const isValidPrice = function (x) {
  let checkPrice = /^\s*[0-9\.]{1,7}$/;
  if (checkPrice.test(x)) {
    return true;
  }
  return false;
};

// Validation for length of characters
const lengthOfCharacter = function (value) {
  if (!/^\s*(?=[a-zA-Z])[\w\.\s]{3,25}\s*$/.test(value)) return false;
  else return true;
};

const descriptionLength = function (value) {
  if (!/^\s*(?=[a-zA-Z])[\w\.\s]{3,1000}\s*$/.test(value)) return false;
  else return true;
};

const isAvailableCurrency = function (x) {
  if (x) {
    x = x.trim();
  } //trimming of the title before test
  if (x !== "INR") {
    return false;
  }
  return true;
};

const isCurrencyFormat = function (x) {
  if (x) {
    x = x.trim();
  } //trimming of the title before test
  if (x !== "₹") {
    return false;
  }
  return true;
};
const isValidInstallments = function (x) {
  let checkIns = /^[0-9]{1}$/;
  if (checkIns.test(x)) {
    return true;
  }
  return false;
};

let isValidEnum = (enm) => {
  var uniqueEnums = [...new Set(enm)];
  const enumList = ["S", "XS", "M", "X", "L", "XXL", "XL"];
  return (
    enm.length === uniqueEnums.length && enm.every((e) => enumList.includes(e))
  );
};
// ....................................... Validation for Product .................................//
const validationForProduct = async function (req, res, next) {
  try {
    let data = req.body;
    let {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      style,
      availableSizes,
      installments,
      isDeleted,
    } = data;

    if (!checkBodyParams(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Please input Parameters" });
    }
    if (!isValidBody(title)) {
      return res.status(400).send({
        status: false,
        message: "Please provide title",
      });
    }
    if (!lengthOfCharacter(title)) {
      return res.status(400).send({
        status: false,
        message: "Please provide title with right format",
      });
    }
    const existTitle = await productModel.findOne({ title });
    if (existTitle) {
      return res
        .status(400)
        .send({ status: false, message: "This title is already in use" });
    }

    if (!isValidBody(description)) {
      return res.status(400).send({
        status: false,
        message: "Please provide description",
      });
    }
    if (!descriptionLength(description)) {
      return res.status(400).send({
        status: false,
        message: "Please provide description with right format",
      });
    }

    if (!isValidBody(price)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter Price" });
    }

    if (!isValidPrice(price)) {
      return res.status(400).send({
        status: false,
        message: "Please enter Price in correct form, eg: 500, 476.50",
      });
    }

    if (!isValidBody(currencyId)) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter currencyId" });
    }

    if (!isAvailableCurrency(currencyId)) {
      return res.status(400).send({
        status: false,
        message: "currencyId can only be in 'INR' ",
      });
    }

    if (!isValidBody(currencyFormat)) {
      return res.status(400).send({
        status: false,
        message: "Please enter currency format, eg: '₹' ",
      });
    }

    if (!isCurrencyFormat(currencyFormat)) {
      return res.status(400).send({
        status: false,
        message: "currency format can only be in '₹' ",
      });
    }

    if (typeof isFreeShipping === "string") {
      if (!["true", "false"].includes(isFreeShipping)) {
        return res.status(400).send({
          status: false,
          message: "isFreeShopping can only be true or false",
        });
      }
    }

    if (!isValidBody(style) && !lengthOfCharacter(style)) {
      return res.status(400).send({
        status: false,
        message: "Please mention the style of the product",
      });
    }

    if (!availableSizes) {
      return res.status(400).send({
        status: false,
        message: "Please enter sizes of the product",
      });
    }

    const availSizes = availableSizes
      .split(" ")
      .map((s) => s.trim().toUpperCase());

    // if (!isValidEnum(availSizes)) {
    //   return res.status(400).send({
    //     status: false,
    //     message: "Size can only be S, XS, M, X, L, XXL, XL",
    //   });
    // }

    if (!isValidBody(installments)) {
      return res.status(400).send({
        status: false,
        message: "Please provide installments timeline",
      });
    }
    if (!isValidInstallments(installments)) {
      return res.status(400).send({
        status: false,
        message:
          "please give the number of installmments you would allow buyer to pay in, it cannot be more than 9 times",
      });
    }

    if (isDeleted) {
      return res.status(400).send({
        status: false,
        message: "you cannot delete an uncreated product",
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

module.exports = { validationForProduct };
