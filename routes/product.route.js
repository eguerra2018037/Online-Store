'use strict'

var express = require('express');
var productController = require('../controllers/product.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/saveProduct', mdAuth.ensureAuthADMIN, productController.saveProduct);
api.post('/saveProduct/:idC', mdAuth.ensureAuthADMIN, productController.saveProduct);
api.get('/listProducts', mdAuth.ensureAuthADMIN, productController.listProducts);
api.put('/editProduct/:id', mdAuth.ensureAuthADMIN, productController.editProduct);
api.get('/productStock/:id', mdAuth.ensureAuthADMIN, productController.productStock);
api.delete('/deleteProduct/:id', mdAuth.ensureAuthADMIN, productController.deleteProduct);
api.get('/asignToCategory/:id/:idC', mdAuth.ensureAuthADMIN, productController.asignToCategory);
api.get('/bestSellers', mdAuth.ensureAuth, productController.bestSellers);
api.post('/searchProduct', mdAuth.ensureAuth, productController.searchProduct);
api.get('/outOfStock', mdAuth.ensureAuthADMIN, productController.outOfStock);

module.exports = api;