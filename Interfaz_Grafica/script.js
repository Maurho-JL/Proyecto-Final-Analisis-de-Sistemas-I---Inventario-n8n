// ===========================
// CONFIGURACIÓN
// ===========================
const N8N = 'http://localhost:5678/webhook';

// ===========================
// UTILIDADES
// ===========================
function badge(estado) {
    if (estado === 'disponible') return `<span class="badge badge-verde">Disponible</span>`;
    if (estado === 'stock_bajo') return `<span class="badge badge-amarillo">Stock bajo</span>`;
    if (estado === 'agotado')    return `<span class="badge badge-rojo">Agotado</span>`;
    return `<span class="badge badge-azul">${estado}</span>`;
}

function badgeCliente(cat) {
    if (cat === 'VIP')       return `<span class="badge badge-azul">VIP</span>`;
    if (cat === 'frecuente') return `<span class="badge badge-verde">Frecuente</span>`;
    if (cat === 'ocasional') return `<span class="badge badge-amarillo">Ocasional</span>`;
    return `<span class="badge">${cat}</span>`;
}

function mostrarResultado(id, tipo, mensaje) {
    const el = document.getElementById(id);
    el.className = `resultado ${tipo}`;
    el.innerHTML = mensaje;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
}

function Q(val) {
    return `Q${parseFloat(val).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ===========================
// NAVEGACIÓN
// ===========================
function mostrarSeccion(id, el) {
    document.querySelectorAll('.seccion').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.menu-item').forEach(a => a.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    if (el) el.classList.add('active');

    // Cargar datos al entrar a cada sección
    if (id === 'dashboard')       cargarDashboard();
    if (id === 'entrada')         cargarDatosEntrada();
    if (id === 'salida')          cargarDatosSalida();
    if (id === 'precio')          cargarDatosPrecio();
    if (id === 'nueva-venta')     cargarDatosVenta();
    if (id === 'inventario')      cargarInventario();
    if (id === 'historial-ventas') cargarHistorialVentas();
    if (id === 'clientes')        cargarClientesFrecuentes();
}

// Fecha en topbar
function actualizarFecha() {
    const ahora = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('topbar-fecha').textContent =
        ahora.toLocaleDateString('es-GT', opciones);
}

// ===========================
// DASHBOARD
// ===========================
async function cargarDashboard() {
    try {
        // Resumen diario
        const resD = await fetch(`${N8N}/resumen-diario`);
        const dataD = await resD.json();
        const d = Array.isArray(dataD) ? dataD[0] : dataD;
        document.getElementById('stat-ventas').textContent  = d.total_ventas || 0;
        document.getElementById('stat-ingresos').textContent = Q(d.ingresos_totales || 0);
        document.getElementById('stat-ticket').textContent   = Q(d.ticket_promedio || 0);

        // Stock
        const resS = await fetch(`${N8N}/consultar-stock`);
        const dataS = await resS.json();
        const productos = Array.isArray(dataS) ? dataS : [dataS];
        document.getElementById('stat-productos').textContent = productos.length;
        const bajos = productos.filter(p => p.estado !== 'disponible').length;
        document.getElementById('stat-stock-bajo').textContent =
            bajos > 0 ? ` ${bajos} con alerta` : ' Todo en orden';
        document.getElementById('stat-alertas').textContent = bajos;

        // Tabla dashboard
        const tbody = document.getElementById('tbody-dashboard');
        tbody.innerHTML = productos.map(p => `
            <tr>
                <td><code>${p.codigo}</code></td>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td>${p.stock_actual}</td>
                <td>${p.stock_minimo}</td>
                <td>${Q(p.precio_venta)}</td>
                <td>${badge(p.estado)}</td>
            </tr>
        `).join('');

    } catch (e) {
        console.error('Error dashboard:', e);
        document.getElementById('tbody-dashboard').innerHTML =
            '<tr><td colspan="7" class="loading">Error al cargar datos</td></tr>';
    }
}

// ===========================
// INVENTARIO
// ===========================
let todosProductos = [];

async function cargarInventario() {
    try {
        // Cargar categorías dinámicas
        await cargarFiltrosCategorias();

        const res = await fetch(`${N8N}/consultar-stock`);
        const data = await res.json();
        todosProductos = Array.isArray(data) ? data : [data];
        renderTablaInventario(todosProductos);
    } catch (e) {
        document.getElementById('tbody-inventario').innerHTML =
            '<tr><td colspan="9" class="loading">Error al cargar inventario</td></tr>';
    }
}

async function cargarFiltrosCategorias() {
    try {
        const res = await fetch(`${N8N}/consultar-categorias`);
        const data = await res.json();
        const categorias = Array.isArray(data) ? data : [data];
        const wrap = document.getElementById('filtros-categoria');
        wrap.innerHTML = `<button class="btn-filtro active" onclick="filtrarCategoria('todas', this)">Todas</button>`;
        categorias.forEach(c => {
            wrap.innerHTML += `<button class="btn-filtro" onclick="filtrarCategoria('${c.nombre}', this)">${c.nombre}</button>`;
        });
    } catch (e) { console.error('Error categorías:', e); }
}

function renderTablaInventario(productos) {
    const tbody = document.getElementById('tbody-inventario');
    tbody.innerHTML = productos.length === 0
        ? '<tr><td colspan="9" class="loading">Sin productos</td></tr>'
        : productos.map(p => `
            <tr>
                <td>${p.id}</td>
                <td><code>${p.codigo}</code></td>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td>${Q(p.precio_venta)}</td>
                <td><b>${p.stock_actual}</b></td>
                <td>${p.stock_minimo}</td>
                <td>${p.stock_maximo}</td>
                <td>${badge(p.estado)}</td>
            </tr>
        `).join('');
}

function filtrarCategoria(categoria, el) {
    document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    if (categoria === 'todas') {
        renderTablaInventario(todosProductos);
    } else {
        const filtrados = todosProductos.filter(p => p.categoria === categoria);
        renderTablaInventario(filtrados);
    }
}

async function buscarProducto(valor) {
    if (valor.length < 2) { renderTablaInventario(todosProductos); return; }
    try {
        const res = await fetch(`${N8N}/buscar-producto?buscar=${encodeURIComponent(valor)}`);
        const data = await res.json();
        const productos = Array.isArray(data) ? data : [data];
        const tbody = document.getElementById('tbody-inventario');
        tbody.innerHTML = productos.length === 0
            ? '<tr><td colspan="9" class="loading">Sin resultados</td></tr>'
            : productos.map(p => `
                <tr>
                    <td>${p.id}</td>
                    <td><code>${p.codigo}</code></td>
                    <td>${p.nombre}</td>
                    <td>${p.categoria}</td>
                    <td>${Q(p.precio_venta)}</td>
                    <td><b>${p.stock_actual}</b></td>
                    <td>${p.stock_minimo}</td>
                    <td>${p.stock_maximo}</td>
                    <td>${badge(p.estado)}</td>
                </tr>
            `).join('');
    } catch (e) { console.error(e); }
}

// ===========================
// ENTRADA
// ===========================
document.addEventListener('DOMContentLoaded', () => {

    actualizarFecha();
    cargarDashboard();

    // Formulario nuevo producto
    document.getElementById('formNuevoProducto').addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            codigo:       document.getElementById('np-codigo').value.toUpperCase(),
            nombre:       document.getElementById('np-nombre').value,
            categoria_id: parseInt(document.getElementById('np-categoria').value),
            precio_venta: parseFloat(document.getElementById('np-precio').value),
            stock_actual: parseInt(document.getElementById('np-stock').value),
            stock_minimo: parseInt(document.getElementById('np-minimo').value),
            stock_maximo: parseInt(document.getElementById('np-maximo').value)
        };
        try {
            const res = await fetch(`${N8N}/registrar-producto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            const d = Array.isArray(data) ? data[0] : data;
            mostrarResultado('np-resultado', 'exito',
                `Producto registrado correctamente. ID: ${d.id} | Código: ${d.codigo} | ${d.nombre}`);
            e.target.reset();
        } catch (err) {
            mostrarResultado('np-resultado', 'error', 'Error al registrar el producto. Verifique que el código no esté duplicado.');
        }
    });

}); // FIN DOMContentLoaded

