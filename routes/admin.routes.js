const express = require('express');
const router = express.Router();

// Importamos el controlador
const adminController = require('../controllers/adminController');

// DEFINICIÓN DE RUTAS PARA USUARIOS
router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.get('/report', adminController.getSalesReport);  

module.exports = router;