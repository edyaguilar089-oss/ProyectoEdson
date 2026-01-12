const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// FUNCIÓN AUXILIAR: Obtener imágenes extra
const getImagesForProduct = async (productId) => {
    try {
        const result = await db.query('SELECT imagen_url FROM product_images WHERE product_id = $1', [productId]);
        return result.rows.map(r => r.imagen_url);
    } catch (err) {
        console.error('Error obteniendo imágenes:', err);
        return [];
    }
};

// 1. OBTENER TODOS
exports.getProducts = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products');
        const products = result.rows;

        const productsWithImages = await Promise.all(products.map(async (p) => {
            const extraImages = await getImagesForProduct(p.id);
            const mainImg = p.imagen || '/img/default.png';
            return { ...p, galeria: [mainImg, ...extraImages] };
        }));
        
        res.json(productsWithImages);
    } catch (err) {
        console.error('Error obteniendo productos:', err);
        res.status(500).send('Error DB');
    }
};

// 2. CREAR PRODUCTO
exports.createProduct = async (req, res) => {
    const { nombre, descripcion, precio, stock, categoria } = req.body;
    const files = req.files;

    if (!nombre || !precio) return res.status(400).send('Faltan datos');

    const stockValido = stock ? parseInt(stock) : 0;
    const categoryId = categoria ? parseInt(categoria) : null;
    const tempImage = '/img/default.png';

    try {
        // PostgreSQL usa RETURNING para obtener el ID
        const sql = 'INSERT INTO products (nombre, descripcion, precio, stock, category_id, imagen) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
        const result = await db.query(sql, [nombre, descripcion, precio, stockValido, categoryId, tempImage]);
        const productId = result.rows[0].id;

        // Mover archivos si existen
        if (files && files.length > 0) {
            const targetFolder = path.join('public', 'img', 'products', `producto-${productId}`);
            
            if (!fs.existsSync(targetFolder)) {
                fs.mkdirSync(targetFolder, { recursive: true });
            }

            const newUrls = files.map(file => {
                const oldPath = file.path;
                const newPath = path.join(targetFolder, file.filename);
                
                try {
                    fs.renameSync(oldPath, newPath);
                } catch (moveErr) {
                    fs.copyFileSync(oldPath, newPath);
                    fs.unlinkSync(oldPath);
                }

                return `/img/products/producto-${productId}/${file.filename}`;
            });

            // Actualizar imagen principal
            const mainImageUrl = newUrls[0];
            await db.query('UPDATE products SET imagen = $1 WHERE id = $2', [mainImageUrl, productId]);

            // Insertar imágenes extra
            if (newUrls.length > 1) {
                const extraImages = newUrls.slice(1);
                for (const url of extraImages) {
                    await db.query('INSERT INTO product_images (product_id, imagen_url) VALUES ($1, $2)', [productId, url]);
                }
            }
        }

        res.status(201).send('Producto creado');
    } catch (err) {
        console.error('Error creando producto:', err);
        res.status(500).send('Error creando producto');
    }
};

// 3. ACTUALIZAR PRODUCTO
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock } = req.body;
    const stockValido = stock ? parseInt(stock) : 0;

    try {
        const sql = 'UPDATE products SET nombre=$1, descripcion=$2, precio=$3, stock=$4 WHERE id=$5';
        await db.query(sql, [nombre, descripcion, precio, stockValido, id]);
        res.send('Actualizado');
    } catch (err) {
        console.error('Error actualizando producto:', err);
        res.status(500).send('Error updating');
    }
};

// 4. BORRAR PRODUCTO
exports.deleteProduct = async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        res.send('Eliminado');
    } catch (err) {
        console.error('Error eliminando producto:', err);
        res.status(500).send('Error');
    }
};

// 5. OBTENER DESTACADOS
exports.getFeatured = async (req, res) => {
    try {
        // PostgreSQL usa RANDOM() en lugar de RAND()
        const result = await db.query('SELECT * FROM products ORDER BY RANDOM() LIMIT 5');
        const products = result.rows;

        const productsWithImages = await Promise.all(products.map(async (p) => {
            const extraImages = await getImagesForProduct(p.id);
            const mainImg = p.imagen || '/img/default.png';
            return { ...p, galeria: [mainImg, ...extraImages] };
        }));
        
        res.json(productsWithImages);
    } catch (err) {
        console.error('Error obteniendo destacados:', err);
        res.status(500).send('Error db');
    }
};

// 6. OBTENER POR CATEGORÍA
exports.getByCategory = async (req, res) => {
    const categoryId = req.params.id;

    try {
        const result = await db.query('SELECT * FROM products WHERE category_id = $1', [categoryId]);
        const products = result.rows;

        const productsWithImages = await Promise.all(products.map(async (p) => {
            const extraImages = await getImagesForProduct(p.id);
            const mainImg = p.imagen || '/img/default.png';
            return { ...p, galeria: [mainImg, ...extraImages] };
        }));
        
        res.json(productsWithImages);
    } catch (err) {
        console.error('Error obteniendo por categoría:', err);
        res.status(500).send('Error db');
    }
};