// ===========================
// ENTRADA — búsqueda dinámica
// ===========================
let productosCache = [];
let proveedoresCache = [];

async function cargarDatosEntrada() {
    try {
        // Cargar productos
        const resP = await fetch(`${N8N}/consultar-stock`);
        const dataP = await resP.json();
        productosCache = Array.isArray(dataP) ? dataP : [dataP];

        // Cargar categorías en select
        const resC = await fetch(`${N8N}/consultar-categorias`);
        const dataC = await resC.json();
        const categorias = Array.isArray(dataC) ? dataC : [dataC];
        const select = document.getElementById('entrada-categoria-filtro');
        select.innerHTML = '<option value="">Todas las categorías</option>';
        categorias.forEach(c => {
            select.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
        });

        // Cargar proveedores
        const resPr = await fetch(`${N8N}/consultar-proveedores`);
        const dataPr = await resPr.json();
        proveedoresCache = Array.isArray(dataPr) ? dataPr : [dataPr];

    } catch (e) { console.error('Error cargando datos entrada:', e); }
}

function buscarProductoEntrada(valor) {
    const categoria = document.getElementById('entrada-categoria-filtro').value;
    let filtrados = productosCache;

    if (productosCache.length === 0) {
        cargarDatosEntrada().then(() => buscarProductoEntrada(valor));
        return;
    }

    if (categoria) filtrados = filtrados.filter(p => p.categoria === categoria);
    if (valor.length >= 1) {
        filtrados = filtrados.filter(p =>
            p.nombre.toLowerCase().includes(valor.toLowerCase()) ||
            p.codigo.toLowerCase().includes(valor.toLowerCase()) ||
            p.id.toString() === valor
        );
    }

    if (valor.length === 0 && !categoria) {
        document.getElementById('entrada-lista-productos').style.display = 'none';
        return;
    }

    mostrarListaProductos(filtrados);
}

function filtrarProductosEntrada() {
    const valor = document.getElementById('entrada-buscar-producto').value;
    const categoria = document.getElementById('entrada-categoria-filtro').value;
    let filtrados = productosCache;

    if (categoria) filtrados = filtrados.filter(p => p.categoria === categoria);
    if (valor.length >= 1) {
        filtrados = filtrados.filter(p =>
            p.nombre.toLowerCase().includes(valor.toLowerCase()) ||
            p.codigo.toLowerCase().includes(valor.toLowerCase()) ||
            p.id.toString() === valor
        );
    }
    mostrarListaProductos(filtrados);
}

function mostrarListaProductos(productos) {
    const lista = document.getElementById('entrada-lista-productos');
    const tbody = document.getElementById('tbody-entrada-productos');

    if (productos.length === 0) {
        lista.style.display = 'none';
        tbody.innerHTML = '';
        return;
    }

    tbody.innerHTML = productos.map(p => `
        <tr onclick="seleccionarProductoEntrada(${p.id}, '${p.codigo}', '${p.nombre.replace(/'/g, "\\'")}')">
            <td>${p.id}</td>
            <td><code>${p.codigo}</code></td>
            <td>${p.nombre}</td>
            <td>${p.categoria}</td>
            <td>${p.stock_actual}</td>
            <td><button type="button" class="btn btn-sm btn-primary" onclick="seleccionarProductoEntrada(${p.id}, '${p.codigo}', '${p.nombre.replace(/'/g, "\\'")}')">Seleccionar</button></td>
        </tr>
    `).join('');

    lista.removeAttribute('style');
    lista.style.display = 'block';
    lista.style.marginBottom = '12px';
}

function seleccionarProductoEntrada(id, codigo, nombre) {
    document.getElementById('entrada-producto').value = id;
    document.getElementById('entrada-producto-texto').textContent = ` ${id} — ${codigo} — ${nombre}`;
    document.getElementById('entrada-producto-seleccionado').style.display = 'flex';
    document.getElementById('entrada-lista-productos').style.display = 'none';
    document.getElementById('entrada-buscar-producto').value = '';
}

function limpiarProductoEntrada() {
    document.getElementById('entrada-producto').value = '';
    document.getElementById('entrada-producto-seleccionado').style.display = 'none';
    document.getElementById('entrada-buscar-producto').value = '';
}

function buscarProveedorEntrada(valor) {
    if (proveedoresCache.length === 0) {
        cargarDatosEntrada().then(() => buscarProveedorEntrada(valor));
        return;
    }

    let filtrados = proveedoresCache;
    if (valor.length >= 1) {
        filtrados = filtrados.filter(p =>
            p.nombre.toLowerCase().includes(valor.toLowerCase()) ||
            p.id.toString() === valor
        );
    }

    if (valor.length === 0) {
        document.getElementById('entrada-lista-proveedores').style.display = 'none';
        return;
    }

    mostrarListaProveedores(filtrados);
}

function mostrarListaProveedores(proveedores) {
    const lista = document.getElementById('entrada-lista-proveedores');
    const tbody = document.getElementById('tbody-entrada-proveedores');

    if (proveedores.length === 0) {
        lista.style.display = 'none';
        tbody.innerHTML = '';
        return;
    }

    tbody.innerHTML = proveedores.map(p => `
        <tr onclick="seleccionarProveedorEntrada(${p.id}, '${p.nombre.replace(/'/g, "\\'")}')">
            <td>${p.id}</td>
            <td>${p.nombre}</td>
            <td>${p.contacto || '—'}</td>
            <td>${p.telefono || '—'}</td>
            <td><button type="button" class="btn btn-sm btn-primary" onclick="seleccionarProveedorEntrada(${p.id}, '${p.nombre.replace(/'/g, "\\'")}')">Seleccionar</button></td>
        </tr>
    `).join('');

    lista.removeAttribute('style');
    lista.style.display = 'block';
    lista.style.marginBottom = '12px';
}

function seleccionarProveedorEntrada(id, nombre) {
    document.getElementById('entrada-proveedor').value = id;
    document.getElementById('entrada-proveedor-texto').textContent = ` ${id} — ${nombre}`;
    document.getElementById('entrada-proveedor-seleccionado').style.display = 'flex';
    document.getElementById('entrada-lista-proveedores').style.display = 'none';
    document.getElementById('entrada-buscar-proveedor').value = '';
}

function limpiarProveedorEntrada() {
    document.getElementById('entrada-proveedor').value = '';
    document.getElementById('entrada-proveedor-seleccionado').style.display = 'none';
    document.getElementById('entrada-buscar-proveedor').value = '';
}

