const db = require('../config/db');

// 1. PROCESAR COMPRA (Checkout)
exports.checkout = async (req, res) => {
    const user = req.session.user;
    const cart = req.session.cart;
    const { payment_method_id } = req.body;

    // Validaciones
    if (!cart || cart.length === 0) {
        return res.status(400).json({ error: 'Carrito vacío' });
    }
    if (!payment_method_id) {
        return res.status(400).json({ error: 'Debes seleccionar un método de pago' });
    }

    try {
        // Verificar método de pago
        const paymentCheck = await db.query(
            'SELECT id FROM payment_methods WHERE id = $1 AND user_id = $2',
            [payment_method_id, user.id]
        );

        if (paymentCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Método de pago inválido' });
        }

        // Calcular total
        const total = cart.reduce((s, p) => s + p.precio * p.cantidad, 0);

        // Crear orden (PostgreSQL usa NOW() y RETURNING)
        const orderSql = 'INSERT INTO orders (user_id, total, payment_method_id, estado, fecha) VALUES ($1, $2, $3, $4, NOW()) RETURNING id';
        const orderResult = await db.query(orderSql, [user.id, total, payment_method_id, 'pagado']);
        const orderId = orderResult.rows[0].id;

        // Insertar items de la orden
        for (const item of cart) {
            await db.query(
                'INSERT INTO order_items (order_id, product_id, cantidad) VALUES ($1, $2, $3)',
                [orderId, item.productId, item.cantidad]
            );

            // Actualizar stock
            await db.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2',
                [item.cantidad, item.productId]
            );
        }

        // Limpiar carrito
        req.session.cart = [];
        req.session.save(() => {
            res.json({ msg: 'Compra realizada con éxito', orderId });
        });

    } catch (err) {
        console.error('Error en checkout:', err);
        res.status(500).json({ error: 'Error al procesar compra' });
    }
};

// 2. OBTENER HISTORIAL
exports.getHistory = async (req, res) => {
    const userId = req.session.user.id;
    
    try {
        // PostgreSQL usa TO_CHAR en lugar de DATE_FORMAT
        const sql = `
            SELECT o.id, o.total, TO_CHAR(o.fecha, 'DD/MM/YYYY HH24:MI') as fecha, o.estado,
                   pm.tipo AS metodo_pago, pm.ultimos_digitos
            FROM orders o
            LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
            WHERE o.user_id = $1
            ORDER BY o.fecha DESC
        `;
        
        const result = await db.query(sql, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error obteniendo historial:', err);
        res.status(500).json({ error: 'Error BD' });
    }
};

// 3. OBTENER DETALLE ORDEN
exports.getOrderDetails = async (req, res) => {
    const userId = req.session.user.id;
    const orderId = req.params.orderId;

    try {
        const sql = `
            SELECT oi.product_id, p.nombre, p.imagen, oi.cantidad, p.precio
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE oi.order_id = $1 AND o.user_id = $2
        `;

        const result = await db.query(sql, [orderId, userId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error obteniendo detalle orden:', err);
        res.status(500).json({ error: 'Error BD' });
    }
};