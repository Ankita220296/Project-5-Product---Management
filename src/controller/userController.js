const UserModel = require('../models/userModel')
const bcrypt = require ('bcrypt')

const saltRounds = 10;

let password = "password123"





const registerUser = async function (req, res) {

    try {
        

        const hash= await bcrypt.hash(password, saltRounds)
        // returns hash
        console.log(hash)
      


    } catch (err) {
        res.status(500).send({
            status:false,
            message: err.message
        })
    }
}

module.exports = {
    registerUser
}