function limpiarFormEntrada() {
    limpiarProductoEntrada();
    limpiarProveedorEntrada();
    document.getElementById('entrada-lista-productos').style.display = 'none';
    document.getElementById('entrada-lista-proveedores').style.display = 'none';
}

// Submit de entrada — registrado al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('formEntrada').addEventListener('submit', async (e) => {
        e.preventDefault();
        const productoId = document.getElementById('entrada-producto').value;
        const proveedorId = document.getElementById('entrada-proveedor').value;
        if (!productoId) { alert('Seleccione un producto de la lista.'); return; }
        if (!proveedorId) { alert('Seleccione un proveedor de la lista.'); return; }
        const body = {
            producto_id:    parseInt(productoId),
            proveedor_id:   parseInt(proveedorId),
            cantidad:       parseInt(document.getElementById('entrada-cantidad').value),
            costo_unitario: parseFloat(document.getElementById('entrada-costo').value),
            notas:          document.getElementById('entrada-notas').value
        };
        try {
            const res = await fetch(`${N8N}/registrar-entrada`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            const d = Array.isArray(data) ? data[0] : data;
            mostrarResultado('entrada-resultado', 'exito',
                `Entrada registrada. Producto: ${d.nombre_producto} | Cantidad: ${body.cantidad} unidades`);
            document.getElementById('formEntrada').reset();
            limpiarFormEntrada();
        } catch (err) {
            mostrarResultado('entrada-resultado', 'error', 'Error al registrar la entrada.');
        }
    });
});

// ===========================
// ===========================
// ===========================
// VENTA — búsqueda dinámica
// ===========================
let clientesCache = [];
let carritoVenta = [];

async function cargarDatosVenta() {
    try {
        const resP = await fetch(`${N8N}/consultar-stock`);
        const dataP = await resP.json();
        productosCache = Array.isArray(dataP) ? dataP : [dataP];

        const resC = await fetch(`${N8N}/consultar-categorias`);
        const dataC = await resC.json();
        const categorias = Array.isArray(dataC) ? dataC : [dataC];
        const select = document.getElementById('venta-categoria-filtro');
        select.innerHTML = '<option value="">Todas las categorías</option>';
        categorias.forEach(c => {
            select.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
        });

        const resCl = await fetch(`${N8N}/clientes-frecuentes`);
        const dataCl = await resCl.json();
        clientesCache = Array.isArray(dataCl) ? dataCl : [dataCl];
    } catch (e) { console.error('Error cargando datos venta:', e); }
}

function buscarClienteVenta(valor) {
    if (clientesCache.length === 0) {
        cargarDatosVenta().then(() => buscarClienteVenta(valor));
        return;
    }
    if (valor.length === 0) {
        document.getElementById('venta-lista-clientes').style.display = 'none';
        return;
    }
    const filtrados = clientesCache.filter(c =>
        c.cliente.toLowerCase().includes(valor.toLowerCase()) ||
        c.id.toString() === valor
    );
    mostrarListaClientesVenta(filtrados);
}

function mostrarListaClientesVenta(clientes) {
    const lista = document.getElementById('venta-lista-clientes');
    const tbody = document.getElementById('tbody-venta-clientes');
    if (clientes.length === 0) {
        lista.style.display = 'none';
        return;
    }
    tbody.innerHTML = clientes.map(c => `
        <tr onclick="seleccionarClienteVenta(${c.id}, '${c.cliente.replace(/'/g, "\\'")}')">
            <td>${c.id}</td>
            <td>${c.cliente}</td>
            <td>${c.total_compras}</td>
            <td>Q${c.total_gastado}</td>
            <td><button type="button" class="btn btn-sm btn-primary">Seleccionar</button></td>
        </tr>
    `).join('');
    lista.removeAttribute('style');
    lista.style.display = 'block';
    lista.style.marginBottom = '12px';
}

function seleccionarClienteVenta(id, nombre) {
    document.getElementById('venta-cliente').value = id;
    document.getElementById('venta-cliente-texto').textContent = ` ${id} — ${nombre}`;
    document.getElementById('venta-cliente-seleccionado').style.display = 'flex';
    document.getElementById('venta-lista-clientes').style.display = 'none';
    document.getElementById('venta-buscar-cliente').value = '';
    actualizarResumenVenta();
}

function limpiarClienteVenta() {
    document.getElementById('venta-cliente').value = '';
    document.getElementById('venta-cliente-seleccionado').style.display = 'none';
    document.getElementById('venta-buscar-cliente').value = '';
    actualizarResumenVenta();
}

function buscarProductoVenta(valor) {
    if (productosCache.length === 0) {
        cargarDatosVenta().then(() => buscarProductoVenta(valor));
        return;
    }
    const categoria = document.getElementById('venta-categoria-filtro').value;
    let filtrados = productosCache;
    if (categoria) filtrados = filtrados.filter(p => p.categoria === categoria);
    if (valor.length >= 1) {
        filtrados = filtrados.filter(p =>
            p.nombre.toLowerCase().includes(valor.toLowerCase()) ||
            p.codigo.toLowerCase().includes(valor.toLowerCase()) ||
            p.id.toString() === valor
        );
    }
    if (valor.length === 0 && !categoria) {
        document.getElementById('venta-lista-productos').style.display = 'none';
        return;
    }
    mostrarListaProductosVenta(filtrados);
}

function filtrarProductosVenta() {
    const valor = document.getElementById('venta-buscar-producto').value;
    const categoria = document.getElementById('venta-categoria-filtro').value;
    let filtrados = productosCache;
    if (categoria) filtrados = filtrados.filter(p => p.categoria === categoria);
    if (valor.length >= 1) {
        filtrados = filtrados.filter(p =>
            p.nombre.toLowerCase().includes(valor.toLowerCase()) ||
            p.codigo.toLowerCase().includes(valor.toLowerCase()) ||
            p.id.toString() === valor
        );
    }
    mostrarListaProductosVenta(filtrados);
}

function mostrarListaProductosVenta(productos) {
    const lista = document.getElementById('venta-lista-productos');
    const tbody = document.getElementById('tbody-venta-productos');
    if (productos.length === 0) {
        lista.style.display = 'none';
        return;
    }
    tbody.innerHTML = productos.map(p => `
        <tr>
            <td>${p.id}</td>
            <td><code>${p.codigo}</code></td>
            <td>${p.nombre}</td>
            <td>${p.categoria}</td>
            <td><b>Q${p.precio_venta}</b></td>
            <td>${p.stock_actual}</td>
            <td><button type="button" class="btn btn-sm btn-primary" onclick="agregarAlCarrito(${p.id}, '${p.nombre.replace(/'/g, "\\'")}', ${p.precio_venta}, ${p.stock_actual})">+ Agregar</button></td>
        </tr>
    `).join('');
    lista.removeAttribute('style');
    lista.style.display = 'block';
    lista.style.marginBottom = '12px';
}

function agregarAlCarrito(id, nombre, precio, stock) {
    const existente = carritoVenta.find(i => i.id === id);
    if (existente) {
        if (existente.cantidad < stock) {
            existente.cantidad++;
        } else {
            alert(`Stock máximo disponible: ${stock}`);
            return;
        }
    } else {
        carritoVenta.push({ id, nombre, precio, cantidad: 1, stock });
    }
    renderCarrito();
    document.getElementById('venta-buscar-producto').value = '';
    document.getElementById('venta-lista-productos').style.display = 'none';
}

