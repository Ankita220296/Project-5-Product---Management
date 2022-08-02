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
      return res.status(404).send({
        status: true,
        message: "User not found",
      });
    }
    // authorization
    if (req.headers.userId !== user._id.toString())
      return res
        .status(403)
        .send({ status: false, msg: "You are not authorized...." });

    let product = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!product) {
      return res.status(404).send({
        status: false,
        msg: "Product not found",
      });
    }
    let checkCart;
    // if cart id is present in req body
    if (cartId) {
      checkCart = await cartModel.findOne({
        _id: cartId,
        userId: userId,
      });

      if (!checkCart) {
        return res.status(404).send({
          status: false,
          msg: "This cart is not availble",
        });
      }
    } else {
      checkCart = await cartModel.findOne({ userId: userId });
      if (checkCart) {
        cartId = checkCart._id;
      }
    }

    if (checkCart) {
      // to check product is present in cart or not
      let isProductAlready = checkCart.items.filter(
        (x) => x.productId.toString() === productId
      );

      if (isProductAlready.length > 0) {
        const updateQuantity = await cartModel.findOneAndUpdate(
          { userId: userId, "items.productId": productId },
          { $inc: { "items.$.quantity": 1, totalPrice: product.price } },
          { new: true }
        ).populate([{ path: "items.productId" }]);
        return res.status(201).send({
          status: true,
          message: "cart updated",
          data: updateQuantity,
        });
      }

      let cartUpdate = await cartModel.findOneAndUpdate(
        { userId: userId, cartId: cartId },
        {
          $push: { items: [{ productId: productId, quantity: 1 }] },
          $inc: {
            totalPrice: product.price,
            totalItems: 1,
          },
        },
        { new: true }
      ).populate([{ path: "items.productId" }]);

      return res.status(201).send({
        status: true,
        message: "New Product added",
        data: cartUpdate,
      });
    }

    const obj = {
      userId: userId,
      items: [{ productId: productId, quantity: 1 }],
      totalPrice: product.price,
      totalItems: 1,
    };

    const cart = await cartModel.create(obj);
    const newCart = await cartModel.findById(userId).populate([{ path: "items.productId" }]);
    return res
      .status(201)
      .send({ status: true, message: "New Cart Created", data: newCart });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

// .................................. Update Cart .............................//
const updateCart = async function (req, res) {
  try {
    let userId = req.params.userId;
    let data = req.body;

    if (!ObjectId.isValid(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "UserId is not valid" });
    }
    const { productId, cartId, removeProduct } = data;

    if (!ObjectId.isValid(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "ProductId is not valid" });
    }

    let user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send({
        status: true,
        message: "User does not exist",
      });
    }
    // authorization
    if (req.headers.userId !== user._id.toString())
      return res
        .status(403)
        .send({ status: false, msg: "You are not authorized...." });

    let product = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!product) {
      return res.status(404).send({
        status: false,
        msg: "Product not found",
      });
    }

    let cart = await cartModel.findOne({
      userId: userId,
    });
    if (!cart) {
      return res.status(404).send({
        status: false,
        msg: "Cart not found",
      });
    }

    let cartProductUse = cart.items.filter(
      (x) => x.productId.toString() === productId
    );

    if (removeProduct === 0) {
      let cartDetails = await cartModel
        .findOneAndUpdate(
          { _id: cartId, "items.productId": productId },
          {
            $pull: { items: { productId: productId } },
            $inc: {
              totalPrice: -product.price * cartProductUse[0].quantity,
              totalItems: -1,
            },
          },
          { new: true }
        )
        .populate([{ path: "items.productId" }]);
      return res.status(200).send({
        status: true,
        msg: "Cart updated with 0",
        data: cartDetails,
      });
    }

    if (removeProduct === 1) {
      if (cartProductUse.length == 0) {
        return res.status(200).send({
          status: true,
          msg: "This Product is deleted from your cart... Please continue with your favourite products.",
          data: cart,
        });
      }
      if (cartProductUse[0].quantity === 1) {
        let cartDetails = await cartModel
          .findOneAndUpdate(
            { _id: cartId, "items.productId": productId },
            {
              $pull: { items: { productId: productId } },
              $inc: {
                totalPrice: -product.price * cartProductUse[0].quantity,
                totalItems: -1,
              },
            },
            { new: true }
          )
          .populate([{ path: "items.productId" }]);
        return res.status(200).send({
          status: true,
          msg: "Product is removed from cart",
          data: cartDetails,
        });
      }
      if (cartProductUse[0].quantity > 1) {
        let cartDetails = await cartModel
          .findOneAndUpdate(
            { _id: cartId, "items.productId": productId },
            {
              $inc: {
                "items.$.quantity": -1,
                totalPrice: -product.price,
              },
            },
            { new: true }
          )
          .populate([{ path: "items.productId" }]);
        return res.status(200).send({
          status: true,
          msg: "Cart updated",
          data: cartDetails,
        });
      }
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// .................................. Get Cart .............................//
const getCart = async function (req, res) {
  try {
    let userId = req.params.userId;
    if (!ObjectId.isValid(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "UserId is not valid" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send({ status: true, message: "User not found" });
    }

    // authorization
    if (req.headers.userId !== user._id.toString())
      return res
        .status(403)
        .send({ status: false, msg: "You are not authorized...." });

    const cart = await cartModel.findOne({ userId: userId });
    if (!cart) {
      return res.status(404).send({ status: true, message: "Cart not found" });
    }
    return res
      .status(500)
      .send({ status: true, message: "Cart details", data: cart });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

// .................................. Delete Cart .............................//
const deleteCart = async function (req, res) {
  try {
    let userId = req.params.userId;
    if (!ObjectId.isValid(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Userid is not valid" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send({ status: true, message: "User not found" });
    }

    // authorization
    if (req.headers.userId !== user._id.toString())
      return res
        .status(403)
        .send({ status: false, msg: "You are not authorized...." });

    const deleteCart = await cartModel.findOneAndUpdate(
      { userId: userId },
      { items: [], totalItems: 0, totalPrice: 0 },
      { new: true }
    );

    if (!deleteCart) {
      return res.status(404).send({ status: false, msg: "Cart not found" }); // status code
    }

    return res.status(204).send({
      status: true,
      message: "Cart successfully deleted",
      data: deleteCart,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createCart, updateCart, getCart, deleteCart };
