'use strict'

var Category = require('../models/category.model');

function defaultCategory(req, res) {
    var category = new Category();

    Category.findOne({ name: 'defaultCategory' }, (err, found) => {
        if (err) {
            console.log('Error interno del servidor', err);
        } else if (found) {
            console.log('Categoría por defecto ya definida.');
        } else {
            category.name = 'defaultCategory';
            category.description = 'Categoría temporal por defecto';

            category.save((err, saved) => {
                if (err) {
                    console.log('Error interno del servidor', err);
                } else if (saved) {
                    console.log('Categoría por defecto definida');
                } else {
                    console.log('La categoría por defecto no ha sido definida');
                }
            });
        }
    });
}

function saveCategory(req, res) {
    var category = new Category();
    var params = req.body;

    if (params.name && params.description) {
        Category.findOne({ name: params.name }, (err, exists) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (exists) {
                res.status(202).send({ message: 'Esta categoría ya está registrada.' });
            } else {
                category.name = params.name;
                category.description = params.description;

                category.save((err, saved) => {
                    if (err) {
                        res.status(500).send({ error: 'Error interno del servidor', err });
                    } else if (saved) {
                        res.send({ 'Categoría registrada': saved });
                    } else {
                        res.status(400).send({ message: 'No ha sido posible guardar la categoría ingresada.' });
                    }
                });
            }
        });
    } else {
        res.status(400).send({ message: 'Debe ingresar todos los datos requeridos.' });
    }
}

function listCategories(req, res) {
    Category.find({}, (err, categories) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (categories) {
            res.send({ 'Categorías existentes': categories });
        } else {
            res.status(404).send({ message: 'No hay datos para mostrar.' });
        }
    });
}

function editCategory(req, res) {
    var categoryId = req.params.idC;
    var actualizar = req.body;

    Category.findOne({ _id: { $ne: categoryId }, name: actualizar.name }, (err, found) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (found) {
            res.status(400).send({ message: 'Ya existe una categoría con este nombre.' });
        } else {

            Category.findOne({ _id: categoryId, name: 'defaultCategory' }, (err, found) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (found) {
                    res.status(400).send({ message: 'No tiene permitido editar la categoría por defecto.' });
                } else {
                    Category.findByIdAndUpdate(categoryId, actualizar, { new: true }, (err, updated) => {
                        if (err) {
                            res.status(500).send({ error: 'Error interno del servidor', err });
                        } else if (updated) {
                            res.send({ 'Registro actualizado': updated });
                        } else {
                            res.status(400).send({ message: 'No ha sido posible actualizar el registro.' });
                        }
                    });
                }
            })
        }
    });
}

function deleteCategory(req, res) {
    var categoryId = req.params.idC;

    Category.findById(categoryId, (err, found) => {
        if (err) {
            res.status(500).send({ error: 'Error interno del servidor', err });
        } else if (found.name != 'defaultCategory') {
            Category.findByIdAndDelete(categoryId, (err, deleted) => {
                if (err) {
                    res.status(500).send({ error: 'Error interno del servidor', err });
                } else if (deleted) {
                    if (deleted.products != 0) {
                        Category.findOneAndUpdate({ name: 'defaultCategory' }, { $push: { products: deleted.products } }, { new: true }, (err, added) => {
                            if (err) {
                                res.status(500).send({ error: 'Error interno del servidor', err });
                            } else if (added) {
                                res.send({ message: 'Registro eliminado, productos reasignados a Categoría por defecto' });
                            } else {
                                res.status(400).send({ message: 'La categoría por defecto aún no está definida' });
                            }
                        });
                    } else {
                        res.send({ message: 'Registro eliminado exitosamente.' });
                    }
                } else {
                    res.status(400).send({ message: 'No ha sido posible eliminar el registro.' });
                }
            });
        } else if (found.name == 'defaultCategory') {
            res.status(400).send({ message: 'No puede eliminar la categoría por defecto.' });;
        } else {
            res.status(404).send({ message: 'Registro no encontrado' });
        }
    });
}

function searchCategory(req, res) {
    var params = req.body;
    if (params.search) {
        Category.find({ name: { $regex: params.search, $options: 'i' }, products: { $ne: [] } }, (err, categories) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (categories != '') {
                res.send({ 'Coincidencias': categories });
            } else {
                res.status(400).send({ message: 'Sin coincidencias' });
            }
        }).populate({ path: 'products', match: { quantity: { $gt: 0 } }, select: 'name brand price _id' }).select('name products description -_id');
    } else if (params) {
        Category.find({ products: { $ne: [] } }, (err, categories) => {
            if (err) {
                res.status(500).send({ error: 'Error interno del servidor', err });
            } else if (categories != '') {
                res.send({ 'Coincidencias': categories });
            } else {
                res.status(400).send({ message: 'Sin coincidencias' });
            }
        }).populate({ path: 'products', match: { quantity: { $gt: 0 } }, select: 'name brand price _id' }).select('name products description -_id');
    }
}

module.exports = {
    saveCategory,
    listCategories,
    editCategory,
    deleteCategory,
    defaultCategory,
    searchCategory
}