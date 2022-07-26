const productModel = require("../models/productModel");

// Validataion for empty request body
const checkBodyParams = function (value) {
    if (Object.keys(value).length === 0) return false;
    else return true;
};

const isValidBody = function (value) {
    if (typeof value === "undefined" || value === "null") return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    // if (typeof value === "number" && value.toString().trim().length === 0)
    //   return false;
    return true;
};

const isValidEmail = function (email) {
    let checkemail = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
    if (checkemail.test(email)) {
        return true;
    }
    return false;
};

const isValidPrice = function (x) {
    let checkPrice = /^\s*[0-9\.]{1,7}$/;
    if (checkPrice.test(x)) {
        return true;
    }
    return false;
};


const isValidPassword = function (password) {
    const re =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,15}$/; //for password space not allowed, also handles !password
    return re.test(password);
};

// Validation for length of characters
const lengthOfCharacter = function (value) {
    if (!/^\s*(?=[a-zA-Z])[\w\.\s]{3,25}\s*$/.test(value)) return false;
    else return true;
};

const descriptionLength = function (value) {
    if (!/^\s*(?=[a-zA-Z])[\w\.\s]{3,1000}\s*$/.test(value)) return false;
    else return true;
};
// ....................................... Validation for User .................................//
const validationForProduct = async function (req, res, next) {
    try {
        let data = req.body;
        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, isDeleted } = data;

        if (!checkBodyParams(data)) {
            return res
                .status(400)
                .send({ status: false, message: "Please input Parameters" });
        }
        if (!isValidBody(title)) {
            return res.status(400).send({
                status: false,
                message: "Please provide first name , eg.Ankita",
            });
        }
        if (!lengthOfCharacter(title)) {
            return res.status(400).send({
                status: false,
                message: "Please provide first name with right format",
            });
        }
        const existTitle = await productModel.findOne({ title });
        if (existTitle) {
            return res
                .status(400)
                .send({ status: false, message: "This title is already in use" });
        }

        if (!isValidBody(description)) {
            return res.status(400).send({
                status: false,
                message: "Please provide last name , eg.Sangani",
            });
        }
        if (!descriptionLength(description)) {
            return res.status(400).send({
                status: false,
                message: "Please provide last name with right format",
            });
        }

        if (!isValidBody(price)) {
            return res
                .status(400)
                .send({ status: false, message: "Please enter Price" });
        }

        if (!isValidPrice(price)) {
            return res
                .status(400)
                .send({ status: false, message: "Please enter Price in correct form, eg: 500, 476.50" });
        }

        function isAvailableCurrency(x) {  
            if(x){x = x.trim()}; //trimming of the title before test
            if (x !== "INR") { return false };
            return true
        }

        if (!isValidBody(currencyId)) {
            return res
                .status(400)
                .send({ status: false, message: "Please enter currency" });
        }

        if (!isAvailableCurrency(currencyId)) {
            return res.status(400).send({
                status: false,
                message: "currency can only be in 'INR' ",
            });
        }
        function isCurrencyFormat(x) {  
            if(x){x = x.trim()}; //trimming of the title before test
            if (x !== "₹") { return false };
            return true
        }
        if (!isValidBody(currencyFormat)) {
            return res
                .status(400)
                .send({ status: false, message: "Please enter currency format, eg: '₹' " });
        }

        if (!isCurrencyFormat(currencyFormat)) {
            return res.status(400).send({
                status: false,
                message: "currency format can only be in '₹' ",
            });
        }
        if (!isFreeShipping) {
            return res.status(400).send({
                status: false,
                message: "Please enter isFreeShipping key",
            });
        }

        if (!isValidBody(isFreeShipping)) {
            return res.status(400).send({
                status: false,
                message: "Please inform is it free shipping or paid shipping, eg: True or False",
            });
        }
        // if(isFreeShipping){
        //  ₹   if(typeof isFreeShipping !== "boolean"){return res.status(400).send({status:false, error: "isFreeShipping can only be true or false"})}
        // }

        if (!isValidBody(style) && !lengthOfCharacter(style)) {
            return res.status(400).send({
                status: false,
                message: "Please mention the style of the product",
            });
        }
        function isAvailableSizes(x) {  
            if(x){x = x.trim()}; //trimming of the title before test
            if (x !== "S" && x !== "XS" && x !== "M" && x !== "X" && x !== "L" && x !== "XXL" && x !== "XL") { return false };
            return true
        }
        if (!availableSizes) {
            return res.status(400).send({
                status: false,
                message: "Please enter sizes of the product",
            });
        }
  
        if (!isAvailableSizes(availableSizes)) {
            return res.status(400).send({
                status: false,
                message: "size can only be S, XS, M, X, L, XXL, XL ",
            });
        }
        const isValidInstallments = function (x) {
            let checkIns = /^[0-9]{1,3}$/;
            if (checkIns.test(x)) {
                return true;
            }
            return false;
        };

        if (!isValidBody(installments)) {
            return res.status(400).send({
                status: false,
                message: "In how many installments the buyer can pay for the product",
            });
        }
        if (!isValidInstallments(installments)) {
            return res.status(400).send({
                status: false,
                message: "please give the number of installmments you would allow buyer to pay in, it cannot be more than 999 days",
            });
        }
if(isDeleted){
    return res.status(400).send({
                status: false,
                message: "you cannot delete an uncreated product",})
}


    } catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message,
        });
    }
    next();
};

module.exports = { validationForProduct }