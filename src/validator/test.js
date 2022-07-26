
//         if(!isValid(data.currencyId)){req.status(400).send({status: false, msg: 'please enter CurrencyId'})}
//         if(data.currencyId !== "INR"){req.status(400).send({status: false, msg: 'please enter valid CurrencyId'})}

//         if(!isValid(data.currencyFormat)){req.status(400).send({status: false, msg: 'please enter currencyFormat'})}
//         if(data.currencyFormat !== "₹"){req.status(400).send({status: false, msg: 'please enter valid CurrencyFromat'})}

    //     price: { type: Number, required: true, trim: true },

    // currencyId: { type: String, uppercase: true, default: "INR", trim: true, required: true },

    // currencyFormat: { type: String, default: "₹", trim: true, required: true },