import { cargarProductos } from './productos.js'
import { obtenerCarrito, guardarCarrito, vaciarCarrito, renderizarDetalleProducto, obtenerIdProductoSeleccionado } from './funciones.js'

const COSTO_ENVIO = 3500
const contador = document.getElementById('productos-seleccionados')
const cantidadTotal = (carrito) => carrito.reduce((total, item) => total + item.cantidad, 0)

function actualizarContador() {
    if (contador) contador.textContent = `(${cantidadTotal(obtenerCarrito())})`
}

try {
    const productos = await cargarProductos()
    actualizarContador()

    const detalle = document.getElementById('contenedor-detalle-producto')
    if (detalle) {
        const producto = productos.find((item) => item.id === obtenerIdProductoSeleccionado())
        if (!producto) detalle.textContent = 'No encontramos el producto seleccionado.'
        else {
            renderizarDetalleProducto(detalle, producto)
            detalle.querySelector('.form-compra').addEventListener('submit', (evento) => {
                evento.preventDefault()
                const datos = new FormData(evento.currentTarget)
                const cantidad = Number(datos.get('cantidad'))
                if (!Number.isInteger(cantidad) || cantidad < 1) return
                const carrito = obtenerCarrito()
                carrito.push({ id: producto.id, talle: datos.get('talle'), color: datos.get('color'), cantidad })
                guardarCarrito(carrito)
                location.href = 'carrito.html'
            })
        }
    }

    const contenedor = document.getElementById('contenedor-carrito')
    if (contenedor) {
        const subtotalNodo = document.getElementById('resumen-subtotal')
        const envioNodo = document.getElementById('resumen-envio')
        const totalNodo = document.getElementById('resumen-total')
        const titulo = document.getElementById('titulo-carrito')
        const textoEnvio = document.getElementById('costo-envio-texto')
        const formulario = document.getElementById('form-checkout')

        function renderizarCarrito() {
            const carrito = obtenerCarrito()
            actualizarContador()
            if (titulo) titulo.textContent = `MI CARRITO (${cantidadTotal(carrito)})`
            if (!carrito.length) {
                contenedor.innerHTML = '<p class="mensaje-carrito-vacio">Tu carrito está vacío. Podés explorar el <a href="catalogo.html">catálogo</a>.</p>'
                subtotalNodo.textContent = '$0'
                envioNodo.textContent = '$0'
                totalNodo.textContent = '$0'
                textoEnvio.textContent = 'Ingresá un código postal válido para estimar el envío.'
                return
            }

            let subtotal = 0
            contenedor.innerHTML = carrito.map((linea, indice) => {
                const producto = productos.find((item) => item.id === linea.id)
                if (!producto) return ''
                subtotal += producto.precio * linea.cantidad
                return `<article class="linea-carrito">
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                    <div><h4>${producto.nombre}</h4><p>Color: ${linea.color} · Talle: ${linea.talle}</p>
                    <p>Precio unitario: $${producto.precio.toLocaleString('es-AR')}</p><p>Cantidad: ${linea.cantidad}</p></div>
                    <button type="button" class="boton-eliminar" data-indice="${indice}">Eliminar</button>
                </article>`
            }).join('')

            contenedor.querySelectorAll('.boton-eliminar').forEach((boton) => boton.addEventListener('click', () => {
                const carritoActual = obtenerCarrito()
                carritoActual.splice(Number(boton.dataset.indice), 1)
                guardarCarrito(carritoActual)
                renderizarCarrito()
            }))

            const envio = COSTO_ENVIO
            subtotalNodo.textContent = `$${subtotal.toLocaleString('es-AR')}`
            envioNodo.textContent = `$${envio.toLocaleString('es-AR')}`
            totalNodo.textContent = `$${(subtotal + envio).toLocaleString('es-AR')}`
            textoEnvio.textContent = `Envío estimado: $${envio.toLocaleString('es-AR')} para códigos postales válidos de Argentina.`
        }

        document.querySelectorAll('.boton-sugerido').forEach((boton) => boton.addEventListener('click', () => {
            const producto = productos.find((item) => item.id === Number(boton.dataset.id))
            if (!producto) return
            const carrito = obtenerCarrito()
            carrito.push({ id: producto.id, talle: producto.talles[0], color: producto.colores[0], cantidad: 1 })
            guardarCarrito(carrito)
            renderizarCarrito()
        }))

        const botonEnvio = document.getElementById('boton-calcular-envio')
        botonEnvio?.addEventListener('click', () => {
            const codigoPostal = document.getElementById('cp-calc').value.trim()
            if (!/^\d{4,8}$/.test(codigoPostal)) {
                textoEnvio.textContent = 'Ingresá un código postal válido (4 a 8 números).'
                return
            }
            textoEnvio.textContent = `Envío estimado para CP ${codigoPostal}: $${COSTO_ENVIO.toLocaleString('es-AR')}. Costo fijo de referencia.`
        })

        formulario?.addEventListener('submit', (evento) => {
            const carrito = obtenerCarrito()
            const codigoPostal = document.getElementById('cp-calc').value.trim()
            if (!/^\d{4,8}$/.test(codigoPostal)) {
                evento.preventDefault()
                textoEnvio.textContent = 'Ingresá un código postal válido (4 a 8 números) para continuar.'
                document.getElementById('cp-calc').focus()
                return
            }
            if (!carrito.length) {
                evento.preventDefault()
                alert('Tu carrito está vacío. Agregá un producto antes de continuar.')
                return
            }
            const subtotal = carrito.reduce((suma, linea) => {
                const producto = productos.find((item) => item.id === linea.id)
                return suma + (producto ? producto.precio * linea.cantidad : 0)
            }, 0)
            const datos = new FormData(formulario)
            const pedido = {
                numero: `#${Date.now().toString().slice(-6)}`,
                nombre: datos.get('nombre'),
                articulos: carrito.map((linea) => {
                    const producto = productos.find((item) => item.id === linea.id)
                    return { nombre: producto?.nombre || 'Producto', talle: linea.talle, color: linea.color, cantidad: linea.cantidad, precio: producto?.precio || 0 }
                }),
                subtotal,
                envio: COSTO_ENVIO,
                total: subtotal + COSTO_ENVIO
            }
            sessionStorage.setItem('pedidoPendiente', JSON.stringify(pedido))
        })

        renderizarCarrito()
    }

    const confirmacion = document.getElementById('confirmacion-compra')
    if (confirmacion) {
        const pedido = JSON.parse(sessionStorage.getItem('pedidoPendiente') || 'null')
        if (!pedido || !pedido.articulos?.length) {
            confirmacion.innerHTML = '<h2>No hay una compra para confirmar</h2><p>Podés revisar tu carrito y completar el pedido.</p><p><a href="carrito.html">Volver al carrito</a></p>'
        } else {
            const items = pedido.articulos.map((item) => `<li>${item.nombre} (${item.color}, talle ${item.talle}) × ${item.cantidad}</li>`).join('')
            confirmacion.innerHTML = `<h2>Pedido registrado como ejemplo</h2><p>Gracias, ${pedido.nombre}.</p><p>Número: <strong>${pedido.numero}</strong></p><ul>${items}</ul><p>Subtotal: $${pedido.subtotal.toLocaleString('es-AR')}</p><p>Envío estimado: $${pedido.envio.toLocaleString('es-AR')}</p><p>Total: <strong>$${pedido.total.toLocaleString('es-AR')}</strong></p><p>No se procesó un pago real.</p><p><a href="catalogo.html">Seguir comprando</a></p>`
            vaciarCarrito()
            sessionStorage.removeItem('pedidoPendiente')
            actualizarContador()
        }
    }
} catch (error) {
    console.error(error)
    const destino = document.getElementById('contenedor-carrito') || document.getElementById('contenedor-detalle-producto') || document.getElementById('confirmacion-compra')
    if (destino) destino.innerHTML = '<p role="alert">No se pudieron cargar los productos. Intentá recargar la página.</p>'
}
