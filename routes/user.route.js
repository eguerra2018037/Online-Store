'use strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.post('/saveUser', mdAuth.ensureAuthADMIN, userController.saveUser);
api.put('/editProfile/:id', mdAuth.ensureAuth, userController.editProfile);
api.post('/signUp', userController.signUp);
api.post('/login', userController.login);
api.post('/addToCar/:id', mdAuth.ensureAuth, userController.addToCar);
api.get('/buy/:id', mdAuth.ensureAuth, userController.buy);
api.delete('/deleteAccount/:id', mdAuth.ensureAuth, userController.deleteUser);
api.post('/removeFromCar/:id', mdAuth.ensureAuth, userController.removeFromCar);
api.get('/myBuys/:id', mdAuth.ensureAuth, userController.myBuys);
api.put('/deleteBill/:id/:idB',mdAuth.ensureAuth, userController.deleteBill);

module.exports = api;