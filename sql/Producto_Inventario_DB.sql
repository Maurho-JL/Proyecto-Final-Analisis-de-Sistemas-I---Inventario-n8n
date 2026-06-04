-- ============================================================
-- DATOS DE EJEMPLO — TIENDA TECNOLÓGICA v2
-- IDs resueltos dinámicamente, sin asumir secuencias
-- ============================================================

SET search_path TO inventario, public;

-- =========================
-- CATEGORÍAS
-- =========================

INSERT INTO categorias (nombre, descripcion) VALUES
    ('Laptops',         'Computadoras portátiles de todas las marcas'),
    ('Celulares',       'Smartphones y teléfonos móviles'),
    ('Componentes',     'Hardware interno: RAM, SSD, GPU, procesadores'),
    ('Accesorios',      'Mouse, teclados, audífonos, webcams'),
    ('Monitores',       'Pantallas y monitores para escritorio'),
    ('Redes',           'Routers, switches, cables de red'),
    ('Almacenamiento',  'Discos duros externos, memorias USB, tarjetas SD'),
    ('Software',        'Licencias y suscripciones de software');

-- =========================
-- PROVEEDORES
-- =========================

INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES
    ('TechDistrib Guatemala',   'Carlos Méndez',  '2222-1111', 'ventas@techdistrib.gt'),
    ('ImportaTech S.A.',        'Ana Herrera',    '2333-4444', 'ana@importatech.gt'),
    ('Soluciones Digitales GT', 'Roberto Lima',   '5555-7777', 'roberto@soldig.gt'),
    ('Global Hardware CR',      'María Solís',    '2100-8888', 'msolis@globalhw.cr'),
    ('SoftLicencias MX',        'Jorge Castillo', '5566-9900', 'jcastillo@softlic.mx');

-- =========================
-- CLIENTES
-- =========================

INSERT INTO clientes (nombre) VALUES
    ('Cliente General'),
    ('Luis Fernando García'),
    ('Empresa TechSolutions S.A.'),
    ('María José López'),
    ('Universidad del Valle'),
    ('Pedro Alvarado'),
    ('Consultora Digital GT'),
    ('Andrea Morales'),
    ('Colegio Americano'),
    ('Diego Ramírez');

-- =========================
-- PRODUCTOS
-- (categoria_id resuelto por nombre, no por número)
-- =========================

INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Laptop ASUS VivoBook 15 i5 8GB',     id, 'LAP-001', 4599.00,  8, 3, 20 FROM categorias WHERE nombre = 'Laptops';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Laptop HP Pavilion 14 Ryzen 5',       id, 'LAP-002', 4199.00,  6, 3, 20 FROM categorias WHERE nombre = 'Laptops';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Laptop Lenovo IdeaPad 3 i3 4GB',      id, 'LAP-003', 3299.00, 10, 3, 25 FROM categorias WHERE nombre = 'Laptops';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Laptop Dell Inspiron 15 i7 16GB',     id, 'LAP-004', 7499.00,  4, 2, 15 FROM categorias WHERE nombre = 'Laptops';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'MacBook Air M2 8GB 256GB',            id, 'LAP-005',12999.00,  3, 2, 10 FROM categorias WHERE nombre = 'Laptops';

INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Samsung Galaxy A54 128GB',            id, 'CEL-001', 2499.00, 15, 5, 40 FROM categorias WHERE nombre = 'Celulares';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'iPhone 14 128GB Negro',               id, 'CEL-002', 8999.00,  5, 3, 15 FROM categorias WHERE nombre = 'Celulares';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Xiaomi Redmi Note 12 128GB',          id, 'CEL-003', 1699.00, 20, 5, 50 FROM categorias WHERE nombre = 'Celulares';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Motorola Moto G84 256GB',             id, 'CEL-004', 1999.00, 12, 5, 30 FROM categorias WHERE nombre = 'Celulares';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Samsung Galaxy S23 256GB',            id, 'CEL-005', 6999.00,  4, 2, 12 FROM categorias WHERE nombre = 'Celulares';

INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'RAM Kingston 8GB DDR4 3200MHz',       id, 'COM-001',  349.00, 25, 8, 60 FROM categorias WHERE nombre = 'Componentes';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'SSD Kingston 480GB SATA',             id, 'COM-002',  449.00, 20, 8, 50 FROM categorias WHERE nombre = 'Componentes';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'GPU NVIDIA GTX 1650 4GB',             id, 'COM-003', 2199.00,  6, 3, 15 FROM categorias WHERE nombre = 'Componentes';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Procesador Intel Core i5-12400',      id, 'COM-004', 1799.00,  8, 3, 20 FROM categorias WHERE nombre = 'Componentes';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'SSD NVMe Samsung 1TB M.2',            id, 'COM-005',  899.00, 15, 5, 40 FROM categorias WHERE nombre = 'Componentes';

INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Mouse Logitech M185 Inalámbrico',     id, 'ACC-001',  149.00, 30,10, 80 FROM categorias WHERE nombre = 'Accesorios';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Teclado Logitech K120 USB',           id, 'ACC-002',  179.00, 25,10, 70 FROM categorias WHERE nombre = 'Accesorios';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Audífonos Sony WH-CH520 Bluetooth',   id, 'ACC-003',  599.00, 12, 5, 30 FROM categorias WHERE nombre = 'Accesorios';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Webcam Logitech C270 HD',             id, 'ACC-004',  449.00, 18, 5, 40 FROM categorias WHERE nombre = 'Accesorios';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Mouse Pad XL Gamer RGB',              id, 'ACC-005',   99.00, 35,10, 80 FROM categorias WHERE nombre = 'Accesorios';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Hub USB-C 7 en 1',                    id, 'ACC-006',  349.00, 20, 8, 50 FROM categorias WHERE nombre = 'Accesorios';

INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Monitor LG 24" Full HD IPS',          id, 'MON-001', 1399.00, 10, 3, 25 FROM categorias WHERE nombre = 'Monitores';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Monitor Samsung 27" Curvo FHD',       id, 'MON-002', 1999.00,  7, 3, 20 FROM categorias WHERE nombre = 'Monitores';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Monitor ASUS 24" 144Hz Gaming',       id, 'MON-003', 2499.00,  5, 2, 15 FROM categorias WHERE nombre = 'Monitores';

INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Router TP-Link AX1500 WiFi 6',        id, 'RED-001',  699.00, 14, 5, 30 FROM categorias WHERE nombre = 'Redes';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Switch TP-Link 8 Puertos Gigabit',    id, 'RED-002',  349.00, 18, 5, 40 FROM categorias WHERE nombre = 'Redes';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Cable UTP Cat6 Patch 2m',             id, 'RED-003',   35.00, 80,20,200 FROM categorias WHERE nombre = 'Redes';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Adaptador USB a RJ45 Gigabit',        id, 'RED-004',  149.00, 30,10, 70 FROM categorias WHERE nombre = 'Redes';

INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Disco Duro Externo WD 1TB USB 3.0',   id, 'ALM-001',  699.00, 15, 5, 35 FROM categorias WHERE nombre = 'Almacenamiento';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Memoria USB SanDisk 64GB USB 3.1',    id, 'ALM-002',   99.00, 50,15,120 FROM categorias WHERE nombre = 'Almacenamiento';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Tarjeta SD SanDisk 128GB Class 10',   id, 'ALM-003',  149.00, 40,15,100 FROM categorias WHERE nombre = 'Almacenamiento';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Disco Duro Externo Seagate 2TB',      id, 'ALM-004',  999.00,  8, 3, 20 FROM categorias WHERE nombre = 'Almacenamiento';

INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Windows 11 Home Licencia Digital',    id, 'SOF-001',  899.00, 20, 5, 50 FROM categorias WHERE nombre = 'Software';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Microsoft Office 365 Personal 1 año', id, 'SOF-002',  699.00, 25, 5, 60 FROM categorias WHERE nombre = 'Software';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Antivirus ESET NOD32 1 año',          id, 'SOF-003',  299.00, 30,10, 70 FROM categorias WHERE nombre = 'Software';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'Adobe Acrobat Pro Licencia Anual',    id, 'SOF-004', 1299.00, 10, 3, 25 FROM categorias WHERE nombre = 'Software';
INSERT INTO productos (nombre, categoria_id, codigo, precio_venta, stock_actual, stock_minimo, stock_maximo)
SELECT 'AutoCAD LT Suscripción Anual',        id, 'SOF-005', 4999.00,  5, 2, 12 FROM categorias WHERE nombre = 'Software';

