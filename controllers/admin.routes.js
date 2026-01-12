const express = require('express');
const router = express.Router();

// Importamos el controlador que ya tienes en la carpeta controllers
const adminController = require('../controllers/adminController');


// DEFINICIÓN DE RUTAS


router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);


module.exports = router;