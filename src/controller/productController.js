const productModel = require('../models/productModel');
const { uploadFile } = require("../aws/aws");
const { isValid, isValidRequestBody, isValidObjectId, isValidPrice, isValidEnum } = require("../validator/validation");

//////////                  CreateProduct                   ///////////

const createProducts = async (req, res) => {
    try {

        let data = req.body;

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "No data provided" });
        }

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        if (!isValid(title))
            return res.status(400).send({ status: false, message: "title name is required." });

        let duplicateTitle = await productModel.findOne({ title });
        if (duplicateTitle) {
            return res.status(400).send({ status: false, msg: "title already exist" });
        }

        if (!isValid(description))
            return res.status(400).send({ status: false, message: "description is required." });

        if (!isValid(price))
            return res.status(400).send({ status: false, message: "price is required." });

        if (!isValidPrice.test(price))
            return res.status(400).send({ status: false, message: "not a valid number/decimal" });

        if (currencyId && currencyId !== "INR")
            return res.status(400).send({ status: false, message: "enter INR currency only" });

        if (currencyFormat && currencyFormat !== "₹")
            return res.status(400).send({ status: false, message: "enter indian currency format i.e '₹' " });

        let files = req.files;

        if (!isValidRequestBody(files)) {
            return res.status(400).send({ status: false, message: "Upload a image." });
        }

        if (files && files.length > 0) {
            awsUrl = await uploadFile(files[0]);
            data['productImage'] = awsUrl
        }

        if (!isValid(availableSizes))
            return res.status(400).send({ status: false, message: "avilableSizes is required" })

        const availSizes = availableSizes.split(',').map(s => s.trim().toUpperCase())

        if (!isValidEnum(availSizes))
            return res.status(400).send({ status: false, message: `only allow S, XS, M, X, L, XXL, XL` })

        if (installments) {
            if (isNaN(installments)) return res.status(400).send({ status: false, message: "installments should be number only" })
        }

        const newData = { ...data, availableSizes: availSizes };
        let createdproduct = await productModel.create(newData)
        res.status(201).send({ satus: true, message: "product create successfully", data: createdproduct })


    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

//////////                  GetProductbyFilter                   ///////////

