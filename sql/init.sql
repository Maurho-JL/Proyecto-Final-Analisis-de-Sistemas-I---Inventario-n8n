-- INVENTARIO AUTOMATIZADO

CREATE SCHEMA IF NOT EXISTS inventario;
SET search_path TO inventario, public;

-- TABLAS BASE

CREATE TABLE categorias (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE proveedores (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nombre TEXT NOT NULL,
    contacto TEXT,
    telefono TEXT,
    email TEXT,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE clientes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nombre TEXT NOT NULL DEFAULT 'Cliente General',
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- PRODUCTOS
-- =========================

CREATE TABLE productos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nombre TEXT NOT NULL,
    categoria_id BIGINT REFERENCES categorias(id),
    codigo TEXT UNIQUE,
    precio_venta NUMERIC(10,2) NOT NULL CHECK (precio_venta >= 0),
    stock_actual INT NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo INT DEFAULT 5,
    stock_maximo INT DEFAULT 100,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- MOVIMIENTOS
-- =========================

CREATE TABLE entradas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    producto_id BIGINT REFERENCES productos(id),
    proveedor_id BIGINT REFERENCES proveedores(id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    costo_unitario NUMERIC(10,2),
    notas TEXT,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE salidas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    producto_id BIGINT REFERENCES productos(id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    motivo TEXT,
    referencia_id BIGINT,
    notas TEXT,
    fecha TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ventas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    cliente_id BIGINT REFERENCES clientes(id),
    fecha TIMESTAMPTZ DEFAULT NOW(),
    total NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE detalle_venta (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    venta_id BIGINT REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES productos(id),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2)
);

-- =========================
-- ALERTAS
-- =========================

CREATE TABLE alertas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    producto_id BIGINT REFERENCES productos(id),
    tipo_alerta TEXT,
    mensaje TEXT,
    estado TEXT DEFAULT 'pendiente',
    fecha TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- ÍNDICES
-- =========================

-- Alertas: usado en cada UPDATE de productos
CREATE INDEX idx_alertas_producto_estado
    ON alertas(producto_id, estado);

-- Productos: filtro y JOIN por categoría
CREATE INDEX idx_productos_categoria
    ON productos(categoria_id);

-- Entradas: JOIN frecuente por producto y proveedor
CREATE INDEX idx_entradas_producto
    ON entradas(producto_id);

CREATE INDEX idx_entradas_proveedor
    ON entradas(proveedor_id);

-- Salidas: JOIN frecuente por producto
CREATE INDEX idx_salidas_producto
    ON salidas(producto_id);

-- Detalle venta: JOINs y recálculo de total
CREATE INDEX idx_detalle_venta_venta
    ON detalle_venta(venta_id);

CREATE INDEX idx_detalle_venta_producto
    ON detalle_venta(producto_id);

-- Ventas: filtro por cliente
CREATE INDEX idx_ventas_cliente
    ON ventas(cliente_id);

-- =========================
-- TRIGGERS Y FUNCIONES
-- =========================

-- -------------------------
-- Actualizar timestamp
-- -------------------------

CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_producto
BEFORE UPDATE ON productos
FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- -------------------------
-- Validación en salidas (con FOR UPDATE para evitar race condition)
-- -------------------------

CREATE OR REPLACE FUNCTION fn_validar_stock_salida()
RETURNS TRIGGER AS $$
DECLARE
    v_stock INT;
BEGIN
    SELECT stock_actual INTO v_stock
    FROM productos
    WHERE id = NEW.producto_id
    FOR UPDATE;

    IF v_stock < NEW.cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente para producto ID %. Disponible: %, Solicitado: %',
            NEW.producto_id, v_stock, NEW.cantidad;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_stock_salida
BEFORE INSERT ON salidas
FOR EACH ROW EXECUTE FUNCTION fn_validar_stock_salida();

-- -------------------------
-- Stock en entradas
-- -------------------------

CREATE OR REPLACE FUNCTION fn_stock_entrada()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productos
    SET stock_actual = stock_actual + NEW.cantidad
    WHERE id = NEW.producto_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_entrada
AFTER INSERT ON entradas
FOR EACH ROW EXECUTE FUNCTION fn_stock_entrada();

-- -------------------------
-- Stock en salidas
-- -------------------------

CREATE OR REPLACE FUNCTION fn_stock_salida()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productos
    SET stock_actual = stock_actual - NEW.cantidad
    WHERE id = NEW.producto_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_salida
AFTER INSERT ON salidas
FOR EACH ROW EXECUTE FUNCTION fn_stock_salida();

-- -------------------------
-- Procesar detalle venta:
--   INSERT → valida stock con FOR UPDATE y descuenta
--   DELETE → restaura stock
-- -------------------------

CREATE OR REPLACE FUNCTION fn_procesar_detalle_venta()
RETURNS TRIGGER AS $$
DECLARE
    v_stock INT;
BEGIN
    IF TG_OP = 'INSERT' THEN

        SELECT stock_actual INTO v_stock
        FROM productos
        WHERE id = NEW.producto_id
        FOR UPDATE;

        IF v_stock < NEW.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para producto ID %. Disponible: %, Solicitado: %',
                NEW.producto_id, v_stock, NEW.cantidad;
        END IF;

        UPDATE productos
        SET stock_actual = stock_actual - NEW.cantidad
        WHERE id = NEW.producto_id;

        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN

        UPDATE productos
        SET stock_actual = stock_actual + OLD.cantidad
        WHERE id = OLD.producto_id;

        RETURN OLD;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_procesar_detalle_venta
BEFORE INSERT OR DELETE ON detalle_venta
FOR EACH ROW EXECUTE FUNCTION fn_procesar_detalle_venta();

-- -------------------------
-- Total de venta:
--   INSERT / UPDATE / DELETE en detalle_venta recalcula ventas.total
--   En DELETE retorna OLD (NEW es NULL en ese caso)
-- -------------------------

CREATE OR REPLACE FUNCTION fn_actualizar_total_venta()
RETURNS TRIGGER AS $$
DECLARE
    v_venta_id BIGINT;
BEGIN
    v_venta_id := CASE
        WHEN TG_OP = 'DELETE' THEN OLD.venta_id
        ELSE NEW.venta_id
    END;

    UPDATE ventas
    SET total = (
        SELECT COALESCE(SUM(cantidad * precio_unitario), 0)
        FROM detalle_venta
        WHERE venta_id = v_venta_id
    )
    WHERE id = v_venta_id;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_total_venta
AFTER INSERT OR UPDATE OR DELETE ON detalle_venta
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_total_venta();

-- -------------------------
-- Alertas automáticas:
--   INSERT → alerta si stock ya viene bajo desde el inicio
--   UPDATE → crea alerta si baja, resuelve si sube
-- -------------------------

CREATE OR REPLACE FUNCTION fn_alertas()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_actual <= NEW.stock_minimo THEN
        IF NOT EXISTS (
            SELECT 1 FROM alertas
            WHERE producto_id = NEW.id AND estado = 'pendiente'
        ) THEN
            INSERT INTO alertas (producto_id, tipo_alerta, mensaje)
            VALUES (
                NEW.id,
                'stock_bajo',
                FORMAT(
                    'Producto ID %s bajo stock. Actual: %s, Mínimo: %s',
                    NEW.id, NEW.stock_actual, NEW.stock_minimo
                )
            );
        END IF;

    ELSIF NEW.stock_actual > NEW.stock_minimo THEN
        -- Solo aplica en UPDATE; en INSERT no hay alertas previas que resolver
        IF TG_OP = 'UPDATE' THEN
            UPDATE alertas
            SET estado = 'resuelta'
            WHERE producto_id = NEW.id AND estado = 'pendiente';
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Escucha INSERT y UPDATE para cubrir productos creados con stock bajo
CREATE TRIGGER trg_alertas
AFTER INSERT OR UPDATE ON productos
FOR EACH ROW EXECUTE FUNCTION fn_alertas();
