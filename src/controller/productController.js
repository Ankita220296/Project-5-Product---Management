const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const aws = require("aws-sdk");
// const {awsMiddleware,awsMw} = require("../middleware/aws")
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const isValidBody = function (value) {
  if (typeof value === "undefined" || value === "null") return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  // if (typeof value === "number" && value.toString().trim().length === 0)
  //   return false;
  return true;
};

// validation for Product image
function isValidImage(value) {
  const regEx = /.+\.(?:(jpg|gif|png|jpeg|jfif))/; //It will handle all undefined, null, only numbersNaming, dot, space allowed in between
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

// .................................. Create Product .............................//
const createProduct = async function (req, res) {
  try {
    let data = req.body;

    let files = req.files;

    if (files.length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Please Upload the Product Image" });
    } else if (files.length > 1) {
      return res
        .status(400)
        .send({ status: false, message: "Please upload only one image" });
    }

    if (!isValidImage(files[0].originalname)) {
      return res.status(400).send({
        status: false,
        message:
          "Please upload only image file with extension jpg, png, gif, jpeg ,jfif",
      });
    }

    let uploadedFileURL = await uploadFile(files[0]);
    data.productImage = uploadedFileURL;

    const productCreation = await productModel.create(data);
    return res.status(201).send({
      status: true,
      message: "User created successfully",
      data: productCreation,
    });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

// .................................. Get Product by Query Params .............................//
const getProductbyQueryParams = async function (req, res) {
  try {
    let { size, name, priceGreaterThan, priceLessThan } = req.query;
    const obj = { isDeleted: false };

    const availableSizes = size;
    if (availableSizes) {
      let newSize = size.split(" ").map((ele) => ele.trim());
      obj.availableSizes = { $all: newSize };
    }
    if (size != undefined) {
      if (!isValidBody(size)) {
        return res
          .status(200)
          .send({ status: true, message: "Please enter proper size" });
      }
    }

    const title = name;
    if (title) obj.title = name;
    if (name != undefined) {
      if (!isValidBody(name)) {
        return res
          .status(200)
          .send({ status: true, message: "Please enter proper name" });
      }
    }

    let price;
    if (priceGreaterThan && priceLessThan) {
      obj.price = { $gte: priceGreaterThan, $lte: priceLessThan };
    } else if (priceGreaterThan) {
      obj.price = { $gte: priceGreaterThan };
    } else if (priceLessThan) {
      obj.price = { $lte: priceLessThan };
    }

    if (priceGreaterThan != undefined) {
      if (!isValidBody(priceGreaterThan)) {
        return res
          .status(200)
          .send({ status: true, message: "Please enter proper maximum price" });
      }
    }
    if (priceGreaterThan) {
      let priceDetails = await productModel.find(obj).sort({ price: 1 });
      return res
        .status(200)
        .send({ status: true, message: "Product list", data: priceDetails });
    }

    if (priceLessThan != undefined) {
      if (!isValidBody(priceLessThan)) {
        return res
          .status(200)
          .send({ status: true, message: "Please enter proper minimum price" });
      }
    }
    if (priceLessThan) {
      let priceDetails = await productModel.find(obj).sort({ price: -1 });
      return res
        .status(200)
        .send({ status: true, message: "Product list", data: priceDetails });
    }

    let productDetails = await productModel.find(obj);
    if (productDetails) {
      return res
        .status(200)
        .send({ status: true, message: "Product list", data: productDetails });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

// .................................. Get Product by Path Params .............................//
const getProductbyParams = async function (req, res) {
  try {
    let productId = req.params.productId;

    if (!ObjectId.isValid(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "ProductId is in invalid format." });
    }

    //try to find book from that id
    let findProducts = await productModel.findOne(
      { _id: productId, isDeleted: false },
      { deletedAt: 0, __v: 0 }
    );
    if (!findProducts) {
      return res.status(404).send({ status: false, msg: "Product not found" });
    }

    return res
      .status(200)
      .send({ status: true, message: "Product list", data: findProducts });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

// .................................. Update Product .............................//
const updateProduct = async function (req, res) {
  try {
    let productId = req.params.productId;
    let data = req.body;
    if (!ObjectId.isValid(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "UserId is not valid" });
    }
    const {
      title,
      discription,
      price,
      isFreeShipping,
      style,
      availableSizes,
      installments,
    } = data;

    let obj = { isDeleted: false };

    if (title) {
      const existTitle = await productModel.findOne({ title });
      if (existTitle) {
        return res
          .status(400)
          .send({ status: false, message: "This title is already in use" });
      }
      obj.title = title;
    }

    if (discription) obj.discription = discription;

    if (price) obj.price = price;
    if (isFreeShipping) obj.isFreeShipping = isFreeShipping;
    if (style) obj.style = style;
    if (availableSizes) obj.availableSizes = availableSizes;
    if (installments) obj.installments = installments;

    // ... validation for Product Image ... //
    let productImage = req.files;

    if (productImage && productImage.length > 0) {
      if (productImage.length > 1) {
        return res
          .status(400)
          .send({ status: false, message: "Please upload only one image" });
      }
      if (!isValidImage(productImage[0].originalname)) {
        return res.status(400).send({
          status: false,
          message:
            "Please upload only image file with extension jpg, png, gif, jpeg, jfif",
        });
      }
      let uploadedFileURL = await uploadFile(productImage[0]);
      obj.productImage = uploadedFileURL;
    }

    const updateProductDetails = await productModel.findOneAndUpdate(
      { _id: productId },
      obj,
      { new: true }
    );

    if (!updateProductDetails) {
      return res.status(404).send({ status: false, msg: "User not found" }); // status code
    }

    return res.status(200).send({
      status: true,
      message: "Product successfully updated",
      data: updateProductDetails,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createProduct, getProductbyQueryParams, getProductbyParams , updateProduct };
