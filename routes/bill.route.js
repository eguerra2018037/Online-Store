'use strict'

var express = require('express');
var billController = require('../controllers/bill.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.get('/createBill/:id', mdAuth.ensureAuthADMIN, billController.createBill);
api.get('/listBills', mdAuth.ensureAuthADMIN, billController.listBills);
api.get('/productsOnBill/:id', mdAuth.ensureAuthADMIN, billController.productsOnBill);
api.delete('/deleteBill/:id', mdAuth.ensureAuthADMIN, billController.deleteBill);

module.exports = api;