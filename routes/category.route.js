'use strict'

var express = require('express');
var categoryController = require('../controllers/category.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/saveCategory', mdAuth.ensureAuthADMIN, categoryController.saveCategory);
api.get('/listCategories', mdAuth.ensureAuth, categoryController.listCategories);
api.put('/editCategory/:idC', mdAuth.ensureAuthADMIN, categoryController.editCategory);
api.delete('/deleteCategory/:idC', mdAuth.ensureAuthADMIN, categoryController.deleteCategory);
api.post('/searchCategory', mdAuth.ensureAuth, categoryController.searchCategory);

module.exports = api;