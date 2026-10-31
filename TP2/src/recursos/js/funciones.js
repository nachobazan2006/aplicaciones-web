function renderizarCatalogo(contenedor, productos) {
    if (!contenedor) {
        return
    }

    let productosHTML = ''

    if (productos.length === 0) {
        contenedor.innerHTML = '<p>No hay productos que coincidan con la búsqueda.</p>'
        return
    }

    productos.forEach((producto) => {
        productosHTML += `
        <article class="articulo-catalogo">
            <img class="imagen-catalogo" src="${producto.imagen}" alt="${producto.nombre}">
            <h4>${producto.nombre}</h4>
            <p>$${producto.precio}</p>
            <a href="producto.html?id=${producto.id}" class="enlace-ver-producto" data-id="${producto.id}">Ver producto</a>
            <button class="boton-agregar-producto" data-id="${producto.id}">Añadir al carro</button>
        </article>
        `
    })

    contenedor.innerHTML = productosHTML
}

function filtrarPorTalle(productos, talle) {
    return productos.filter((producto) => {
        return producto.talles.includes(talle.toUpperCase())
    })
}

function filtrarPorCategoria(productos, categoria) {
    return productos.filter((producto) => {
        return producto.categoria === categoria.toLowerCase()
    })
}

function filtrarPorTexto(productos, texto) {
    const busqueda = texto.trim().toLowerCase()

    return productos.filter((producto) => {
        const datosProducto = `${producto.nombre} ${producto.descripcion} ${producto.categoria} ${producto.colores.join(' ')}`
        return datosProducto.toLowerCase().includes(busqueda)
    })
}

function filtrarPorPrecio(productos, precioMaximo) {
    return productos.filter((producto) => {
        return producto.precio <= precioMaximo
    })
}

// bucle para renderizar la ficha de detalle de un producto específico.
function renderizarDetalleProducto(contenedor, producto) {
    if (!contenedor || !producto) {
        return
    }

    // bucle para los talles disponibles de la prenda seleccionada.
    let opcionesTalles = '<option value="">Seleccionar talle</option>'
    producto.talles.forEach((talle) => {
        opcionesTalles += `<option value="${talle}">${talle}</option>`
    })

    let opcionesColores = ''
    producto.colores.forEach((color) => {
        opcionesColores += `<option value="${color}">${color}</option>`
    })

    const detalleHTML = `
        <!-- imagenes -->
        <section class="producto-imagenes">
            <img src="${producto.imagen}" alt="${producto.nombre}">
        </section>

        <!-- datos y configuración de compra -->
        <section class="producto-datos">
            <h2>${producto.nombre}</h2>
            <p class="precio">Precio: $${producto.precio}</p>
            <p class="cuotas">3 cuotas sin interés</p>
            <p><strong>Stock disponible</strong></p>

            <p class="descripcion">Descripcion: ${producto.descripcion}</p>

            <!-- formulario de compra -->
            <form class="form-compra" action="carrito.html" method="get">
                <input type="hidden" name="id" value="${producto.id}">
                
                <label for="select-color">Color:</label>
                <select id="select-color" name="color" required>
                    ${opcionesColores}
                </select>
                
                <label for="select-talle">Talle:</label>
                <select id="select-talle" name="talle" required>
                    ${opcionesTalles}
                </select>
                
                <label for="input-cantidad">Cantidad:</label>
                <input type="number" id="input-cantidad" name="cantidad" value="1" min="1" required>
                
                <button type="submit" id="boton-agregar-detalle" data-id="${producto.id}">Agregar al carrito</button>
            </form>

            <!-- guía de medidas -->
            <section class="guia-medidas">
                <h3>Tabla de Medidas</h3>
                <table>
                    <caption>Medidas en centímetros</caption>
                    <thead>
                        <tr>
                            <th scope="col">Talle</th>
                            <th scope="col">Ancho</th>
                            <th scope="col">Largo</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>S</td>
                            <td>54 cm</td>
                            <td>72 cm</td>
                        </tr>
                        <tr>
                            <td>M</td>
                            <td>56 cm</td>
                            <td>74 cm</td>
                        </tr>
                        <tr>
                            <td>L</td>
                            <td>58 cm</td>
                            <td>76 cm</td>
                        </tr>
                        <tr>
                            <td>XL</td>
                            <td>60 cm</td>
                            <td>78 cm</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <!-- cálculo de envío -->
            <section class="calculo-envio">
                <h3>Calcular Envío</h3>
                <form class="form-envio" action="#" method="get">
                    <label for="cp-envio">Código Postal:</label>
                    <input type="text" id="cp-envio" name="cp" placeholder="5000">
                    <button type="button">Calcular</button>
                </form>
            </section>
        </section>
    `

    contenedor.innerHTML = detalleHTML

    // actualizar nombre del producto en el breadcrumb y título.
    if (typeof document !== 'undefined') {
        const rutaProducto = document.getElementById('ruta-producto')
        if (rutaProducto) {
            rutaProducto.textContent = producto.nombre
        }

        document.title = `cba.urban - ${producto.nombre}`
        const tituloDetalleH1 = document.getElementById('titulo-detalle-h1')
        if (tituloDetalleH1) {
            tituloDetalleH1.textContent = `Detalle del producto: ${producto.nombre}`
        }
    }
}

function obtenerIdProductoSeleccionado() {
    try {
        const parametros = new URLSearchParams(window.location.search)
        const idParam = parametros.get('id')
        if (idParam) {
            return parseInt(idParam)
        }
    } catch (error) {
        console.log(error)
    }

    try {
        const idGuardado = localStorage.getItem('productoSeleccionado')
        if (idGuardado) {
            return parseInt(idGuardado)
        }
    } catch (error) {
        console.log(error)
    }

    return 1
}

// funciones para persistencia y lectura del carrito.
function obtenerCarrito() {
    try {
        const guardado = localStorage.getItem('carrito')
        if (guardado) {
            return normalizarCarrito(JSON.parse(guardado))
        }
    } catch (error) {
        console.log(error)
    }
    return []
}

function normalizarCarrito(carrito) {
    if (!Array.isArray(carrito)) {
        return []
    }

    const carritoNormalizado = []

    carrito.forEach((articulo) => {
        // el formato anterior guardaba solamente el identificador del producto.
        const linea = typeof articulo === 'number'
            ? { id: articulo, talle: 'Sin especificar', color: 'Sin especificar', cantidad: 1 }
            : { id: Number(articulo.id), talle: articulo.talle || 'Sin especificar', color: articulo.color || 'Sin especificar', cantidad: Math.max(1, Number(articulo.cantidad) || 1) }

        const existente = carritoNormalizado.find((item) => {
            return item.id === linea.id && item.talle === linea.talle && item.color === linea.color
        })

        if (existente) {
            existente.cantidad += linea.cantidad
        } else if (Number.isFinite(linea.id)) {
            carritoNormalizado.push(linea)
        }
    })

    return carritoNormalizado
}

function guardarCarrito(carrito) {
    try {
        localStorage.setItem('carrito', JSON.stringify(normalizarCarrito(carrito)))
    } catch (error) {
        console.log(error)
    }
}

function vaciarCarrito() {
    try {
        localStorage.removeItem('carrito')
    } catch (error) {
        console.log(error)
    }
}

export {
    renderizarCatalogo,
    renderizarDetalleProducto,
    obtenerIdProductoSeleccionado,
    filtrarPorTalle,
    filtrarPorCategoria,
    filtrarPorPrecio,
    filtrarPorTexto,
    normalizarCarrito,
    obtenerCarrito,
    guardarCarrito,
    vaciarCarrito
}
