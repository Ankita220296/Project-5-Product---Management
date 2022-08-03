const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// .................................. Create Order .............................//
const createOrder = async function (req, res) {
  try {
    let userId = req.params.userId;
    let data = req.body;

    if (!ObjectId.isValid(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "UserId is not valid" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send({ status: true, message: "User not found" });
    }

    const cart = await cartModel.findOne({ _id: data.cartId });

    let totalQuantity = cart.items.map((x) => x.quantity);
    const sumOfQuantity = totalQuantity.reduce(
      (previousValue, currentValue) => previousValue + currentValue,
      0
    );

    const obj = {
      cart,
      totalQuantity: sumOfQuantity,
    };
    console.log(obj);
    console.log(obj.cart);


    const order = await orderModel.create(obj)
    console.log(order)
    return res
      .status(201)
      .send({ status: true, message: "Success", data: order });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

module.exports = { createOrder };
