function renderizarCatalogo(contenedor, productos) {
    if (!contenedor) return
    if (!productos.length) {
        contenedor.innerHTML = '<p>No hay productos que coincidan con la búsqueda.</p>'
        return
    }

    contenedor.innerHTML = productos.map((producto) => `
        <article class="articulo-catalogo">
            <img class="imagen-catalogo" src="${producto.imagen}" alt="${producto.nombre}">
            <h4>${producto.nombre}</h4>
            <p>$${producto.precio.toLocaleString('es-AR')}</p>
            <a href="producto.html?id=${producto.id}" class="enlace-ver-producto" data-id="${producto.id}">Ver producto</a>
            <button type="button" class="boton-agregar-producto" data-id="${producto.id}">Añadir al carrito</button>
        </article>
    `).join('')
}

function filtrarPorTalle(productos, talle) {
    return !talle || talle === 'todos' ? productos : productos.filter((p) => p.talles.includes(talle.toUpperCase()))
}

function filtrarPorCategoria(productos, categoria) {
    return !categoria || categoria === 'todas' ? productos : productos.filter((p) => p.categoria === categoria.toLowerCase())
}

function filtrarPorTexto(productos, texto) {
    const consulta = texto.trim().toLocaleLowerCase('es')
    if (!consulta) return productos
    return productos.filter((p) => `${p.nombre} ${p.descripcion} ${p.categoria} ${p.colores.join(' ')}`.toLocaleLowerCase('es').includes(consulta))
}

function normalizarCarrito(carritoGuardado) {
    if (!Array.isArray(carritoGuardado)) return []
    const lineas = []
    carritoGuardado.forEach((articulo) => {
        // Formato anterior: cada unidad era solamente el ID numérico del producto.
        const linea = typeof articulo === 'number'
            ? { id: articulo, talle: 'Sin especificar', color: 'Sin especificar', cantidad: 1 }
            : { id: Number(articulo.id), talle: articulo.talle || 'Sin especificar', color: articulo.color || 'Sin especificar', cantidad: Math.max(1, Number(articulo.cantidad) || 1) }
        const existente = lineas.find((item) => item.id === linea.id && item.talle === linea.talle && item.color === linea.color)
        if (existente) existente.cantidad += linea.cantidad
        else if (Number.isFinite(linea.id)) lineas.push(linea)
    })
    return lineas
}

function obtenerCarrito() {
    try { return normalizarCarrito(JSON.parse(localStorage.getItem('carrito') || '[]')) }
    catch (error) { console.error('No se pudo leer el carrito:', error); return [] }
}

function guardarCarrito(carrito) {
    try { localStorage.setItem('carrito', JSON.stringify(normalizarCarrito(carrito))) }
    catch (error) { console.error('No se pudo guardar el carrito:', error) }
}

function vaciarCarrito() { localStorage.removeItem('carrito') }

function renderizarDetalleProducto(contenedor, producto) {
    const opcionesTalles = producto.talles.map((talle) => `<option value="${talle}">${talle}</option>`).join('')
    const opcionesColores = (producto.colores || ['Único']).map((color) => `<option value="${color}">${color}</option>`).join('')
    contenedor.innerHTML = `
        <section class="producto-imagenes"><img src="${producto.imagen}" alt="${producto.nombre}"></section>
        <section class="producto-datos">
            <h2>${producto.nombre}</h2><p class="precio">Precio: $${producto.precio.toLocaleString('es-AR')}</p>
            <p class="cuotas">3 cuotas sin interés</p><p class="descripcion">${producto.descripcion}</p>
            <form class="form-compra">
                <label for="select-color">Color:</label><select id="select-color" name="color" required>${opcionesColores}</select>
                <label for="select-talle">Talle:</label><select id="select-talle" name="talle" required><option value="">Seleccionar talle</option>${opcionesTalles}</select>
                <label for="input-cantidad">Cantidad:</label><input type="number" id="input-cantidad" name="cantidad" value="1" min="1" step="1" required>
                <button type="submit">Agregar al carrito</button>
            </form>
        </section>`
    const ruta = document.getElementById('ruta-producto')
    if (ruta) ruta.textContent = producto.nombre
    document.title = `cba.urban - ${producto.nombre}`
}

function obtenerIdProductoSeleccionado() {
    const id = Number(new URLSearchParams(location.search).get('id') || localStorage.getItem('productoSeleccionado'))
    return Number.isInteger(id) && id > 0 ? id : null
}

export { renderizarCatalogo, filtrarPorTalle, filtrarPorCategoria, filtrarPorTexto, normalizarCarrito, obtenerCarrito, guardarCarrito, vaciarCarrito, renderizarDetalleProducto, obtenerIdProductoSeleccionado }
