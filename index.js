'use strict'

var mongoose = require('mongoose');
var port = 3800;
var app = require('./app');
var categoryController = require('./controllers/category.controller');
var adminController = require('./controllers/user.controller');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/DBOnlineStore2018037', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => {
        console.log('Conexión correcta a la base de datos.');
        categoryController.defaultCategory();
        adminController.defaultAdmin();
        app.listen(port, () => {
            console.log('Servidor de express corriendo en el puerto:', port)
        });
    }).catch(err => {
        console.log('Error de conexión.', err);
    });