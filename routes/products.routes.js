const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// --- 1. CONFIGURACIÓN MULTER (SUBIDA DE IMÁGENES) ---
const multer = require('multer');
const path = require('path');

// Definimos dónde se guardan y cómo se llaman
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Asegúrate de que la carpeta 'public/img' exista
        cb(null, 'public/img'); 
    },
    filename: (req, file, cb) => {
        // Nombre único: fecha + nombre original para evitar duplicados
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// --- 2. DEFINICIÓN DE RUTAS (Ordenadas y Únicas) ---

// A. Rutas Públicas (Catálogo)
// Usamos los nombres cortos que definimos en el controlador nuevo
router.get('/featured', productController.getFeatured);
router.get('/category/:id', productController.getByCategory);
router.get('/', productController.getProducts);

// B. Rutas Admin/Vendedor (CRUD con Imágenes)
// Agregamos 'upload.array' para permitir subir hasta 5 fotos en Crear y Actualizar

// Crear Producto (POST)
router.post('/', upload.array('imagenes', 5), productController.createProduct);

// Actualizar Producto (PUT)
router.put('/:id', upload.array('imagenes', 5), productController.updateProduct);

// Eliminar Producto (DELETE)
router.delete('/:id', productController.deleteProduct);

module.exports = router;