// ============================================
// AUTO-REGISTRAR IMÁGENES DE CARPETAS EN LA BD
// Ejecutar con: node register-images.js
// ============================================

const db = require('./config/db');
const fs = require('fs');
const path = require('path');

console.log('🔍 Escaneando carpetas de productos...\n');

// Ruta base de productos
const carpetaBase = path.join(__dirname, 'public/img/products');

// Verificar que la carpeta existe
if (!fs.existsSync(carpetaBase)) {
    console.error('❌ No existe la carpeta public/img/products');
    process.exit(1);
}

// Obtener productos de la BD
db.query('SELECT id, imagen FROM products', (err, productos) => {
    if (err) {
        console.error('❌ Error consultando BD:', err);
        db.end();
        return;
    }

    console.log(`📦 Encontrados ${productos.length} productos en la BD\n`);

    let totalRegistradas = 0;

    productos.forEach((producto) => {
        const { id, imagen } = producto;
        const carpetaProducto = path.join(carpetaBase, `producto-${id}`);

        // Si no existe la carpeta, saltarla
        if (!fs.existsSync(carpetaProducto)) {
            console.log(`⏩ Producto #${id}: no tiene carpeta`);
            return;
        }

        // Leer todos los archivos de la carpeta
        const archivos = fs.readdirSync(carpetaProducto);
        
        // Filtrar solo imágenes (jpg, jpeg, png, gif, webp)
        const imagenes = archivos.filter(archivo => 
            /\.(jpg|jpeg|png|gif|webp)$/i.test(archivo)
        );

        if (imagenes.length === 0) {
            console.log(`⚠️  Producto #${id}: carpeta vacía`);
            return;
        }

        console.log(`📸 Producto #${id}: encontradas ${imagenes.length} imágenes`);

        // Obtener el nombre de la imagen principal
        const nombreImagenPrincipal = path.basename(imagen);

        // Separar las imágenes adicionales (las que NO son la principal)
        const imagenesAdicionales = imagenes.filter(img => img !== nombreImagenPrincipal);

        if (imagenesAdicionales.length === 0) {
            console.log(`   ✓ Solo tiene imagen principal, nada que agregar\n`);
            return;
        }

        // Consultar qué imágenes YA están registradas en la BD
        db.query(
            'SELECT imagen_url FROM product_images WHERE product_id = ?',
            [id],
            (errQuery, yaRegistradas) => {
                if (errQuery) {
                    console.error(`   ❌ Error consultando imágenes de producto #${id}`);
                    return;
                }

                // Crear un Set con las URLs ya registradas para comparación rápida
                const urlsRegistradas = new Set(
                    yaRegistradas.map(r => r.imagen_url)
                );

                // Filtrar solo las imágenes que NO están registradas
                const imagenesNuevas = imagenesAdicionales.filter(img => {
                    const url = `/img/products/producto-${id}/${img}`;
                    return !urlsRegistradas.has(url);
                });

                if (imagenesNuevas.length === 0) {
                    console.log(`   ✓ Todas las imágenes ya están registradas\n`);
                    return;
                }

                // Preparar datos para insertar
                const values = imagenesNuevas.map(img => [
                    id, 
                    `/img/products/producto-${id}/${img}`
                ]);

                // Insertar en la BD
                db.query(
                    'INSERT INTO product_images (product_id, imagen_url) VALUES ?',
                    [values],
                    (errInsert) => {
                        if (errInsert) {
                            console.error(`   ❌ Error registrando imágenes:`, errInsert);
                        } else {
                            console.log(`   ✅ Registradas ${imagenesNuevas.length} imágenes nuevas:`);
                            imagenesNuevas.forEach(img => {
                                console.log(`      • ${img}`);
                            });
                            console.log('');
                            totalRegistradas += imagenesNuevas.length;
                        }
                    }
                );
            }
        );
    });

    // Resumen final (esperar 2 segundos para que terminen las consultas)
    setTimeout(() => {
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN');
        console.log('='.repeat(60));
        console.log(`✅ Total de imágenes registradas: ${totalRegistradas}`);
        console.log('='.repeat(60) + '\n');
        
        db.end();
        console.log('🏁 Proceso finalizado\n');
    }, 3000);
});