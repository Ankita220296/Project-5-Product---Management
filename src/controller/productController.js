const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const aws = require("aws-sdk");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

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
          "Please upload only image file with extension jpg, png, gif, jpeg",
      });
    }

    let uploadedFileURL = await uploadFile(files[0]);
    data.productImage = uploadedFileURL;


    const productCreation = await productModel.create(data);
    return res
      .status(201)
      .send({ status: true, message: "User created successfully", data: productCreation });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

const getProductbyId = async function (req, res) {
    try {
        let getProductId = req.params.productId;

        if (!mongoose.Types.ObjectId.isValid(getProductId)) {
            return res.status(400).send({ status: false, message: "ProductId is in invalid format." })
        }
        //try to find book from that id
        let findProducts = await productModel.findOne({ _id: getProductId, isDeleted: false }, { deletedAt: 0, __v: 0 });
        if (!findProducts) { return res.status(404).send({ status: false, msg: "product not found" }) }

      
        return res.status(200).send({ status: true, message: "Product list", data: findProducts });
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}
module.exports={createProduct, getProductbyId};