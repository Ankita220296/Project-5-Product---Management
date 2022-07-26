
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {type: String, required: true,unique:true},
    description:{ type:String, required: true },
    price: {type: Number, required : true },
    currencyId: { type: String, required: true, enum: ["INR"]  },
    currencyFormat:{ type: String, required: true, enum:["₹"]},
    isFreeShipping: {type: Boolean, default:false},
    productImage: {type: String, required: true},
    style:{type:String},
    availableSizes: {type: String, required:true, enum: ["S", "XS","M","X", "L","XXL", "XL"] },
    installments:{type:Number},
    deletedAt:{type:String},
    isDeleted:{type:Boolean, default:false}

    // currencyId: { type: String, uppercase: true, default: "INR", trim: true, required: true },

    // currencyFormat: { type: String, default: "₹", trim: true, required: true },
  },
  { timestamps: true }
);

// {title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes,installments, deletedAt, isDeleted}

module.exports = mongoose.model("Products", productSchema);
//   { 
//     title: {string, mandatory, unique},
//     description: {string, mandatory},
//     price: {number, mandatory, valid number/decimal},
//     currencyId: {string, mandatory, INR},
//     currencyFormat: {string, mandatory, Rupee symbol},
//     isFreeShipping: {boolean, default: false},
//     productImage: {string, mandatory},  // s3 link
//     style: {string},
//     availableSizes: {array of string, at least one size, enum["S", "XS","M","X", "L","XXL", "XL"]},
//     installments: {number},
//     deletedAt: {Date, when the document is deleted}, 
//     isDeleted: {boolean, default: false},
//     createdAt: {timestamp},
//     updatedAt: {timestamp},
//   }