function cambiarCantidadCarrito(id, cantidad) {
    const item = carritoVenta.find(i => i.id === id);
    if (!item) return;
    if (cantidad < 1) { eliminarDelCarrito(id); return; }
    if (cantidad > item.stock) { alert(`Stock máximo: ${item.stock}`); return; }
    item.cantidad = parseInt(cantidad);
    renderCarrito();
}

function eliminarDelCarrito(id) {
    carritoVenta = carritoVenta.filter(i => i.id !== id);
    renderCarrito();
}

function renderCarrito() {
    const carrito = document.getElementById('venta-carrito');
    const tbody = document.getElementById('tbody-carrito');
    if (carritoVenta.length === 0) {
        carrito.style.display = 'none';
        document.getElementById('venta-total').textContent = 'Q0.00';
        actualizarResumenVenta();
        return;
    }
    carrito.style.display = 'block';
    tbody.innerHTML = carritoVenta.map(i => `
        <tr>
            <td>${i.nombre}</td>
            <td>Q${i.precio}</td>
            <td>
                <input type="number" value="${i.cantidad}" min="1" max="${i.stock}"
                    style="width:60px; padding:4px 8px; border:1px solid var(--border); border-radius:4px; text-align:center;"
                    onchange="cambiarCantidadCarrito(${i.id}, this.value)">
            </td>
            <td><b>Q${(i.precio * i.cantidad).toFixed(2)}</b></td>
            <td><button type="button" class="btn btn-danger btn-sm" onclick="eliminarDelCarrito(${i.id})">✕</button></td>
        </tr>
    `).join('');
    const total = carritoVenta.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
    document.getElementById('venta-total').textContent = Q(total);
    actualizarResumenVenta();
}

function actualizarResumenVenta() {
    const clienteId = document.getElementById('venta-cliente').value;
    const clienteTexto = document.getElementById('venta-cliente-texto').textContent;
    const total = carritoVenta.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
    const resumen = document.getElementById('venta-resumen');
    if (!clienteId || carritoVenta.length === 0) {
        resumen.innerHTML = '<span style="color:var(--text3)">Seleccione cliente y agregue productos para confirmar.</span>';
    } else {
        resumen.innerHTML = `
            <b>Cliente:</b> ${clienteTexto.replace(' ', '')}<br>
            <b>Productos:</b> ${carritoVenta.length} | <b>Total:</b> ${Q(total)}
        `;
    }
}

