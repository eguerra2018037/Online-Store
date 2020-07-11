'use strict'

var Product = require('../models/product.model');
var Category = require('../models/category.model');

function saveProduct(req, res) {
    var categoryId = req.params.idC;
    var product = new Product();
    var params = req.body;

    if (params.name && params.brand && params.price && params.model && params.quantity) {

        Product.findOne({ name: params.name, brand: params.brand, model: params.model }, (err, found) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (found) {
                Product.findByIdAndUpdate(found._id, { quantity: parseInt(found.quantity) + parseInt(params.quantity) }, { new: true }, (err, exists) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (exists) {
                        res.status(200).send({ 'Producto ya existente, la nueva cantidad en stock es': exists.quantity });
                    } else {
                        res.status(400).send({ message: 'Error al actualizar el stock' });
                    }
                });
            } else {
                product.name = params.name;
                product.brand = params.brand;
                product.model = params.model;
                product.price = params.price;
                product.quantity = params.quantity;

                product.save((err, saved) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (saved) {
                        Category.findByIdAndUpdate(categoryId, { $push: { products: product } }, { new: true }, (err, updated) => {
                            if (err) {
                                res.status(500).send({ error: 'Error interno del servidor', err });
                            } else if (updated) {
                                res.send({ 'Producto registrado': saved });
                            } else {
                                Category.findOneAndUpdate({ name: 'defaultCategory' }, { $push: { products: product } }, { new: true }, (err, updated) => {
                                    if (err) {
                                        res.status(500).send({ error: 'Error interno del servidor', err });
                                    } else if (updated) {
                                        res.send({ '¡ADVERTENCIA!': 'Categoria no encontrada, asignado a categoría por defecto', 'Producto registrado': saved });
                                    } else {
                                        res.status(404).send({ error: 'La categoría por defecto aún no ha sido definida.', 'Producto sin categoría': saved });
                                    }
                                });
                            }
                        });
                    } else {
                        res.status(400).send({ message: 'No ha sido posible guardar el producto.' });
                    }
                });
            }
        });
    } else {
        res.status(400).send({ message: 'Debe ingresar todos los datos requeridos.' })
    }
}

function listProducts(req, res) {
    Product.find({}, (err, found) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (found) {
            res.send({ 'Productos disponibles': found });
        } else {
            res.status(404).send({ message: 'No hay datos para mostrar' });
        }
    });
}

function editProduct(req, res) {
    var productId = req.params.id;
    var actualizar = req.body;

    Product.findOne({ _id: { $ne: productId }, name: actualizar.name, brand: actualizar.brand, model: actualizar.model }, (err, found) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (found) {
            res.send({ message: 'Ya existe un producto con estos datos.' });
        } else {
            Product.findByIdAndUpdate(productId, actualizar, { new: true }, (err, updated) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (updated) {
                    res.send({ 'Registro actualizado': updated });
                } else {
                    res.status(404).send({ message: 'No se ha encontrado el registro.' });
                }
            });
        }
    });
}

function productStock(req, res) {
    var productId = req.params.id;

    Product.findById(productId, (err, found) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (found) {
            res.send({ 'Producto': found.name, 'Marca': found.brand, 'Modelo': found.model, 'Precio': found.price, 'Cantidad': found.quantity })
        } else {
            res.status(404).send({ message: 'No se ha encontrado el registro.' })
        }
    });
}

function deleteProduct(req, res) {
    var productId = req.params.id;

    Product.findByIdAndDelete(productId, (err, deleted) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (deleted) {
            Category.findOneAndUpdate({ products: productId }, { $pull: { products: productId } }, (err, removed) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (removed) {
                    res.send({ message: 'Registro eliminado correctamente y removido de su categoría.' })
                } else {
                    res.send({ message: 'Registro eliminado correctamente.' });
                }
            });
        } else {
            res.status(404).send({ message: 'No se ha encontrado el registro.' })
        }
    });
}

function asignToCategory(req, res) {
    var categoryId = req.params.idC;
    var productId = req.params.id;

    Category.findOne({ _id: categoryId, products: productId }, (err, found) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (found) {
            res.send({ 'El producto ya pertenece a esta categoría.': found });
        } else {
            Category.findByIdAndUpdate(categoryId, { $push: { products: productId } }, { new: true }, (err, updated) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (updated) {
                    Category.findOneAndUpdate({ products: productId, _id: { $ne: categoryId } }, { $pull: { products: productId } }, { new: true }, (err, removed) => {
                        if (err) {
                            res.status(500).send({ error: 'Error interno del servidor', err });
                        } else if (removed) {
                            res.send({ 'Producto reasignado correctamente': updated });
                        } else {
                            res.send({ 'Producto asignado correctamente': updated });
                        }
                    });
                } else {
                    Category.findOneAndUpdate({ name: 'defaultCategory' }, { $push: { products: productId } }, { new: true }, (err, asignDefault) => {
                        if (err) {
                            res.status(500).send({ error: 'Error interno del servidor', err });
                        } else if (asignDefault) {
                            Category.findOneAndUpdate({ products: productId, _id: { $ne: categoryId }, name:{$ne:'defaultCategory'} }, { $pull: { products: productId } }, { new: true }, (err, removed) => {
                                if (err) {
                                    res.status(500).send({ error: 'Error interno del servidor', err });
                                } else if (removed) {
                                    res.send({ '¡ADVERTENCIA!': 'Categoria no encontrada, asignado a categoría por defecto', 'Producto registrado': asignDefault });
                                } else {
                                    res.send({ '¡ADVERTENCIA!': 'Categoria no encontrada, asignado a categoría por defecto', 'Producto registrado': asignDefault, message:'Error al remover de categoría anterior.' });
                                }
                            });
                        } else {
                            res.status(404).send({ error: 'La categoría por defecto aún no ha sido definida.' });
                        }
                    });
                }
            });
        }
    });


}

function bestSellers(req, res) {
    Product.find({ sales: { $gt: 0 } }, (err, products) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (products != '') {
            res.send({ 'Productos más vendidos': products });
        } else {
            res.status(404).send({ message: 'No hay datos para mostrar.' });
        }
    }).sort({ sales: -1 }).select('-__v -_id').limit(10);
}

function searchProduct(req, res) {
    var params = req.body;

    if (params.search) {
        Product.find({
            $or: [
                { name: { $regex: params.search, $options: 'i' } },
                { brand: { $regex: params.search, $options: 'i' } }
            ]
        }, (err, products) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (products) {
                res.send({ 'Coincidencias': products });
            } else {
                res.status(404).send({ message: 'No hay datos para mostrar.' });
            }
        });
    } else {
        res.status(400).send({ message: 'Ingrese un parámetro de búsqueda.' });
    }
}

function outOfStock(req, res) {
    Product.find({ quantity: 0 }, (err, products) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (products != '') {
            res.send({ 'Productos agotados': products });
        } else {
            res.status(404).send({ message: 'No hay datos para mostrar.' });
        }
    });
}

module.exports = {
    saveProduct,
    listProducts,
    editProduct,
    productStock,
    deleteProduct,
    asignToCategory,
    bestSellers,
    searchProduct,
    outOfStock
}