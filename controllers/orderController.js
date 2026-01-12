const db = require('../config/db');

// 1. PROCESAR COMPRA (Checkout)
exports.checkout = (req, res) => {
    const user = req.session.user;
    const cart = req.session.cart;
    const { payment_method_id } = req.body;

    // A. Validaciones
    if (!cart || cart.length === 0) return res.status(400).json({ error: 'Carrito vacío' });
    if (!payment_method_id) return res.status(400).json({ error: 'Debes seleccionar un método de pago' });

    // B. Verificar método de pago
    db.query('SELECT id FROM payment_methods WHERE id = ? AND user_id = ?', [payment_method_id, user.id], (errPayment, paymentResults) => {
        if (errPayment || paymentResults.length === 0) {
            return res.status(403).json({ error: 'Método de pago inválido' });
        }

        // C. Calcular Total e Insertar Orden
        const total = cart.reduce((s, p) => s + p.precio * p.cantidad, 0);
        
        db.query('INSERT INTO orders (user_id, total, payment_method_id, estado, fecha) VALUES (?, ?, ?, ?, NOW())', 
        [user.id, total, payment_method_id, 'pagado'], 
        (err, orderResult) => {
            if (err) {
                console.error('Error creando orden:', err);
                return res.status(500).json({ error: 'Error al crear orden' });
            }

            const orderId = orderResult.insertId;

            // D. Insertar Items
            const values = cart.map(p => [orderId, p.productId, p.cantidad]);
            db.query('INSERT INTO order_items (order_id, product_id, cantidad) VALUES ?', [values], (errItems) => {
                if (errItems) {
                    console.error('Error insertando items:', errItems);
                    return res.status(500).json({ error: 'Error guardando productos' });
                }

                // --- E. ACTUALIZAR STOCK (LA PARTE NUEVA) ---
                cart.forEach(item => {
                    const sqlStock = 'UPDATE products SET stock = stock - ? WHERE id = ?';
                    db.query(sqlStock, [item.cantidad, item.productId], (errStock) => {
                        if(errStock) console.error(`Error restando stock prod ${item.productId}:`, errStock);
                    });
                });

                // F. Finalizar
                req.session.cart = [];
                req.session.save(() => {
                    res.json({ msg: 'Compra realizada con éxito', orderId });
                });
            });
        });
    });
};

// 2. OBTENER HISTORIAL
exports.getHistory = (req, res) => {
    const userId = req.session.user.id;
    const sql = `
        SELECT o.id, o.total, DATE_FORMAT(o.fecha, '%d/%m/%Y %H:%i') as fecha, o.estado, 
               pm.tipo AS metodo_pago, pm.ultimos_digitos
        FROM orders o
        LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
        WHERE o.user_id = ?
        ORDER BY o.fecha DESC
    `;
    
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error BD' });
        res.json(results);
    });
};

// 3. OBTENER DETALLE ORDEN
exports.getOrderDetails = (req, res) => {
    const userId = req.session.user.id;
    const orderId = req.params.orderId;
    const sql = `
        SELECT oi.product_id, p.nombre, p.imagen, oi.cantidad, p.precio
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.order_id = ? AND o.user_id = ?
    `;

    db.query(sql, [orderId, userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error BD' });
        res.json(results);
    });
};