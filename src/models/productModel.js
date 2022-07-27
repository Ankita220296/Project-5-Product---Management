const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    currencyId: { type: String, required: true, enum: ["INR"] },
    currencyFormat: { type: String, required: true, enum: ["₹"] },
    isFreeShipping: { type: Boolean, default: false, toLowerCase: true },
    productImage: { type: String, required: true },
    style: { type: String },
    availableSizes: { type: [String], required: true }, //, enum: ["S", "XS","M","X", "L","XXL", "XL"]
    installments: { type: Number },
    deletedAt: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Products", productSchema);
