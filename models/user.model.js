'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = Schema({
    nit: Number,
    username: String,
    email: String,
    password: String,
    name: String,
    lastname: String,
    role: String,
    bills: [{ type: Schema.Types.ObjectId, ref: 'bill' }],
    shoppingCar: {
        products: [{
            _id: String,
            name: String,
            brand: String,
            price: Number,
            quantity: Number,
            subTotal: Number
        }],
        total: Number
    }
});

module.exports = mongoose.model('user', userSchema);