async function registrarVenta() {
    const clienteId = document.getElementById('venta-cliente').value;
    if (!clienteId) { alert('Seleccione un cliente.'); return; }
    if (carritoVenta.length === 0) { alert('Agregue al menos un producto.'); return; }
    const body = {
        cliente_id: parseInt(clienteId),
        detalle: carritoVenta.map(i => ({
            producto_id: i.id,
            cantidad: i.cantidad,
            precio_unitario: i.precio
        }))
    };
    try {
        const res = await fetch(`${N8N}/registrar-venta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        const total = carritoVenta.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
        mostrarResultado('venta-resultado', 'exito',
            `Venta registrada. ${carritoVenta.length} producto(s) | Total: ${Q(total)}`);
        limpiarFormVenta();
    } catch (err) {
        mostrarResultado('venta-resultado', 'error', 'Error al registrar la venta. Verifique el stock.');
    }
}

function limpiarFormVenta() {
    carritoVenta = [];
    limpiarClienteVenta();
    renderCarrito();
    document.getElementById('venta-buscar-producto').value = '';
    document.getElementById('venta-lista-productos').style.display = 'none';
}

// PRECIO — búsqueda dinámica
// ===========================
async function cargarDatosPrecio() {
    try {
        const resP = await fetch(`${N8N}/consultar-stock`);
        const dataP = await resP.json();
        productosCache = Array.isArray(dataP) ? dataP : [dataP];

        const resC = await fetch(`${N8N}/consultar-categorias`);
        const dataC = await resC.json();
        const categorias = Array.isArray(dataC) ? dataC : [dataC];
        const select = document.getElementById('precio-categoria-filtro');
        select.innerHTML = '<option value="">Todas las categorías</option>';
        categorias.forEach(c => {
            select.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
        });
    } catch (e) { console.error('Error cargando datos precio:', e); }
}

function buscarProductoPrecio(valor) {
    if (productosCache.length === 0) {
        cargarDatosPrecio().then(() => buscarProductoPrecio(valor));
        return;
    }
    const categoria = document.getElementById('precio-categoria-filtro').value;
    let filtrados = productosCache;
    if (categoria) filtrados = filtrados.filter(p => p.categoria === categoria);
    if (valor.length >= 1) {
        filtrados = filtrados.filter(p =>
            p.nombre.toLowerCase().includes(valor.toLowerCase()) ||
            p.codigo.toLowerCase().includes(valor.toLowerCase()) ||
            p.id.toString() === valor
        );
    }
    if (valor.length === 0 && !categoria) {
        document.getElementById('precio-lista-productos').style.display = 'none';
        return;
    }
    mostrarListaProductosPrecio(filtrados);
}

function filtrarProductosPrecio() {
    const valor = document.getElementById('precio-buscar-producto').value;
    const categoria = document.getElementById('precio-categoria-filtro').value;
    let filtrados = productosCache;
    if (categoria) filtrados = filtrados.filter(p => p.categoria === categoria);
    if (valor.length >= 1) {
        filtrados = filtrados.filter(p =>
            p.nombre.toLowerCase().includes(valor.toLowerCase()) ||
            p.codigo.toLowerCase().includes(valor.toLowerCase()) ||
            p.id.toString() === valor
        );
    }
    mostrarListaProductosPrecio(filtrados);
}

function mostrarListaProductosPrecio(productos) {
    const lista = document.getElementById('precio-lista-productos');
    const tbody = document.getElementById('tbody-precio-productos');
    if (productos.length === 0) {
        lista.style.display = 'none';
        tbody.innerHTML = '';
        return;
    }
    tbody.innerHTML = productos.map(p => `
        <tr onclick="seleccionarProductoPrecio('${p.codigo}', '${p.nombre.replace(/'/g, "\\'")}', ${p.precio_venta})">
            <td>${p.id}</td>
            <td><code>${p.codigo}</code></td>
            <td>${p.nombre}</td>
            <td>${p.categoria}</td>
            <td><b>Q${p.precio_venta}</b></td>
            <td><button type="button" class="btn btn-sm btn-primary">Seleccionar</button></td>
        </tr>
    `).join('');
    lista.removeAttribute('style');
    lista.style.display = 'block';
    lista.style.marginBottom = '12px';
}

function seleccionarProductoPrecio(codigo, nombre, precioActual) {
    document.getElementById('precio-codigo').value = codigo;
    document.getElementById('precio-actual-display').value = `Q${precioActual}`;
    document.getElementById('precio-producto-texto').textContent = ` ${codigo} — ${nombre} | Precio actual: Q${precioActual}`;
    document.getElementById('precio-producto-seleccionado').style.display = 'flex';
    document.getElementById('precio-lista-productos').style.display = 'none';
    document.getElementById('precio-buscar-producto').value = '';
    document.getElementById('precio-nuevo').focus();
}

function limpiarProductoPrecio() {
    document.getElementById('precio-codigo').value = '';
    document.getElementById('precio-actual-display').value = '';
    document.getElementById('precio-producto-seleccionado').style.display = 'none';
    document.getElementById('precio-buscar-producto').value = '';
}

function limpiarFormPrecio() {
    limpiarProductoPrecio();
    document.getElementById('precio-lista-productos').style.display = 'none';
    document.getElementById('precio-nuevo').value = '';
}

// SALIDA — búsqueda dinámica
// ===========================
async function cargarDatosSalida() {
    try {
        const resP = await fetch(`${N8N}/consultar-stock`);
        const dataP = await resP.json();
        productosCache = Array.isArray(dataP) ? dataP : [dataP];

        const resC = await fetch(`${N8N}/consultar-categorias`);
        const dataC = await resC.json();
        const categorias = Array.isArray(dataC) ? dataC : [dataC];
        const select = document.getElementById('salida-categoria-filtro');
        select.innerHTML = '<option value="">Todas las categorías</option>';
        categorias.forEach(c => {
            select.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
        });
    } catch (e) { console.error('Error cargando datos salida:', e); }
}

function buscarProductoSalida(valor) {
    if (productosCache.length === 0) {
        cargarDatosSalida().then(() => buscarProductoSalida(valor));
        return;
    }
    const categoria = document.getElementById('salida-categoria-filtro').value;
    let filtrados = productosCache;
    if (categoria) filtrados = filtrados.filter(p => p.categoria === categoria);
    if (valor.length >= 1) {
        filtrados = filtrados.filter(p =>
            p.nombre.toLowerCase().includes(valor.toLowerCase()) ||
            p.codigo.toLowerCase().includes(valor.toLowerCase()) ||
            p.id.toString() === valor
        );
    }
    if (valor.length === 0 && !categoria) {
        document.getElementById('salida-lista-productos').style.display = 'none';
        return;
    }
    mostrarListaProductosSalida(filtrados);
}

function filtrarProductosSalida() {
    const valor = document.getElementById('salida-buscar-producto').value;
    const categoria = document.getElementById('salida-categoria-filtro').value;
    let filtrados = productosCache;
    if (categoria) filtrados = filtrados.filter(p => p.categoria === categoria);
    if (valor.length >= 1) {
        filtrados = filtrados.filter(p =>
            p.nombre.toLowerCase().includes(valor.toLowerCase()) ||
            p.codigo.toLowerCase().includes(valor.toLowerCase()) ||
            p.id.toString() === valor
        );
    }
    mostrarListaProductosSalida(filtrados);
}

function mostrarListaProductosSalida(productos) {
    const lista = document.getElementById('salida-lista-productos');
    const tbody = document.getElementById('tbody-salida-productos');
    if (productos.length === 0) {
        lista.style.display = 'none';
        tbody.innerHTML = '';
        return;
    }
    tbody.innerHTML = productos.map(p => `
        <tr onclick="seleccionarProductoSalida(${p.id}, '${p.codigo}', '${p.nombre.replace(/'/g, "\\'")}', ${p.stock_actual})">
            <td>${p.id}</td>
            <td><code>${p.codigo}</code></td>
            <td>${p.nombre}</td>
            <td>${p.categoria}</td>
            <td><b>${p.stock_actual}</b></td>
            <td><button type="button" class="btn btn-sm btn-primary">Seleccionar</button></td>
        </tr>
    `).join('');
    lista.removeAttribute('style');
    lista.style.display = 'block';
    lista.style.marginBottom = '12px';
}

function seleccionarProductoSalida(id, codigo, nombre, stock) {
    document.getElementById('salida-producto').value = id;
    document.getElementById('salida-producto-texto').textContent = ` ${id} — ${codigo} — ${nombre} (Stock: ${stock})`;
    document.getElementById('salida-producto-seleccionado').style.display = 'flex';
    document.getElementById('salida-lista-productos').style.display = 'none';
    document.getElementById('salida-buscar-producto').value = '';
}

function limpiarProductoSalida() {
    document.getElementById('salida-producto').value = '';
    document.getElementById('salida-producto-seleccionado').style.display = 'none';
    document.getElementById('salida-buscar-producto').value = '';
}

function limpiarFormSalida() {
    limpiarProductoSalida();
    document.getElementById('salida-lista-productos').style.display = 'none';
    document.getElementById('formSalida').reset();
}

// Submit handlers para salida, precio, venta y cliente
document.addEventListener('DOMContentLoaded', () => {

    // Formulario salida
    document.getElementById('formSalida').addEventListener('submit', async (e) => {
        e.preventDefault();
        const productoId = document.getElementById('salida-producto').value;
        if (!productoId) { alert('Seleccione un producto de la lista.'); return; }
        const body = {
            producto_id: parseInt(productoId),
            cantidad:    parseInt(document.getElementById('salida-cantidad').value),
            motivo:      document.getElementById('salida-motivo').value,
            notas:       document.getElementById('salida-notas').value
        };
        try {
            const res = await fetch(`${N8N}/registrar-salida`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            const d = Array.isArray(data) ? data[0] : data;
            mostrarResultado('salida-resultado', 'exito',
                `Salida registrada. Producto: ${d.nombre_producto} | Motivo: ${body.motivo} | Cantidad: ${body.cantidad}`);
            limpiarFormSalida();
        } catch (err) {
            mostrarResultado('salida-resultado', 'error', 'Error al registrar la salida.');
        }
    });

    // Formulario precio
    document.getElementById('formPrecio').addEventListener('submit', async (e) => {
        e.preventDefault();
        const codigo = document.getElementById('precio-codigo').value;
        if (!codigo) { alert('Seleccione un producto de la lista.'); return; }
        const body = {
            codigo:       codigo,
            precio_venta: parseFloat(document.getElementById('precio-nuevo').value)
        };
        try {
            const res = await fetch(`${N8N}/actualizar-precio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            const d = Array.isArray(data) ? data[0] : data;
            mostrarResultado('precio-resultado', 'exito',
                `Precio actualizado. ${d.nombre || codigo} → Q${body.precio_venta}`);
            limpiarFormPrecio();
        } catch (err) {
            mostrarResultado('precio-resultado', 'error', 'Error al actualizar el precio.');
        }
    });

    // Formulario cliente
    document.getElementById('formCliente').addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = { nombre: document.getElementById('cliente-nombre').value };
        try {
            const res = await fetch(`${N8N}/registrar-cliente`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            mostrarResultado('cliente-resultado', 'exito',
                `Cliente registrado. ID asignado: ${data.id || '—'}`);
            e.target.reset();
        } catch (err) {
            mostrarResultado('cliente-resultado', 'error', 'Error al registrar el cliente.');
        }
    });

}); // FIN submit handlers

// ===========================
// HISTORIAL VENTAS
// ===========================
let ventasCache = [];

async function cargarHistorialVentas() {
    try {
        const res = await fetch(`${N8N}/historial-ventas`);
        const data = await res.json();
        ventasCache = Array.isArray(data) ? data : [data];
        renderTablaVentas(ventasCache);
    } catch (e) {
        document.getElementById('tbody-ventas').innerHTML =
            '<tr><td colspan="7" class="loading">Error al cargar ventas</td></tr>';
    }
}

