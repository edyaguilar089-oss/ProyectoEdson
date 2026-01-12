CREATE DATABASE novastore;
USE novastore;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  rol ENUM('admin','cliente') DEFAULT 'cliente'
);


CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  descripcion TEXT,
  precio DECIMAL(10,2),
  imagen VARCHAR(255)
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  cantidad INT,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO users (nombre, email, password, rol)
VALUES (
  'Administrador2',
  'admin@novastore.com',
  '$2b$10$rNy8RBRLchW6K5F/0hNDveZAUioAkoIJAo9HWObM6rtG7Plp/2sva',
  'admin'
);



CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  descripcion TEXT,
  precio DECIMAL(10,2),
  imagen VARCHAR(255)
);

/*------------------------------------------------------------------------------------------*/

-- 1. Modificar la columna para aceptar 'vendedor'
ALTER TABLE users MODIFY COLUMN rol ENUM('admin','cliente','vendedor') DEFAULT 'cliente';

-- 2. Insertar 5 Vendedores (Pass: 123456)
INSERT INTO users (nombre, email, password, rol) VALUES 
('Carlos Vendedor 1', 'vendedor1@nova.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'vendedor'),
('Ana Venta', 'vendedor2@nova.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'vendedor'),
('Roberto Sales', 'vendedor3@nova.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'vendedor'),
('Lucia Shop', 'vendedor4@nova.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'vendedor'),
('Pedro Merchant', 'vendedor5@nova.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'vendedor');

-- 3. Insertar 25 Clientes (Pass: 123456)
INSERT INTO users (nombre, email, password, rol) VALUES 
('Cliente Uno', 'c1@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Cliente Dos', 'c2@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Maria Lopez', 'c3@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Juan Perez', 'c4@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Sofia Garcia', 'c5@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Luis Rodriguez', 'c6@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Elena Martinez', 'c7@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Miguel Hernandez', 'c8@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Laura Gonzalez', 'c9@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('David Sanchez', 'c10@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Carmen Ramirez', 'c11@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Javier Torres', 'c12@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Paula Flores', 'c13@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Alejandro Rivera', 'c14@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Patricia Gomez', 'c15@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Diego Diaz', 'c16@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Andrea Reyes', 'c17@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Ricardo Morales', 'c18@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Isabel Castillo', 'c19@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Fernando Ortega', 'c20@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Gabriela Mendoza', 'c21@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Hugo Vargas', 'c22@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Daniela Castro', 'c23@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Manuel Romero', 'c24@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente'),
('Veronica Herrera', 'c25@mail.com', '$2b$10$KqCaahb1QGAbwsDsIb.vSuTCmNC7M7G3lWnWi.xh2z7RBBOM7WILC', 'cliente');




-- inserts de clientes

USE novastore;


CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE
);

ALTER TABLE products 
ADD category_id INT,
ADD FOREIGN KEY (category_id) REFERENCES categories(id);

INSERT INTO categories (nombre) VALUES
('Celulares'),
('Auriculares'),
('Smartphones'),
('Computadoras'),
('Accesorios'),
('Gaming'),
('Smart Home');

select * from products;

select * from categories;


select * from users;

select * from orders;

INSERT INTO products (nombre, descripcion, precio, imagen, category_id) VALUES
('iPhone 15 Pro', 'Titanio, Chip A17 Pro.', 23999.00, '/img/default.png', 3),
('Samsung Galaxy S24 Ultra', 'Cámara 200MP, IA.', 26500.00, '/img/default.png', 3),
('Google Pixel 8 Pro', 'Cámara con IA.', 19500.00, '/img/default.png', 3),
('Xiaomi 13T Pro', 'Cámaras Leica.', 12500.00, '/img/default.png', 3),
('MacBook Air M3', 'Ultradelgada, chip M3.', 22499.00, '/img/default.png', 4),
('ASUS ROG Zephyrus G14', 'Laptop gamer.', 32000.00, '/img/default.png', 4),
('Dell XPS 13 Plus', 'Pantalla OLED.', 29000.00, '/img/default.png', 4),
('Sony WH-1000XM5', 'Cancelación de ruido.', 6500.00, '/img/default.png', 2),
('AirPods Pro 2', 'Audio espacial.', 4999.00, '/img/default.png', 2),
('Bose SoundLink Flex', 'Bluetooth resistente.', 3200.00, '/img/default.png', 2),
('PlayStation 5 Slim', 'Gráficos 4K.', 10999.00, '/img/default.png', 6),
('Xbox Series X', 'Consola potente.', 11500.00, '/img/default.png', 6),
('Nintendo Switch OLED', 'Modo portátil.', 6999.00, '/img/default.png', 6),
('Mouse Logitech MX Master 3S', 'Ergonómico.', 1800.00, '/img/default.png', 5),
('Teclado Mecánico Keychron K2', 'RGB mecánico.', 2100.00, '/img/default.png', 5),
('Hub USB-C 8 en 1', 'HDMI, USB, SD.', 800.00, '/img/default.png', 5),
('Echo Dot 5ta Gen', 'Alexa integrada.', 1200.00, '/img/default.png', 7),
('Google Nest Hub 2', 'Pantalla inteligente.', 1900.00, '/img/default.png', 7),
('Foco Inteligente Wiz', 'Colores WiFi.', 250.00, '/img/default.png', 7);

SELECT p.nombre, c.nombre AS categoria
FROM products p
JOIN categories c ON p.category_id = c.id;
ALTER TABLE orders ADD total DECIMAL(10,2) DEFAULT 0;



UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'iPhone 15 Pro' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/iPhone.png';

UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'Samsung Galaxy S24 Ultra' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/samsung.jpg';

UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'MacBook Air M3' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/macbook.jpg';

UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'Sony WH-1000XM5' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/sony.jpg';


UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'Google Pixel 8 Pro' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/pixel.jpg';

UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'Xiaomi 13T Pro' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/xiaomi.jpg';

UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'ASUS ROG Zephyrus G14' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/asus.jpg';

UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'Dell XPS 13 Plus' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/dell.jpg';


UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'AirPods Pro 2' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/airpods.jpg';

UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'Bose SoundLink Flex' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/bose.jpg';

UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'PlayStation 5 Slim' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/play.jpg';

UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'Xbox Series X' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/xbox.jpg';


UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'Nintendo Switch OLED' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/switch.jpg';

UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'Mouse Logitech MX Master 3S' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/logitech.jpg';

UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'Teclado Mecánico Keychron K2' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/keychron.jpg';

UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'Hub USB-C 8 en 1' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/hub.jpg';


UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'Echo Dot 5ta Gen' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/echo.jpg';

UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'Google Nest Hub 2' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/nest.jpg';

UPDATE products p
JOIN (SELECT id FROM products WHERE nombre = 'Foco Inteligente Wiz' LIMIT 1) x
ON p.id = x.id
SET p.imagen = '/img/foco.jpg';

SELECT nombre, imagen FROM products;



USE novastore;
-- Agregar columna stock (por defecto 0 si no se especifica)
ALTER TABLE products ADD COLUMN stock INT DEFAULT 0;
-- (Opcional) Darle stock inicial de 10 a todos los productos actuales para pruebas
SET SQL_SAFE_UPDATES = 0;
UPDATE products SET stock = 10;
SET SQL_SAFE_UPDATES = 1;

-- Creacion de tabla para alojar las imagenes de los productos

CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    imagen_url VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 2. Asegurarnos que la tabla products tenga stock (si no lo hiciste en el paso anterior)
-- Si ya lo hiciste y te da error, ignora esta línea.
ALTER TABLE products ADD COLUMN stock INT DEFAULT 0;

select * from products;


USE novastore;

-- ============================================
-- 1. TABLA DE MÉTODOS DE PAGO
-- ============================================
CREATE TABLE payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tipo ENUM('credito', 'debito', 'paypal') NOT NULL,
    nombre_titular VARCHAR(100) NOT NULL,
    ultimos_digitos VARCHAR(4) NOT NULL,  -- Solo guardamos los últimos 4 dígitos por seguridad
    fecha_expiracion VARCHAR(7),           -- Formato: MM/YYYY
    es_principal BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 2. AGREGAR MÉTODO DE PAGO A ORDERS
-- ============================================
ALTER TABLE orders 
ADD COLUMN payment_method_id INT,
ADD COLUMN estado ENUM('pendiente', 'pagado', 'cancelado') DEFAULT 'pagado',
ADD FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id);

-- ============================================
-- 3. TABLA DE CALIFICACIONES
-- ============================================
CREATE TABLE product_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    UNIQUE KEY unique_rating (product_id, user_id, order_id) -- Un usuario solo puede calificar una vez por orden
);

-- ============================================
-- 4. AGREGAR COLUMNA DE RATING PROMEDIO EN PRODUCTS
-- ============================================
ALTER TABLE products 
ADD COLUMN rating_promedio DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN total_ratings INT DEFAULT 0;

-- ============================================
-- 5. ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================
CREATE INDEX idx_payment_user ON payment_methods(user_id);
CREATE INDEX idx_ratings_product ON product_ratings(product_id);
CREATE INDEX idx_ratings_user ON product_ratings(user_id);

-- ============================================
-- 6. VERIFICAR ESTRUCTURA
-- ============================================
SHOW TABLES;
DESC payment_methods;
DESC product_ratings;
DESC products;
DESC orders;
