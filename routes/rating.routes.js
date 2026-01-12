// routes/ratingRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

const isAuth = (req, res, next) => {
    if (!req.session.user) return res.status(401).send('No autorizado');
    next();
};

// ============================================
// 1. OBTENER PRODUCTOS PENDIENTES DE CALIFICAR
// ============================================
router.get('/pending', isAuth, (req, res) => {
    const userId = req.session.user.id;

    // Obtener productos que el usuario compró pero no ha calificado
    const sql = `
        SELECT DISTINCT 
            oi.order_id,
            oi.product_id,
            p.nombre,
            p.imagen,
            o.fecha
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_ratings pr ON (
            pr.product_id = oi.product_id 
            AND pr.user_id = ? 
            AND pr.order_id = oi.order_id
        )
        WHERE o.user_id = ? 
        AND pr.id IS NULL
        ORDER BY o.fecha DESC
    `;

    db.query(sql, [userId, userId], (err, results) => {
        if (err) {
            console.error('Error obteniendo productos pendientes:', err);
            return res.status(500).json({ error: 'Error en BD' });
        }
        res.json(results);
    });
});

// ============================================
// 2. AGREGAR CALIFICACIÓN
// ============================================
router.post('/add', isAuth, (req, res) => {
    const userId = req.session.user.id;
    const { product_id, order_id, rating, comentario } = req.body;

    // Validaciones
    if (!product_id || !order_id || !rating) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating debe ser entre 1 y 5' });
    }

    // Verificar que el usuario realmente compró este producto en esta orden
    db.query(
        `SELECT oi.id FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE oi.order_id = ? AND oi.product_id = ? AND o.user_id = ?`,
        [order_id, product_id, userId],
        (err, results) => {
            if (err || results.length === 0) {
                return res.status(403).json({ error: 'No puedes calificar este producto' });
            }

            // Insertar calificación
            db.query(
                'INSERT INTO product_ratings (product_id, user_id, order_id, rating, comentario) VALUES (?, ?, ?, ?, ?)',
                [product_id, userId, order_id, rating, comentario || null],
                (errInsert) => {
                    if (errInsert) {
                        if (errInsert.code === 'ER_DUP_ENTRY') {
                            return res.status(400).json({ error: 'Ya calificaste este producto' });
                        }
                        console.error('Error insertando calificación:', errInsert);
                        return res.status(500).json({ error: 'Error guardando calificación' });
                    }

                    // Actualizar promedio del producto
                    actualizarPromedioProducto(product_id);

                    res.status(201).json({ msg: 'Calificación agregada' });
                }
            );
        }
    );
});

// ============================================
// 3. OBTENER CALIFICACIONES DE UN PRODUCTO
// ============================================
router.get('/product/:productId', (req, res) => {
    const productId = req.params.productId;

    db.query(
        `SELECT 
            pr.rating, 
            pr.comentario, 
            pr.fecha,
            u.nombre AS usuario
         FROM product_ratings pr
         JOIN users u ON pr.user_id = u.id
         WHERE pr.product_id = ?
         ORDER BY pr.fecha DESC`,
        [productId],
        (err, results) => {
            if (err) {
                console.error('Error obteniendo calificaciones:', err);
                return res.status(500).json({ error: 'Error en BD' });
            }
            res.json(results);
        }
    );
});

// ============================================
// FUNCIÓN AUXILIAR: Actualizar Promedio
// ============================================
function actualizarPromedioProducto(productId) {
    db.query(
        `SELECT 
            AVG(rating) as promedio,
            COUNT(*) as total
         FROM product_ratings 
         WHERE product_id = ?`,
        [productId],
        (err, results) => {
            if (err) {
                console.error('Error calculando promedio:', err);
                return;
            }

            const promedio = results[0].promedio || 0;
            const total = results[0].total || 0;

            db.query(
                'UPDATE products SET rating_promedio = ?, total_ratings = ? WHERE id = ?',
                [promedio, total, productId],
                (errUpdate) => {
                    if (errUpdate) console.error('Error actualizando promedio:', errUpdate);
                }
            );
        }
    );
}

module.exports = router;