'use strict'

var Bill = require('../models/bill.model');
var User = require('../models/user.model');
var Product = require('../models/product.model');

function createBill(req, res) {
    var userId = req.params.id;
    var bill = new Bill();
    var user = new User();

    User.findById(userId, (err, exists) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (exists) {
            if (exists.shoppingCar.products.length != 0) {
                bill.clientNIT = exists.nit;
                bill.clientName = exists.name;
                bill.clientLastname = exists.lastname;
                bill.date = new Date();
                bill.detail = exists.shoppingCar

                bill.save((err, saved) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (saved) {

                        exists.shoppingCar.products.forEach(product => {
                            Product.findOne({ name: product.name, brand: product.brand }, (err, found) => {
                                if (err) {
                                    console.log('Error interno del servidor', err);
                                } else if (found) {
                                    Product.findByIdAndUpdate(found._id, { quantity: found.quantity - product.quantity, sales: found.sales + product.quantity }, (err, ok) => {
                                        if (err) {
                                            console.log('Error interno del servidor', err);
                                        } else if (ok) {
                                            console.log('Stock actualizado');
                                        } else {
                                            console.log('Error al limpiar el carrito.');
                                        }
                                    })
                                } else {
                                    console.log('Error al actualizar stock principal.');
                                }
                            })
                        });

                        User.findByIdAndUpdate(userId, { $push: { bills: saved._id }, shoppingCar: user.shoppingCar }, { new: true }, (err, updated) => {
                            if (err) {
                                res.status(500).send({ error: 'Error interno del servidor', err });
                            } else if (updated) {
                                res.send({ 'Factura generada': saved });
                            } else {
                                res.status(400).send({ message: 'Error al limpiar el carrito.' });
                            }
                        });
                    } else {
                        res.status(400).send({ message: 'Error al generar factura.' });
                    }
                });
            } else {
                res.status(400).send({ message: 'El carrito de compras está vacío' })
            }
        } else {
            res.status(404).send({ message: 'Usuario no encontrado' });
        }
    });
}

function listBills(req, res) {
    Bill.find({}, (err, bills) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (bills) {
            res.send({ 'Facturas registradas': bills });
        } else {
            res.status(404).send({ message: 'No hay datos para mostrar.' });
        }
    });
}

function productsOnBill(req, res) {
    var billId = req.params.id;

    Bill.findById(billId, (err, products) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (products) {
            res.send({ 'Productos en factura': products.detail.products });
        } else {
            res.status(404).send({ message: 'No hay datos para mostrar.' });
        }
    }).select('-detail.products._id');
}

function deleteBill(req, res) {
    var billId = req.params.id;

    Bill.findByIdAndDelete(billId, (err, deleted) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (deleted) {
            User.findOneAndUpdate({ bills: deleted._id }, { $pull: { bills: deleted._id } }, (err, userUpdated) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (userUpdated) {
                    res.send({ message: 'Factura eliminada correctamente.' });
                } else {
                    res.status(404).send({ message: 'Error al actualizar datos de Usuario.' });
                }
            })
        } else {
            res.status(404).send({ message: 'No se pudo eliminar la factura.' });
        }
    })
}

module.exports = {
    createBill,
    listBills,
    productsOnBill,
    deleteBill
}