const getProductByFilter = async function (req, res) {
    try {
        let data = req.query;

        const filterquery = { isDeleted: false };

        const { name, size, priceGreaterThan, priceLessThan } = data;

        if (name) {
            if (!isValid(name)) return res.status(400).send({ status: false, message: "provide a name" });

            const regexName = new RegExp(name, "i");
            filterquery.title = { $regex: regexName };
        }

        if (size) {
            if (!isValid(size)) return res.status(400).send({ status: false, message: "provide size" });

            const availSizes = size.split(',').map(s => s.trim().toUpperCase())
            filterquery.availableSizes = { $all: availSizes };
        }


        if (priceGreaterThan && !isValid(priceGreaterThan))
            return res.status(400).send({ status: false, message: "provide price" });

        if (!priceLessThan && isValid(priceLessThan))
            return res.status(400).send({ status: false, message: "provide price" });


        if (priceGreaterThan && priceLessThan) {
            filterquery.price = { $gte: priceGreaterThan, $lte: priceLessThan }
        }
        else if (priceGreaterThan) {
            filterquery.price = { $gte: priceGreaterThan }
        }
        else if (priceLessThan) {
            filterquery.price = { $lte: priceLessThan }
        }

        let searchProducts;

        if (priceGreaterThan) {

            searchProducts = await productModel.find(filterquery).sort({ price: 1 })
            return res.status(200).send({ status: true, msg: "price,higher to lower", data: searchProducts })

        }

        if (priceLessThan) {
            searchProducts = await productModel.find(filterquery).sort({ price: -1 })
            return res.status(200).send({ status: true, msg: "price lower to higher", data: searchProducts })
        }

        let result = await productModel.find(filterquery)

        if (result.length === 0) {
            return res.status(404).send({ status: false, msg: "No product found" });
        }

        res.status(200).send({ status: true, msg: "sucess", data: result });
    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};


const updateProductById = async (req, res) => {
    try {

        let productId = req.params.productId;

        let productData = req.body;

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid product id" })
        }

        if (productData) {
            if (!isValidRequestBody(productData)) return res.status(400).send({ status: false, message: "No data provided" });
        }

        let existProductId = await productModel.findById({ _id: productId })
        if (!existProductId) {
            return res.status(404).send({ status: false, message: "Product Id dosen't exists." });
        }

        if (existProductId.isDeleted === true) {
            return res.status(400).send({ status: false, message: "Product is deleted." });
        }

        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage } = productData;

        let updateProduct = { isDeleted: false };

        if (title) {
            if (!isValid(title)) {
                return res.status(400).send({ status: false, message: "Enter some data" });
            }

            let existTitle = await productModel.findOne({ title });
            if (existTitle) {
                return res.status(400).send({ status: false, message: "Title already exists" });
            }

            updateProduct["title"] = title;
        }

        if (description) {
            if (!isValid(description)) {
                return res.status(400).send({ status: false, message: "Enter some data" });
            }
            updateProduct["description"] = description;
        }

        if (price) {
            if (!isValid(price)) {
                return res.status(400).send({ status: false, message: "Enter some data" });
            }
            updateProduct["price"] = price;
        }

        if (currencyId) {
            if (!isValid(currencyId)) {
                return res.status(400).send({ status: false, message: "Enter some data" });
            }
            updateProduct["currencyId"] = currencyId;
        }

        if (currencyFormat) {
            if (!isValid(currencyFormat)) {
                return res.status(400).send({ status: false, message: "Enter some data" });
            }
            updateProduct["currencyFormat"] = currencyFormat;
        }

        if (isFreeShipping) {
            if (!isValid(isFreeShipping)) {
                return res.status(400).send({ status: false, message: "Enter some data" });
            }
            updateProduct["isFreeShipping"] = isFreeShipping;
        }

        if (style) {
            if (!isValid(style)) {
                return res.status(400).send({ status: false, message: "Enter some data" });
            }
            updateProduct["style"] = style;
        }

        if (availableSizes) {
            if (!isValid(availableSizes)) {
                return res.status(400).send({ status: false, message: "Enter some data" });
            }

            const availSizes = availableSizes.split(',').map(s => s.trim().toUpperCase())

            if (!isValidEnum(availSizes))
                return res.status(400).send({ status: false, message: `only allow S, XS, M, X, L, XXL, XL` })

            updateProduct["availableSizes"] = availSizes;
        }
        
        if (installments) {
            if (!isValid(installments)) {
                return res.status(400).send({ status: false, message: "Enter some data" });
            }

            updateProduct["availableSizes"] = installments;
        }

        if (productImage) {
            if (files && files.length > 0) {
                productUrl = await uploadFile(files[0]);
            }
            productData["productImage"] = productUrl;
        }


        let result = await productModel.findByIdAndUpdate(productId, updateProduct, { new: true });

        res.status(200).send({ status: true, message: "Product Update Successfully", data: result });

    } catch (error) {
        res.status(500).send({ status: false, error: error.message });

    }
}

const deleteProductById = async (req, res) => {
    try {

        let productId = req.params.productId;

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid product id" })
        }

        let existProductId = await productModel.findById({ _id: productId })
        if (!existProductId) {
            return res.status(404).send({ status: false, message: "Product Id dosen't exists." });
        }

        if (existProductId.isDeleted === true) {
            return res.status(400).send({ status: false, message: "Product already deleted." });
        }

        let deleteProduct = await productModel.findByIdAndUpdate(productId, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true });

        res.status(200).send({ status: true, message: "Product Successfully Deleted.", data: deleteProduct })


    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
}







module.exports = { createProducts, getProductByFilter, updateProductById, deleteProductById }