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
      console.log(productId);
      if (isProductAlready.length > 0) {
        const updateQuantity = await cartModel.findOneAndUpdate(
          { userId: userId, "items.productId": productId },
          { $inc: { "items.$.quantity": 1, totalPrice: findProduct.price } },
          { new: true }
        );
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
    }

    const obj = {
      userId: userId,
      items: [{ productId: productId, quantity: 1 }],
      totalPrice: findProduct.price,
      totalItems: 1,
    };

    const cart = await cartModel.create(obj);
    console.log(cart);
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

// const createNewCart = async function (req, res) {
//   try {
//     let userId = req.params.userId;
//     const items = req.body.items;

//     let finalCart = { items: [], totalItems: 0, totalPrice: 0 };

//     for (let i = 0; i < items.length; i++) {
//       const { productId, quantity } = items[i];
//       const product = {};

//       const findProduct = await productModel.findOne({
//         _id: productId,
//         isDeleted: false,
//       });
//       product.productId = productId;
//       product.quantity = Math.floor(quantity);

//       finalCart.items.push(product);
//       finalCart.totalItems += product.quantity;
//       finalCart.totalPrice += product.quantity * findProduct.price;
//     }

//     finalCart.userId = userId;
//     let findCart = await cartModel.findOne({ userId: userId });
//     if (!findCart) {
//       findCart = await cartModel.create(finalCart);
//       return res
//         .status(201)
//         .send({ status: true, message: "Success", data: finalCart });
//     } else {
//       findCart.totalItems += finalCart.totalItems;
//       findCart.totalPrice += finalCart.totalPrice;
//       findCart.items = [...findCart.items, ...finalCart.items];

//       const cart = await cartModel.findOneAndUpdate(
//         { _id: findCart.id },
//         findCart,
//         {
//           new: true,
//         }
//       );

//       return res
//         .status(200)
//         .send({ status: true, message: "Cart is Updated", data: cart });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ status: false, error: error.message });
//   }
// };
