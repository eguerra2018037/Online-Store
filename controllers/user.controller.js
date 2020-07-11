'use strict'

var User = require('../models/user.model');
var bcrypt = require('bcrypt-nodejs');
var Product = require('../models/product.model');
var Bill = require('../models/bill.model');
var jwt = require('../services/jwt');
var moment = require('moment');

function defaultAdmin(req, res) {
    var user = new User();

    User.findOne({ name: 'admin' }, (err, found) => {
        if (err) {
            console.log('Error interno del servidor', err);
        } else if (found) {
            console.log('Administrador por defecto ya definido.');
        } else {
            user.nit = 0;
            user.username = 'admin';
            user.email = 'admin';
            user.name = 'admin';
            user.lastname = 'admin';
            user.role = 'ADMIN';

            bcrypt.hash('admin', null, null, (err, paswordHashed) => {
                if (err) {
                    console.log('Error interno del servidor', err);
                } else if (paswordHashed) {
                    user.password = paswordHashed;

                    user.save((err, saved) => {
                        if (err) {
                            console.log('Error interno del servidor', err);
                        } else if (saved) {
                            console.log('Administrador por defecto definido');
                        } else {
                            console.log('El administrador por defecto no ha sido definido');
                        }
                    });
                } else {
                    console.log('Error al encriptar contraseña.');
                }
            });
        }
    });
}

function saveUser(req, res) {
    var user = new User;
    var params = req.body;

    if (params.nit && params.username && params.email && params.password && params.name && params.lastname && params.role) {
        User.find({ $or: [{ nit: params.nit }, { username: params.username }, { email: params.email }] }, (err, found) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (found != '') {
                res.status(202).send({ message: 'El número de nit, nombre de usuario o correo electrónico ya están en uso.' });
            } else {
                user.nit = params.nit;
                user.username = params.username;
                user.email = params.email;
                user.name = params.name;
                user.lastname = params.lastname;
                user.role = (params.role).toUpperCase();

                bcrypt.hash(params.password, null, null, (err, paswordHashed) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (paswordHashed) {
                        user.password = paswordHashed;

                        user.save((err, saved) => {
                            if (err) {
                                res.status(500).send({ error: 'Error interno del servidor', err });
                            } else if (saved) {
                                res.send({ 'Usuario registrado': saved });
                            } else {
                                res.status(400).send({ message: 'Usuario no registrado' });
                            }
                        });
                    } else {
                        res.status(400).send({ message: 'Error al encriptar contraseña.' });
                    }
                });
            }
        });
    } else {
        res.status(400).send({ message: 'Debe ingresar todos los datos requeridos.' });
    }
}

function signUp(req, res) {
    var user = new User;
    var params = req.body;

    if (params.nit && params.username && params.email && params.password && params.name && params.lastname) {
        User.find({ $or: [{ nit: params.nit }, { username: params.username }, { email: params.email }] }, (err, found) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (found != '') {
                res.status(202).send({ message: 'El número de nit, nombre de usuario o correo electrónico ya están en uso.' });
            } else {
                user.nit = params.nit;
                user.username = params.username;
                user.email = params.email;
                user.name = params.name;
                user.lastname = params.lastname;
                user.role = 'CLIENT';

                bcrypt.hash(params.password, null, null, (err, paswordHashed) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (paswordHashed) {
                        user.password = paswordHashed;

                        user.save((err, saved) => {
                            if (err) {
                                res.status(500).send({ error: 'Error interno del servidor', err });
                            } else if (saved) {
                                res.send({ 'Usuario registrado': saved });
                            } else {
                                res.status(400).send({ message: 'Usuario no registrado' });
                            }
                        });
                    } else {
                        res.status(400).send({ message: 'Error al encriptar contraseña.' });
                    }
                });
            }
        });
    } else {
        res.status(400).send({ message: 'Debe ingresar todos los datos requeridos.' });
    }
}

function login(req, res) {
    var params = req.body;

    if (params.username || params.email) {
        if (params.password) {
            User.findOne({ $or: [{ username: params.username }, { email: params.email }] }, (err, found) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (found) {
                    bcrypt.compare(params.password, found.password, (err, accepted) => {
                        if (err) {
                            res.status(500).send({ error: 'Error interno del servidor', err });
                        } else if (accepted) {
                            if (params.gettoken = true) {
                                res.send({ token: jwt.createToken(found) });
                            } else {
                                res.send({ 'Bienvenido': found.username, 'Compras realizadas': found.bills });
                            }
                        } else {
                            res.status(400).send({ message: 'Contraseña incorrecta' });
                        }
                    });
                } else {
                    res.status(400).send({ message: 'Nombre de usuario o correo electrónico incorrecto.' });
                }
            }).populate({ path: 'bills', select: '-detail.products._id -_id -clientNIT -clientName -clientLastname -__v' });
        } else {
            res.status(400).send({ message: 'Ingrese su contraseña' });
        }
    } else {
        res.status(400).send({ message: 'Ingrese su correo electrónico o nombre de usuario.' });
    }
}