-- =========================
-- ENTRADAS DE INVENTARIO
-- (producto_id y proveedor_id resueltos por código/nombre)
-- =========================

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 10, 3800.00, 'Primer lote ASUS VivoBook'
FROM productos p, proveedores pr WHERE p.codigo = 'LAP-001' AND pr.nombre = 'TechDistrib Guatemala';

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 8, 3400.00, 'Primer lote HP Pavilion'
FROM productos p, proveedores pr WHERE p.codigo = 'LAP-002' AND pr.nombre = 'TechDistrib Guatemala';

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 15, 2600.00, 'Lote Lenovo IdeaPad'
FROM productos p, proveedores pr WHERE p.codigo = 'LAP-003' AND pr.nombre = 'ImportaTech S.A.';

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 5, 6200.00, 'Lote Dell Inspiron i7'
FROM productos p, proveedores pr WHERE p.codigo = 'LAP-004' AND pr.nombre = 'TechDistrib Guatemala';

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 4, 11500.00, 'MacBook Air M2'
FROM productos p, proveedores pr WHERE p.codigo = 'LAP-005' AND pr.nombre = 'Global Hardware CR';

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 20, 1900.00, 'Lote Samsung A54'
FROM productos p, proveedores pr WHERE p.codigo = 'CEL-001' AND pr.nombre = 'ImportaTech S.A.';

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 6, 7800.00, 'Lote iPhone 14'
FROM productos p, proveedores pr WHERE p.codigo = 'CEL-002' AND pr.nombre = 'Global Hardware CR';

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 25, 1200.00, 'Lote Xiaomi Redmi Note 12'
FROM productos p, proveedores pr WHERE p.codigo = 'CEL-003' AND pr.nombre = 'ImportaTech S.A.';

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 30, 250.00, 'RAM Kingston DDR4'
FROM productos p, proveedores pr WHERE p.codigo = 'COM-001' AND pr.nombre = 'TechDistrib Guatemala';

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 25, 320.00, 'SSD Kingston 480GB'
FROM productos p, proveedores pr WHERE p.codigo = 'COM-002' AND pr.nombre = 'TechDistrib Guatemala';

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 40, 90.00, 'Mouse Logitech M185'
FROM productos p, proveedores pr WHERE p.codigo = 'ACC-001' AND pr.nombre = 'Soluciones Digitales GT';

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 35, 110.00, 'Teclado Logitech K120'
FROM productos p, proveedores pr WHERE p.codigo = 'ACC-002' AND pr.nombre = 'Soluciones Digitales GT';

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 12, 1050.00, 'Monitor LG 24"'
FROM productos p, proveedores pr WHERE p.codigo = 'MON-001' AND pr.nombre = 'TechDistrib Guatemala';

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 20, 480.00, 'Router TP-Link WiFi 6'
FROM productos p, proveedores pr WHERE p.codigo = 'RED-001' AND pr.nombre = 'Soluciones Digitales GT';

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 20, 480.00, 'Disco WD 1TB'
FROM productos p, proveedores pr WHERE p.codigo = 'ALM-001' AND pr.nombre = 'ImportaTech S.A.';

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 30, 600.00, 'Windows 11 Home licencias'
FROM productos p, proveedores pr WHERE p.codigo = 'SOF-001' AND pr.nombre = 'SoftLicencias MX';

INSERT INTO entradas (producto_id, proveedor_id, cantidad, costo_unitario, notas)
SELECT p.id, pr.id, 35, 450.00, 'Office 365 Personal'
FROM productos p, proveedores pr WHERE p.codigo = 'SOF-002' AND pr.nombre = 'SoftLicencias MX';

-- =========================
-- VENTAS CON RETURNING id
-- (nunca se asume el ID de la venta)
-- =========================

-- Venta 1: Luis Fernando García
WITH v AS (
    INSERT INTO ventas (cliente_id, fecha)
    SELECT id, NOW() - INTERVAL '10 days' FROM clientes WHERE nombre = 'Luis Fernando García'
    RETURNING id
)
INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario)
SELECT v.id, p.id, d.cantidad, d.precio_unitario
FROM v
JOIN (
    VALUES
        ('LAP-003', 1, 3299.00),
        ('ACC-002', 1,  179.00),
        ('ACC-001', 1,  149.00)
) AS d(codigo, cantidad, precio_unitario) ON TRUE
JOIN productos p ON p.codigo = d.codigo;

-- Venta 2: Empresa TechSolutions S.A.
WITH v AS (
    INSERT INTO ventas (cliente_id, fecha)
    SELECT id, NOW() - INTERVAL '8 days' FROM clientes WHERE nombre = 'Empresa TechSolutions S.A.'
    RETURNING id
)
INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario)
SELECT v.id, p.id, d.cantidad, d.precio_unitario
FROM v
JOIN (
    VALUES
        ('MON-001', 3, 1399.00),
        ('ACC-002', 3,  179.00),
        ('ACC-001', 3,  149.00)
) AS d(codigo, cantidad, precio_unitario) ON TRUE
JOIN productos p ON p.codigo = d.codigo;

