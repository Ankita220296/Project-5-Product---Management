const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const productController = require("../controller/productController");
const validation = require("../validator/validation");
const productValidation = require("../validator/productValidator");
const auth = require("../middleware/auth");

// test
router.get("/test", function (req, res) {
  res.send("My first api for checking the terminal");
});

router.post(
  "/register",
  validation.validationForUser,
  userController.registerUser
);

router.post(
  "/login",
  validation.validationForLoginUser,
  userController.loginUser
);

router.get(
  "/user/:userId/profile",
  auth.Authentication,
  userController.getUser
);

router.put(
  "/user/:userId/profile",
  auth.Authentication,
  validation.validationForUpdateUser,
  userController.updateUser
);
router.get(
  "/products/:productId",
  productController.getProductbyId
);


router.post(
  "/products",
  productValidation.validationForProduct,
  productController.createProduct
);
router.all("/**", function (req, res) {
  res.status(404).send({
    status: false,
    msg: "The api you request is not available",
  });
});

module.exports = router;
