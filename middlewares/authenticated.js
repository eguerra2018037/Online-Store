'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = '0d0a546f705f7365637265745f6b6579';

exports.ensureAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'Petición sin autenticación.' });
    } else {
        var token = req.headers.authorization.replace(/['"]+/g, '');
        try {
            var payload = jwt.decode(token, key);
            if (payload.exp <= moment().unix()) {
                return res.status(401).send({ message: 'Token expirado' });
            }
        } catch (ex) {
            return res.status(404).send({ message: 'Token no válido.' });
        }

        req.user = payload;
        next();
    }
}

exports.ensureAuthADMIN = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'Petición sin autenticación.' });
    } else {
        var token = req.headers.authorization.replace(/['"]+/g, '');
        try {
            var payload = jwt.decode(token, key);
            if (payload.exp <= moment().unix()) {
                return res.status(401).send({ message: 'Token expirado.' });
            } else if (payload.role != 'ADMIN') {
                return res.status(401).send({ message: 'Acceso Denegado' });
            }
        } catch (ex) {
            return res.status(404).send({ message: 'Token no válido' });
        }
        req.user = payload;
        next();
    }
}