function editProfile(req, res) {
    var userId = req.params.id;
    var actualizar = req.body;

    if (req.user.sub != userId) {
        res.status(403).send({ message: 'No tiene permitido realizar esta acción.' });
    } else {
        if (actualizar.password) {
            bcrypt.hash(actualizar.password, null, null, (err, passwordHashed) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (passwordHashed) {
                    actualizar.password = passwordHashed;
                } else {
                    res.status(400).send({ message: 'Contraseña no encriptada.' });
                }
            });
        }

        if (actualizar.role) {
            res.status(400).send({ message: 'No tiene permitido realizar esta acción.' });
        } else {
            User.findOne({ _id: { $ne: userId }, $or: [{ nit: actualizar.nit }, { username: actualizar.username }, { email: actualizar.email }] }, (err, found) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (found) {
                    res.status(400).send({ message: 'El número de nit, nombre de usuario o correo electrónico ya están en uso.' });
                } else {
                    User.findByIdAndUpdate(userId, actualizar, { new: true }, (err, updated) => {
                        if (err) {
                            res.status(500).send({ error: 'Error interno del servidor', err });
                        } else if (updated) {
                            res.send({ 'Datos actualizados': updated });
                        } else {
                            res.status(400).send({ message: 'Datos no actualizados.' });
                        }
                    });
                }
            });
        }
    }
}

function deleteUser(req, res) {
    var userId = req.params.id;

    if (req.user.sub != userId) {
        res.status(403).send({ message: 'No tiene permitido realizar esta acción.' });
    } else {
        User.findByIdAndDelete(userId, (err, deleted) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (deleted) {
                res.send({ message: 'Registro eliminado correctamente' });
            } else {
                res.status(400).send({ message: 'No ha sido posible eliminar el registro' });
            }
        });
    }
}

function addToCar(req, res) {
    var userId = req.params.id;
    var params = req.body;
    var product = new Product();
    var total;

    if (req.user.sub != userId) {
        res.status(403).send({ message: 'No tiene permitido realizar esta acción.' });
    } else {
        if (params.product && params.quantity) {

            if(params.quantity<=0){
                res.status(400).send({message:'Debe ingresar una cantidad válida.'});
            }else{
                User.findById(userId, (err, exists) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (exists) {
                        if (exists.shoppingCar.total >= 0) {
                            total = exists.shoppingCar.total;
                        } else {
                            total = 0;
                        }
                        Product.findById(params.product, (err, found) => {
                            if (err) {
                                res.status(500).send({ error: 'Error interno del servidor', err });
                            } else if (found.quantity >= params.quantity) {
                                product._id = found._id;
                                product.name = found.name;
                                product.brand = found.brand;
                                product.price = found.price;
                                product.quantity = params.quantity;
                                product.subTotal = parseFloat(product.price) * parseFloat(product.quantity);
                                total = total + parseFloat(product.subTotal);
    
                                User.findOne({ _id: userId, 'shoppingCar.products': { $elemMatch: { name: product.name, brand: product.brand } } }, (err, found) => {
                                    if (err) {
                                        res.status(500).send({ error: 'Error interno del servidor', err });
                                    } else if (found) {
                                        res.send({ 'Producto ya agregado en el carrito': found.shoppingCar });
                                    } else {
                                        User.findOneAndUpdate({ _id: userId }, { $push: { 'shoppingCar.products': product }, 'shoppingCar.total': total }, { new: true }, (err, added) => {
                                            if (err) {
                                                res.status(500).send({ error: 'Error interno del servidor', err });
                                            } else if (added) {
                                                res.send({ 'Añadido al carrito.': added.shoppingCar });
                                            } else {
                                                res.status(400).send({ message: 'No ha sido posible añadir el producto' });
                                            }
                                        });
                                    }
                                });
                            } else if (found.quantity == 0) {
                                res.status(400).send({ message: 'Producto sin existencias.' });
                            } else if (found.quantity < params.quantity) {
                                res.status(400).send({ message: 'Cantidad requerida mayor a existencias.', 'Cantidad disponible': found.quantity });
                            }
                        });
                    } else {
                        res.status(404).send({ message: 'Usuario no encontrado.' });
                    }
                });
            }
        } else {
            res.status(400).send({ message: 'Debe ingresar un producto y la cantidad deseada.' });
        }
    }
}

