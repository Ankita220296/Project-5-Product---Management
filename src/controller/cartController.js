const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");

// .................................. Create Cart.............................//
const createCart = async function (req, res) {
  try {
    let data = req.body;
    let {productId,cartId} = data
    let userId = req.params.userId;

    let user = await userModel.findById(userId);
    if (!user) {
      return res.status(201).send({
        status: true,
        message: "User does not exist",
      });
    }
 
      const checkCart=await cartModel.findOne({_id:cartId,isDeleted:false})
      console.log(checkCart)
      if(!checkCart){
        return res.status(400).send({status:false,msg:"This cart is not availble in Database"})
      }
    
    
    let product = await productModel.findOne({
      _id: productId,
      isDeleted:false
    });
  
    totalPrice=checkCart.totalPrice+product.price
    totalItems=checkCart.totalItems+1
    console.log(totalPrice)
    console.log(totalItems)
    let cartUpdate=await cartModel.findOneAndUpdate({cartId},{$push:{items:[{productId:productId,quantity:1}]},totalPrice:totalPrice,totalItems:totalItems},{new:true})
    console.log(cartUpdate)
   

    const obj = {
      userId: userId,
      items: [{ productId: productId, quantity: 1 }],
      totalPrice: totalPrice,
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
