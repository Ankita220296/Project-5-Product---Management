const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const { checkBodyParams } = require("../validator/userValidation");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// .................................. Create Cart.............................//
const createCart = async function (req, res) {
  try {
    let data = req.body;
    if (!checkBodyParams(data)) {
      return res
        .status(400)
        .send({ status: false, message: "Please input Parameters" });
    }

    let { productId, cartId } = data;
    let userId = req.params.userId;

    if (!ObjectId.isValid(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "UserId is not valid" });
    }

    if (!ObjectId.isValid(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "ProductId is not valid" });
    }

    let user = await userModel.findById(userId);
    if (!user) {
      return res.status(201).send({
        status: true,
        message: "User does not exist",
      });
    }
    // authorization
    if (req.headers.userId !== user._id.toString())
      return res
        .status(403)
        .send({ status: false, msg: "You are not authorized...." });

    let findProduct = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!findProduct) {
      return res.status(400).send({
        status: false,
        msg: "Product not found",
      });
    }

    if (cartId) {
      const checkCart = await cartModel.findOne({
        _id: cartId,
        isDeleted: false,
      });

      if (!checkCart) {
        return res.status(400).send({
          status: false,
          msg: "This cart is not availble",
        });
      }

      // to check product is present in cart or not
      const isProductAlready = checkCart.items.filter(
        (x) => x.productId.toString() === productId
      );

      console.log(checkCart.items);

      // if (productIndex !== -1) {
      //   checkCart.items[productIndex] = {
      //     ...checkCart.items[productIndex],
      //     quantity: checkCart.items[productIndex] + 1,
      //     totalPrice:
      //       checkCart.items[productIndex].totalPrice + findProduct.price,
      //   };
      //   // console.log(checkCart);
      //   const updatedCart = await checkCart.save();
      //   console.log(updatedCart);

      if (isProductAlready.length > 0) {
        const updateQuantity = await cartModel.findOneAndUpdate(
          { userId: userId, "items.productId": productId },
          { $inc: { "items.$.quantity": 1, totalPrice: findProduct.price } },
          { new: true }
        );
        console.log(updateQuantity);
        return res.status(201).send({
          status: true,
          message: "Cart updated",
          data: updateQuantity,
        });
      }
    }

    // checkCart.items.push({ productId: productId, quantity: 1 });
    // checkCart.totalPrice += findProduct.price;

    // const updatedCart = await checkCart.save();

    let cartUpdate = await cartModel.findOneAndUpdate(
      { userId: userId, cartId: cartId },
      {
        $push: { items: { productId: productId, quantity: 1 } },
        $inc: {
          totalPrice: findProduct.price,
          totalItems: 1,
        },
      },
      { new: true }
    );
    return res.status(201).send({
      status: true,
      message: "New Product added",
      data: cartUpdate,
    });
    

    const obj = {
      userId: userId,
      items: [{ productId: productId, quantity: 1 }],
      totalPrice: findProduct.price,
      totalItems: 1,
    };

    const cart = await cartModel.create(obj);
    return res
      .status(201)
      .send({ status: true, message: "New Cart Created", data: cart });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

module.exports = { createCart };