function buy(req, res) {
    var userId = req.params.id;
    var bill = new Bill();
    var user = new User();
    var sales;

    if (req.user.sub != userId) {
        res.status(403).send({ message: 'No tiene permitido realizar esta acción.' });
    } else {
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
                                        if (found.sales >= 0)
                                            sales = found.sales;
                                        else
                                            sales = 0;

                                        Product.findByIdAndUpdate(found._id, { quantity: (found.quantity - product.quantity), sales: (sales + product.quantity) }, (err, ok) => {
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
}

function removeFromCar(req, res) {
    var userId = req.params.id;
    var params = req.body;
    var product = new Product();
    var total;

    if (req.user.sub != userId) {
        res.status(403).send({ message: 'No tiene permitido realizar esta acción.' });
    } else {
        if (params.product && params.quantity) {

            if(params.quantity<0){
                res.status(400).send({message:'Debe ingresar una cantidad válida.'});
            }else{
                User.findOne({ _id: userId, 'shoppingCar.products': { $elemMatch: { _id: params.product } } }, (err, found) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (found) {
                        total = found.shoppingCar.total;
                        found.shoppingCar.products.some(element => {
                            if (element._id == params.product) {
                                product = element;
                                return true;
                            } else {
                                return false;
                            }
                        });
    
                        if (params.quantity > product.quantity) {
                            res.status(400).send({ message: 'La cantidad a remover es mayor a la cantidad existente en el carrito.' });
                        } else {
                            product.quantity -= parseInt(params.quantity);
                            product.subTotal -= parseInt(params.quantity) * parseFloat(product.price);
                            total -= (parseInt(params.quantity) * parseFloat(product.price));
    
                            User.findByIdAndUpdate(userId, { $pull: { 'shoppingCar.products': { _id: params.product } }, 'shoppingCar.total': total }, { new: true }, (err, updated) => {
                                if (err) {
                                    res.status(500).send({ error: 'Error interno del servidor', err });
                                } else if (updated) {
    
                                    if (product.quantity > 0) {
                                        User.findByIdAndUpdate(userId, { $push: { 'shoppingCar.products': product } }, { new: true }, (err, updated) => {
                                            if (err) {
                                                res.status(500).send({ error: 'Error interno del servidor', err });
                                            } else if (updated) {
                                                res.send({ 'Carrito actualizado': updated.shoppingCar });
                                            } else {
                                                res.status(400).send({ message: 'Error al actualizar carrito.' });
                                            }
                                        });
                                    } else {
                                        res.send({ 'Carrito actualizado': updated.shoppingCar });
                                    }
                                } else {
                                    res.status(400).send({ message: 'Error al remover del carrito.' });
                                }
                            });
                        }
                    } else {
                        res.status(400).send({ message: 'El registro aún no existe dentro del carrito.' });
                    }
                });
            }
        } else {
            res.status(400).send({ message: 'Debe ingresar el producto que desea eliminar del carrito y la cantidad.' });
        }
    }
}

function myBuys(req, res) {
    var userId = req.params.id;

    if (req.user.sub != userId) {
        res.status(403).send({ message: 'No tiene permitido realizar esta acción.' });
    } else {
        User.findById(userId, (err, found) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (found) {
                res.send({ 'Compras realizadas': found.bills });
            } else {
                res.status(404).send({ message: 'No hay datos para mostrar.' });
            }
        }).populate({ path: 'bills', select: '-detail.products._id -_id -clientNIT -clientName -clientLastname -__v' });
    }
}

function deleteBill(req, res) {
    var billId = req.params.idB;
    var userId = req.params.id;

    if (req.user.sub != userId) {
        res.status(403).send({ message: 'No tiene permitido realizar esta acción.' });
    } else {
        User.findByIdAndUpdate(userId, { $pull: { bills: billId } }, (err, userUpdated) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (userUpdated) {
                res.send({ message: 'Factura eliminada correctamente.' });
            } else {
                res.status(404).send({ message: 'Error al eliminar factura.' });
            }
        });
    }
}

module.exports = {
    saveUser,
    editProfile,
    deleteUser,
    defaultAdmin,
    signUp,
    login,
    addToCar,
    removeFromCar,
    buy,
    myBuys,
    deleteBill
}