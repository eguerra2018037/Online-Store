'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var productSchema = Schema({
    name: String,
    brand: String,
    model: String,
    price: Number,
    quantity: Number,
    sales: Number,
    subTotal: Number
});

module.exports = mongoose.model('product', productSchema);