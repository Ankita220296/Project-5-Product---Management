const UserModel = require('../models/userModel')
const bcrypt = require ('bcrypt')

const saltRounds = 10;

let password = "password123"

bcrypt.genSalt(saltRounds, function(err, salt) {
  bcrypt.hash(password, salt, function(err, hash) {
  // returns hash
  console.log(hash);
  });
});
  


const registerUser = async function (req, res) {

    try {



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