-- Venta 3: María José López
WITH v AS (
    INSERT INTO ventas (cliente_id, fecha)
    SELECT id, NOW() - INTERVAL '6 days' FROM clientes WHERE nombre = 'María José López'
    RETURNING id
)
INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario)
SELECT v.id, p.id, d.cantidad, d.precio_unitario
FROM v
JOIN (
    VALUES
        ('CEL-001', 1, 2499.00),
        ('ACC-003', 1,  599.00),
        ('ALM-002', 1,   99.00)
) AS d(codigo, cantidad, precio_unitario) ON TRUE
JOIN productos p ON p.codigo = d.codigo;

-- Venta 4: Universidad del Valle
WITH v AS (
    INSERT INTO ventas (cliente_id, fecha)
    SELECT id, NOW() - INTERVAL '4 days' FROM clientes WHERE nombre = 'Universidad del Valle'
    RETURNING id
)
INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario)
SELECT v.id, p.id, d.cantidad, d.precio_unitario
FROM v
JOIN (
    VALUES
        ('SOF-002', 5,  699.00),
        ('SOF-001', 5,  899.00),
        ('SOF-003', 5,  299.00)
) AS d(codigo, cantidad, precio_unitario) ON TRUE
JOIN productos p ON p.codigo = d.codigo;

-- Venta 5: Pedro Alvarado
WITH v AS (
    INSERT INTO ventas (cliente_id, fecha)
    SELECT id, NOW() - INTERVAL '2 days' FROM clientes WHERE nombre = 'Pedro Alvarado'
    RETURNING id
)
INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario)
SELECT v.id, p.id, d.cantidad, d.precio_unitario
FROM v
JOIN (
    VALUES
        ('LAP-001', 1, 4599.00),
        ('COM-001', 2,  349.00),
        ('COM-002', 1,  449.00)
) AS d(codigo, cantidad, precio_unitario) ON TRUE
JOIN productos p ON p.codigo = d.codigo;

-- Venta 6: Consultora Digital GT
WITH v AS (
    INSERT INTO ventas (cliente_id, fecha)
    SELECT id, NOW() - INTERVAL '1 day' FROM clientes WHERE nombre = 'Consultora Digital GT'
    RETURNING id
)
INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario)
SELECT v.id, p.id, d.cantidad, d.precio_unitario
FROM v
JOIN (
    VALUES
        ('LAP-004', 1, 7499.00),
        ('MON-002', 1, 1999.00),
        ('RED-002', 1,  349.00)
) AS d(codigo, cantidad, precio_unitario) ON TRUE
JOIN productos p ON p.codigo = d.codigo;

-- =========================
-- SALIDAS MANUALES
-- (producto_id resuelto por código)
-- =========================

INSERT INTO salidas (producto_id, cantidad, motivo, notas)
SELECT id, 2, 'merma', 'Mouse pads dañados en bodega'
FROM productos WHERE codigo = 'ACC-005';

INSERT INTO salidas (producto_id, cantidad, motivo, notas)
SELECT id, 3, 'ajuste', 'Ajuste de inventario físico cables UTP'
FROM productos WHERE codigo = 'RED-003';

INSERT INTO salidas (producto_id, cantidad, motivo, notas)
SELECT id, 1, 'merma', 'Tarjeta SD defectuosa detectada en revisión'
FROM productos WHERE codigo = 'ALM-003';

-- =========================
-- VERIFICACIÓN FINAL
-- =========================

-- Stock actual por producto
SELECT
    p.codigo,
    p.nombre,
    c.nombre        AS categoria,
    p.stock_actual,
    p.stock_minimo,
    CASE
        WHEN p.stock_actual <= p.stock_minimo THEN 'Stock bajo'
        ELSE 'OK'
    END             AS estado_stock,
    p.precio_venta
FROM productos p
JOIN categorias c ON c.id = p.categoria_id
ORDER BY c.nombre, p.nombre;

-- Ventas con totales
SELECT
    v.id,
    cl.nombre       AS cliente,
    v.fecha::DATE   AS fecha,
    v.total
FROM ventas v
JOIN clientes cl ON cl.id = v.cliente_id
ORDER BY v.fecha;

-- Alertas generadas
SELECT
    a.id,
    p.nombre        AS producto,
    a.tipo_alerta,
    a.mensaje,
    a.estado,
    a.fecha::DATE
FROM alertas a
JOIN productos p ON p.id = a.producto_id
ORDER BY a.fecha DESC;