function renderTablaVentas(ventas) {
    const tbody = document.getElementById('tbody-ventas');
    document.getElementById('filtro-contador').textContent =
        `Mostrando ${ventas.length} venta(s)`;
    tbody.innerHTML = ventas.length === 0
        ? '<tr><td colspan="7" class="loading">Sin ventas</td></tr>'
        : ventas.map(v => `
            <tr>
                <td>#${v.venta_id}</td>
                <td>${v.cliente}</td>
                <td>${v.fecha}</td>
                <td style="font-size:12px; color:var(--text2)">${v.productos || '—'}</td>
                <td><b>${Q(v.total)}</b></td>
                <td>${v.total_unidades}</td>
                <td style="display:flex; gap:6px;">
                    <button class="btn btn-sm btn-danger" onclick="anularVenta(${v.venta_id})">Anular</button>
                </td>
            </tr>
        `).join('');
}

function filtrarHistorial() {
    const cliente  = document.getElementById('filtro-venta-cliente').value.toLowerCase();
    const desde    = document.getElementById('filtro-fecha-desde').value;
    const hasta    = document.getElementById('filtro-fecha-hasta').value;

    let filtradas = ventasCache.filter(v => {
        const matchCliente  = !cliente  || v.cliente.toLowerCase().includes(cliente) || `#${v.venta_id}`.includes(cliente);
        const matchDesde    = !desde    || v.fecha >= desde;
        const matchHasta    = !hasta    || v.fecha <= hasta;
        return matchCliente && matchDesde && matchHasta;
    });

    renderTablaVentas(filtradas);
}

function limpiarFiltrosVentas() {
    document.getElementById('filtro-venta-cliente').value = '';
    document.getElementById('filtro-fecha-desde').value = '';
    document.getElementById('filtro-fecha-hasta').value = '';
    renderTablaVentas(ventasCache);
}

async function notificarHistorialVentas(btn) {
    try {
        btn.textContent = 'Enviando...';
        btn.disabled = true;
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = `${N8N}/notificar-historial-ventas-get`;
        document.body.appendChild(iframe);
        setTimeout(() => {
            document.body.removeChild(iframe);
            btn.textContent = 'Enviado';
            setTimeout(() => { btn.textContent = '📨 Notificar'; btn.disabled = false; }, 3000);
        }, 3000);
    } catch (e) {
        alert('Error al enviar notificación.');
        btn.textContent = '📨 Notificar';
        btn.disabled = false;
    }
}

