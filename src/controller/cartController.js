const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");

// .................................. Create Cart.............................//
const createCart = async function (req, res) {
  try {
    let data = req.body;

    let items = data;
    let productId = items[0].productId;
    let quantity = items[0].quantity;
    let userId = req.params.userId;

    let user = await userModel.findById(userId);
    if (!user) {
      return res.status(201).send({
        status: true,
        message: "User does not exist",
      });
    }
    
    let newCart = {items : [],totalPrice : 0,totalItems:0}
    for(let i = 0 ; i < items.length ; i++){
        const {productId, quantity} = items[i]
    }

    let newObj = {}
    let product = await productModel.findOne({
      _id: productId,
      isDeleted:false
    });

    obj.productId = productId
    newCart.items.push(newObj)
    totalItems = totalItems + newObj.quantity
    totalPrice = newObj.quantity * product.price
    
    // if (!product) {
    //   return res.status(201).send({
    //     status: true,
    //     message: "Product does not exist",
    //   });
    // }

    const obj = {
      userId: userId,
      items: [{ productId: productId, quantity: 1 }],
      totalPrice: price,
      totalItems: 1,
    };

    const cart = await cartModel.create(obj);
    return res
      .status(201)
      .send({ status: true, message: "User created successfully", data: cart });
  } catch (error) {
    return res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

module.exports = { createCart };
