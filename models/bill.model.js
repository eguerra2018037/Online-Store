'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var billSchema = Schema({
    clientNIT: Number,
    clientName: String,
    clientLastname: String,
    date: Date,
    detail: {
        products: [{
            name: String,
            brand: String,
            price: Number,
            quantity: Number,
            subTotal: Number
        }],
        total: Number
    },
});

module.exports = mongoose.model('bill', billSchema);