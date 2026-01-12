const db = require('../config/db');
const fs = require('fs');   // <--- Necesario para mover archivos
const path = require('path'); // <--- Necesario para manejar rutas

// --- FUNCIÓN AUXILIAR: Obtener imágenes extra de un producto ---
const getImagesForProduct = (productId) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT imagen_url FROM product_images WHERE product_id = ?', [productId], (err, results) => {
            if (err) resolve([]); 
            else resolve(results.map(r => r.imagen_url));
        });
    });
};

// 1. OBTENER TODOS
exports.getProducts = (req, res) => {
    db.query('SELECT * FROM products', async (err, products) => {
        if (err) return res.status(500).send('Error DB');

        try {
            const productsWithImages = await Promise.all(products.map(async (p) => {
                const extraImages = await getImagesForProduct(p.id);
                // Si la imagen es null o vacía, ponemos default
                const mainImg = p.imagen || '/img/default.png';
                return { ...p, galeria: [mainImg, ...extraImages] };
            }));
            res.json(productsWithImages);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error procesando imágenes');
        }
    });
};

// 2. CREAR PRODUCTO (CON CREACIÓN DE CARPETA AUTOMÁTICA)
exports.createProduct = (req, res) => {
    const { nombre, descripcion, precio, stock, categoria } = req.body;
    const files = req.files; 

    if (!nombre || !precio) return res.status(400).send('Faltan datos');

    const stockValido = stock ? parseInt(stock) : 0;
    const categoryId = categoria ? parseInt(categoria) : null;
    
    // Primero insertamos el producto con una imagen temporal o default
    const sql = 'INSERT INTO products (nombre, descripcion, precio, stock, category_id, imagen) VALUES (?, ?, ?, ?, ?, ?)';
    const tempImage = '/img/default.png';

    db.query(sql, [nombre, descripcion, precio, stockValido, categoryId, tempImage], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error creando producto');
        }
        
        const productId = result.insertId;

        // --- LÓGICA DE MOVIMIENTO DE ARCHIVOS ---
        if (files && files.length > 0) {
            
            // 1. Definir la nueva carpeta: public/img/products/producto-{ID}
            const targetFolder = path.join('public', 'img', 'products', `producto-${productId}`);
            
            // 2. Crear la carpeta si no existe
            if (!fs.existsSync(targetFolder)) {
                fs.mkdirSync(targetFolder, { recursive: true });
            }

            // 3. Mover archivos y generar nuevas URLs
            const newUrls = files.map(file => {
                const oldPath = file.path; // Dónde lo guardó Multer originalmente
                const newPath = path.join(targetFolder, file.filename); // Dónde lo queremos
                
                // Movemos el archivo
                try {
                    fs.renameSync(oldPath, newPath);
                } catch (moveErr) {
                    console.error("Error moviendo archivo:", moveErr);
                    // Si falla mover, intentamos copiar y borrar (fallback)
                    fs.copyFileSync(oldPath, newPath);
                    fs.unlinkSync(oldPath);
                }

                // Retornamos la nueva URL web
                return `/img/products/producto-${productId}/${file.filename}`;
            });

            // 4. Actualizar la Base de Datos con las nuevas rutas
            
            // A) Actualizar imagen principal (la primera foto)
            const mainImageUrl = newUrls[0];
            db.query('UPDATE products SET imagen = ? WHERE id = ?', [mainImageUrl, productId], (err) => {
                if(err) console.error("Error actualizando portada", err);
            });

            // B) Insertar imágenes extra (si hay más de una)
            if (newUrls.length > 1) {
                const extraImages = newUrls.slice(1).map(url => [productId, url]);
                const sqlImg = 'INSERT INTO product_images (product_id, imagen_url) VALUES ?';
                db.query(sqlImg, [extraImages], (error) => {
                    if (error) console.error("Error guardando imágenes extra", error);
                });
            }
        }

        res.status(201).send('Producto creado y organizado en carpetas');
    });
};

// 3. ACTUALIZAR PRODUCTO
exports.updateProduct = (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock } = req.body;
    const stockValido = stock ? parseInt(stock) : 0;
    
    const sql = 'UPDATE products SET nombre=?, descripcion=?, precio=?, stock=? WHERE id=?';
    db.query(sql, [nombre, descripcion, precio, stockValido, id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating');
        }
        res.send('Actualizado');
    });
};

// 4. BORRAR PRODUCTO
exports.deleteProduct = (req, res) => {
    // Opcional: Podrías agregar aquí lógica para borrar la carpeta del disco también usando fs.rmdir
    db.query('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
        if(err) {
            console.error(err);
            return res.status(500).send('Error');
        }
        res.send('Eliminado');
    });
};

// 5. OBTENER DESTACADOS
exports.getFeatured = (req, res) => {
    db.query('SELECT * FROM products ORDER BY RAND() LIMIT 5', async (err, products) => {
        if (err) return res.status(500).send('Error db');
        const productsWithImages = await Promise.all(products.map(async (p) => {
            const extraImages = await getImagesForProduct(p.id);
            const mainImg = p.imagen || '/img/default.png';
            return { ...p, galeria: [mainImg, ...extraImages] };
        }));
        res.json(productsWithImages);
    });
};

// 6. OBTENER POR CATEGORÍA
exports.getByCategory = (req, res) => {
    const categoryId = req.params.id;
    const sql = 'SELECT * FROM products WHERE category_id = ?'; 
    
    db.query(sql, [categoryId], async (err, products) => {
        if (err) return res.status(500).send('Error db');
        try {
            const productsWithImages = await Promise.all(products.map(async (p) => {
                const extraImages = await getImagesForProduct(p.id);
                const mainImg = p.imagen || '/img/default.png';
                return { ...p, galeria: [mainImg, ...extraImages] };
            }));
            res.json(productsWithImages);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error procesando imágenes');
        }
    });
};