function descargarPDFVentas() {
    const ventas = ventasCache.length > 0 ? ventasCache : [];
    const filas = ventas.map(v => `
        <tr>
            <td>#${v.venta_id}</td>
            <td>${v.cliente}</td>
            <td>${v.fecha}</td>
            <td style="font-size:11px">${v.productos || '—'}</td>
            <td><b>Q${parseFloat(v.total).toFixed(2)}</b></td>
        </tr>
    `).join('');

    const total = ventas.reduce((sum, v) => sum + parseFloat(v.total), 0);

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Historial de Ventas</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 13px; padding: 20px; }
                h1 { color: #1f4e79; font-size: 18px; margin-bottom: 4px; }
                p { color: #666; font-size: 12px; margin-bottom: 16px; }
                table { width: 100%; border-collapse: collapse; }
                th { background: #1f4e79; color: white; padding: 8px 10px; text-align: left; }
                td { padding: 7px 10px; border-bottom: 1px solid #dde3ea; }
                .total-row td { font-weight: bold; background: #e8f0f7; }
            </style>
        </head>
        <body>
            <h1>Historial de Ventas</h1>
            <p>Sistema de Inventario — Tienda Tech | ${new Date().toLocaleDateString('es-GT')}</p>
            <table>
                <thead>
                    <tr><th>ID</th><th>Cliente</th><th>Fecha</th><th>Productos</th><th>Total</th></tr>
                </thead>
                <tbody>
                    ${filas}
                    <tr class="total-row">
                        <td colspan="4" style="text-align:right">Total general:</td>
                        <td>Q${total.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </body>
        </html>
    `;

    const ventana = window.open('', '_blank');
    ventana.document.write(html);
    ventana.document.close();
    ventana.print();
}

async function anularVenta(id) {
    if (!confirm(`¿Está seguro de anular la venta #${id}? El stock se restaurará automáticamente.`)) return;
    try {
        await fetch(`${N8N}/anular-venta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ venta_id: id })
        });
        alert(` Venta #${id} anulada. Stock restaurado.`);
        cargarHistorialVentas();
    } catch (e) {
        alert('Error al anular la venta.');
    }
}

// ===========================
// CLIENTES
// ===========================
async function buscarCliente() {
    const val = document.getElementById('cliente-buscar').value;
    if (!val) return;
    try {
        const res = await fetch(`${N8N}/buscar-cliente?buscar=${encodeURIComponent(val)}`);
        const data = await res.json();
        const c = Array.isArray(data) ? data[0] : data;
        document.getElementById('cliente-resultado-busqueda').innerHTML = `
            <div style="background:#f8f9fa;border:1px solid var(--border);border-radius:6px;padding:12px;font-size:13px">
                <b>${c.nombre}</b> (ID: ${c.id})<br>
                Cliente desde: ${c.cliente_desde}<br>
                Total compras: ${c.total_compras}<br>
                Total gastado: ${Q(c.total_gastado)}
            </div>`;
    } catch (e) {
        document.getElementById('cliente-resultado-busqueda').innerHTML =
            '<p style="color:var(--text3);font-size:13px">No se encontró el cliente.</p>';
    }
}

async function cargarClientesFrecuentes() {
    try {
        const res = await fetch(`${N8N}/clientes-frecuentes`);
        const data = await res.json();
        const clientes = Array.isArray(data) ? data : [data];
        const tbody = document.getElementById('tbody-clientes');
        tbody.innerHTML = clientes.map(c => `
            <tr>
                <td>${c.cliente}</td>
                <td>${c.total_compras}</td>
                <td>${Q(c.total_gastado)}</td>
                <td>${c.ultima_compra || '—'}</td>
                <td>${badgeCliente(c.categoria_cliente)}</td>
            </tr>
        `).join('');
    } catch (e) {
        document.getElementById('tbody-clientes').innerHTML =
            '<tr><td colspan="5" class="loading">Error al cargar clientes</td></tr>';
    }
}

async function notificarClientesFrecuentes(btn) {
    try {
        btn.textContent = 'Enviando...';
        btn.disabled = true;
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = `${N8N}/notificar-clientes-frecuentes-get`;
        document.body.appendChild(iframe);
        setTimeout(() => {
            document.body.removeChild(iframe);
            btn.textContent = 'Enviado';
            setTimeout(() => { btn.textContent = '📨 Notificar'; btn.disabled = false; }, 3000);
        }, 3000);
    } catch (e) {
        alert('Error al enviar notificación.');
        btn.textContent = '📨 Notificar';
        btn.disabled = false;
    }
}

function descargarPDFClientes() {
    const tbody = document.getElementById('tbody-clientes');
    const filas = Array.from(tbody.querySelectorAll('tr')).map(tr => {
        const celdas = Array.from(tr.querySelectorAll('td')).map(td => `<td>${td.innerText}</td>`).join('');
        return `<tr>${celdas}</tr>`;
    }).join('');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Clientes Frecuentes</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 13px; padding: 20px; }
                h1 { color: #1f4e79; font-size: 18px; margin-bottom: 4px; }
                p { color: #666; font-size: 12px; margin-bottom: 16px; }
                table { width: 100%; border-collapse: collapse; }
                th { background: #1f4e79; color: white; padding: 8px 10px; text-align: left; }
                td { padding: 7px 10px; border-bottom: 1px solid #dde3ea; }
            </style>
        </head>
        <body>
            <h1>Reporte de Clientes Frecuentes</h1>
            <p>Sistema de Inventario — Tienda Tech | ${new Date().toLocaleDateString('es-GT')}</p>
            <table>
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Compras</th>
                        <th>Total gastado</th>
                        <th>Última compra</th>
                        <th>Categoría</th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>
        </body>
        </html>`;

    const ventana = window.open('', '_blank');
    ventana.document.write(html);
    ventana.document.close();
    ventana.print();
}

// ===========================
// DETALLE VENTA — dinámico
// ===========================
let detalleCount = 1;
function agregarDetalle() {
    const id = detalleCount++;
    const div = document.createElement('div');
    div.className = 'detalle-row';
    div.id = `detalle-${id}`;
    div.innerHTML = `
        <input type="number" placeholder="ID producto" class="det-producto">
        <input type="number" placeholder="Cantidad" class="det-cantidad">
        <input type="number" placeholder="Precio unitario" step="0.01" class="det-precio">
        <button type="button" class="btn btn-danger btn-sm" onclick="eliminarDetalle(${id})">✕</button>`;
    document.getElementById('detalle-venta').appendChild(div);
}
function eliminarDetalle(id) {
    const el = document.getElementById(`detalle-${id}`);
    if (el && document.querySelectorAll('.detalle-row').length > 1) el.remove();
}

// ===========================
// REPORTES
// ===========================
const REPORTES_CONFIG = {
    'resumen-diario': {
        titulo: 'Resumen diario de ventas',
        url: '/resumen-diario',
        render: (data) => {
            const detalle = data.filter(d => d.tipo === 'detalle');
            const resumen = data.find(d => d.tipo === 'resumen');

            const filasDetalle = detalle.map(d => `
                <tr>
                    <td>#${d.venta_id}</td>
                    <td>${d.cliente}</td>
                    <td><code>${d.codigo}</code></td>
                    <td>${d.producto}</td>
                    <td>${d.cantidad}</td>
                    <td>Q${parseFloat(d.precio_unitario).toFixed(2)}</td>
                    <td><b>Q${parseFloat(d.subtotal).toFixed(2)}</b></td>
                </tr>
            `).join('');

            return `
                <h4 style="margin:0 0 10px;font-size:13px;color:var(--text2)">Detalle de ventas del día</h4>
                <div style="overflow-x:auto;margin-bottom:24px">
                <table>
                    <thead>
                        <tr style="background:var(--azul-light)">
                            <th style="color:var(--azul);background:var(--azul-light)">Venta ID</th>
                            <th style="color:var(--azul);background:var(--azul-light)">Cliente</th>
                            <th style="color:var(--azul);background:var(--azul-light)">Código</th>
                            <th style="color:var(--azul);background:var(--azul-light)">Producto</th>
                            <th style="color:var(--azul);background:var(--azul-light)">Cantidad</th>
                            <th style="color:var(--azul);background:var(--azul-light)">Precio unit.</th>
                            <th style="color:var(--azul);background:var(--azul-light)">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>${filasDetalle}</tbody>
                </table>
                </div>
                <h4 style="margin:0 0 10px;font-size:13px;color:var(--text2)">Resumen general del día — ${resumen ? resumen.fecha : ''}</h4>
                <div style="overflow-x:auto">
                <table>
                    <thead>
                        <tr style="background:var(--azul-light)">
                            <th style="color:var(--azul);background:var(--azul-light)">Total ventas</th>
                            <th style="color:var(--azul);background:var(--azul-light)">Total unidades</th>
                            <th style="color:var(--azul);background:var(--azul-light)">Productos vendidos</th>
                            <th style="color:var(--azul);background:var(--azul-light)">Ingresos totales</th>
                            <th style="color:var(--azul);background:var(--azul-light)">Ticket promedio</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><b>${resumen ? resumen.venta_id : 0}</b></td>
                            <td>${resumen ? resumen.cliente : 0}</td>
                            <td>${resumen ? resumen.codigo : 0}</td>
                            <td><b>Q${resumen ? parseFloat(resumen.subtotal).toFixed(2) : '0.00'}</b></td>
                            <td>Q${resumen ? parseFloat(resumen.precio_unitario).toFixed(2) : '0.00'}</td>
                        </tr>
                    </tbody>
                </table>
                </div>
            `;
        }
    },
    'mas-vendidos': {
        titulo: 'Productos más vendidos del mes',
        url: '/productos-mas-vendidos',
        cols: ['Código', 'Producto', 'Categoría', 'Unidades', 'En ventas', 'Ingresos', 'Stock'],
        map: d => `<tr>
            <td><code>${d.codigo}</code></td>
            <td>${d.producto}</td>
            <td>${d.categoria}</td>
            <td><b>${d.unidades_vendidas}</b></td>
            <td>${d.aparece_en_ventas}</td>
            <td>${Q(d.ingresos_generados)}</td>
            <td>${d.stock_disponible}</td>
        </tr>`
    },
    'por-categoria': {
        titulo: 'Ventas por categoría',
        url: '/ventas-por-categoria',
        cols: ['Categoría', 'Ventas', 'Unidades', 'Ingresos', '% del total'],
        map: d => `<tr>
            <td><b>${d.categoria}</b></td>
            <td>${d.total_ventas}</td>
            <td>${d.unidades_vendidas}</td>
            <td>${Q(d.ingresos_totales)}</td>
            <td>${d.porcentaje_ingresos}%</td>
        </tr>`
    },
    'margen': {
        titulo: 'Margen de ganancia por producto',
        url: '/margen-ganancia',
        cols: ['Código', 'Producto', 'Precio venta', 'Costo prom.', 'Ganancia unit.', 'Margen %', 'Ganancia total'],
        map: d => `<tr>
            <td><code>${d.codigo}</code></td>
            <td>${d.producto}</td>
            <td>${Q(d.precio_venta)}</td>
            <td>${Q(d.costo_promedio)}</td>
            <td>${Q(d.ganancia_unitaria)}</td>
            <td><b>${d.margen_porcentaje}%</b></td>
            <td>${Q(d.ganancia_total)}</td>
        </tr>`
    }
};

let reporteActual = null;

async function verReporte(tipo) {
    reporteActual = tipo;
    const cfg = REPORTES_CONFIG[tipo];
    document.getElementById('reporte-titulo').textContent = cfg.titulo;
    document.getElementById('reporte-contenido').style.display = 'block';
    document.getElementById('reporte-thead').innerHTML = '';
    document.getElementById('reporte-tbody').innerHTML =
        '<tr><td class="loading">Cargando...</td></tr>';
    try {
        const res = await fetch(`${N8N}${cfg.url}`);
        const data = await res.json();
        const rows = Array.isArray(data) ? data : [data];

        if (cfg.render) {
            document.getElementById('reporte-thead').innerHTML = '';
            document.getElementById('reporte-tbody').innerHTML = cfg.render(rows);
        } else {
            document.getElementById('reporte-thead').innerHTML =
                `<tr>${cfg.cols.map(c => `<th>${c}</th>`).join('')}</tr>`;
            document.getElementById('reporte-tbody').innerHTML =
                rows.length === 0
                ? '<tr><td class="loading">Sin datos</td></tr>'
                : rows.map(cfg.map).join('');
        }
    } catch (e) {
        document.getElementById('reporte-tbody').innerHTML =
            '<tr><td class="loading">Error al cargar reporte</td></tr>';
    }
}

function descargarPDFReporte() {
    const titulo = document.getElementById('reporte-titulo').textContent;
    const contenido = document.getElementById('reporte-tabla-wrap').innerHTML;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${titulo}</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
                h1 { color: #1f4e79; font-size: 16px; margin-bottom: 4px; }
                p { color: #666; font-size: 11px; margin-bottom: 16px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th { background: #1f4e79; color: white; padding: 8px 10px; text-align: left; }
                td { padding: 7px 10px; border-bottom: 1px solid #dde3ea; }
                h4 { color: #1f4e79; margin: 16px 0 8px; font-size: 13px; }
            </style>
        </head>
        <body>
            <h1>${titulo}</h1>
            <p>Sistema de Inventario — Tienda Tech | ${new Date().toLocaleDateString('es-GT')}</p>
            ${contenido}
        </body>
        </html>`;

    const ventana = window.open('', '_blank');
    ventana.document.write(html);
    ventana.document.close();
    ventana.print();
}

async function notificarReporte(btn) {
    const rutas = {
        'resumen-diario':  'notificar-resumen-diario',
        'mas-vendidos':    'notificar-mas-vendidos',
        'por-categoria':   'notificar-por-categoria',
        'margen':          'notificar-margen-ganancia'
    };
    const ruta = rutas[reporteActual];
    if (!ruta) return;
    try {
        btn.textContent = 'Enviando...';
        btn.disabled = true;
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = `${N8N}/${ruta}`;
        document.body.appendChild(iframe);
        setTimeout(() => {
            document.body.removeChild(iframe);
            btn.textContent = 'Enviado';
            setTimeout(() => { btn.textContent = '📨 Notificar'; btn.disabled = false; }, 3000);
        }, 3000);
    } catch (e) {
        alert('Error al enviar notificación.');
        btn.textContent = '📨 Notificar';
        btn.disabled = false;
    }
}

// ===========================
// AUDITORÍA
// ===========================
const AUDITORIA_CONFIG = {
    'movimientos': {
        titulo: 'Registro de movimientos',
        url: '/registro-movimientos',
        notificar: 'notificar-movimientos',
        cols: ['Tipo', 'Código', 'Producto', 'Cantidad', 'Proveedor/Cliente', 'Motivo', 'Fecha'],
        map: d => `<tr>
            <td><span class="badge ${d.tipo==='entrada'?'badge-verde':d.tipo==='salida'?'badge-rojo':'badge-azul'}">${d.tipo}</span></td>
            <td><code>${d.codigo}</code></td>
            <td>${d.producto}</td>
            <td>${d.cantidad}</td>
            <td>${d.proveedor || d.notas || '—'}</td>
            <td>${d.motivo || '—'}</td>
            <td>${d.fecha ? d.fecha.split('T')[0] : '—'}</td>
        </tr>`
    },
    'precios': {
        titulo: 'Historial de cambios de precio',
        url: '/historial-precios',
        notificar: 'notificar-cambios-precio',
        cols: ['Código', 'Producto', 'Categoría', 'Precio anterior', 'Precio nuevo', 'Diferencia', 'Cambio %', 'Fecha'],
        map: d => `<tr>
            <td><code>${d.codigo}</code></td>
            <td>${d.producto}</td>
            <td>${d.categoria}</td>
            <td>Q${parseFloat(d.precio_anterior || 0).toFixed(2)}</td>
            <td><b>Q${parseFloat(d.precio_nuevo || 0).toFixed(2)}</b></td>
            <td style="color:${parseFloat(d.diferencia) >= 0 ? 'green' : 'red'}">
                ${parseFloat(d.diferencia || 0) >= 0 ? '+' : ''}Q${parseFloat(d.diferencia || 0).toFixed(2)}
            </td>
            <td>${d.cambio_porcentaje || 0}%</td>
            <td>${d.fecha || '—'}</td>
        </tr>`
    },
    'errores': {
        titulo: 'Log de errores del sistema',
        url: '/log-errores',
        notificar: 'notificar-log-errores',
        cols: ['ID', 'Código', 'Producto', 'Tipo', 'Mensaje', 'Estado', 'Fecha'],
        map: d => `<tr>
            <td>${d.id}</td>
            <td><code>${d.codigo}</code></td>
            <td>${d.producto}</td>
            <td>${d.tipo_alerta}</td>
            <td>${d.mensaje}</td>
            <td><span class="badge ${d.estado==='pendiente'?'badge-amarillo':'badge-verde'}">${d.estado}</span></td>
            <td>${d.fecha}</td>
        </tr>`
    }
};

let auditoriaActual = null;

async function verAuditoria(tipo) {
    auditoriaActual = tipo;
    const cfg = AUDITORIA_CONFIG[tipo];
    document.getElementById('auditoria-titulo').textContent = cfg.titulo;
    document.getElementById('auditoria-contenido').style.display = 'block';
    document.getElementById('auditoria-thead').innerHTML =
        `<tr>${cfg.cols.map(c => `<th>${c}</th>`).join('')}</tr>`;
    document.getElementById('auditoria-tbody').innerHTML =
        '<tr><td class="loading">Cargando...</td></tr>';
    try {
        const res = await fetch(`${N8N}${cfg.url}`);
        const data = await res.json();
        const rows = Array.isArray(data) ? data : [data];
        document.getElementById('auditoria-tbody').innerHTML =
            rows.length === 0
            ? '<tr><td class="loading">Sin datos</td></tr>'
            : rows.map(cfg.map).join('');
    } catch (e) {
        document.getElementById('auditoria-tbody').innerHTML =
            '<tr><td class="loading">Error al cargar datos</td></tr>';
    }
}

async function notificarAuditoria(btn) {
    if (!auditoriaActual) return;
    const cfg = AUDITORIA_CONFIG[auditoriaActual];
    try {
        btn.textContent = 'Enviando...';
        btn.disabled = true;
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = `${N8N}/${cfg.notificar}`;
        document.body.appendChild(iframe);
        setTimeout(() => {
            document.body.removeChild(iframe);
            btn.textContent = 'Enviado';
            setTimeout(() => { btn.textContent = '📨 Notificar'; btn.disabled = false; }, 3000);
        }, 3000);
    } catch (e) {
        alert('Error al enviar notificación.');
        btn.textContent = '📨 Notificar';
        btn.disabled = false;
    }
}

function descargarPDFAuditoria() {
    if (!auditoriaActual) return;
    const titulo = document.getElementById('auditoria-titulo').textContent;
    const contenido = document.getElementById('auditoria-tabla-wrap').innerHTML;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${titulo}</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
                h1 { color: #1f4e79; font-size: 16px; margin-bottom: 4px; }
                p { color: #666; font-size: 11px; margin-bottom: 16px; }
                table { width: 100%; border-collapse: collapse; }
                th { background: #1f4e79; color: white; padding: 8px 10px; text-align: left; }
                td { padding: 7px 10px; border-bottom: 1px solid #dde3ea; }
            </style>
        </head>
        <body>
            <h1>${titulo}</h1>
            <p>Sistema de Inventario — Tienda Tech | ${new Date().toLocaleDateString('es-GT')}</p>
            ${contenido}
        </body>
        </html>`;

    const ventana = window.open('', '_blank');
    ventana.document.write(html);
    ventana.document.close();
    ventana.print();
}
