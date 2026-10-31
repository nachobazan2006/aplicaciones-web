
import { cargarProductos } from './productos.js'
import {
    obtenerCarrito,
    guardarCarrito,
    vaciarCarrito,
    renderizarDetalleProducto,
    obtenerIdProductoSeleccionado
} from './funciones.js'

let productosUrban = []
let productosCargados = false
const costoEnvioFijo = 3500

try {
    productosUrban = await cargarProductos()
    productosCargados = true
} catch (error) {
    console.error(error)
    const contenedor = document.getElementById('contenedor-carrito') || document.getElementById('contenedor-detalle-producto') || document.getElementById('confirmacion-compra')
    if (contenedor) contenedor.innerHTML = '<p role="alert">No se pudieron cargar los productos. Intentá recargar la página.</p>'
}

// mostrar cuántas unidades hay en el carrito (en el encabezado).
const productosSeleccionados = document.getElementById('productos-seleccionados')

function actualizarContador() {
    if (productosSeleccionados) {
        const carrito = obtenerCarrito()
        const cantidad = carrito.reduce((total, articulo) => total + articulo.cantidad, 0)
        productosSeleccionados.textContent = `(${cantidad})`
    }
}

actualizarContador()

// página de detalle: mostrar el producto seleccionado y permitir agregarlo.
const contenedorDetalle = document.getElementById('contenedor-detalle-producto')

if (contenedorDetalle && productosCargados) {
    const idSeleccionado = obtenerIdProductoSeleccionado()
    const producto = productosUrban.find((item) => {
        return item.id === idSeleccionado
    })

    if (producto) {
        renderizarDetalleProducto(contenedorDetalle, producto)

        // el formulario se crea dentro de renderizarDetalleProducto().
        const formCompra = document.querySelector('.form-compra')

        if (formCompra) {
            formCompra.addEventListener('submit', (evento) => {
                evento.preventDefault()

                const datosCompra = new FormData(formCompra)
                const cantidad = Number(datosCompra.get('cantidad'))

                if (!Number.isInteger(cantidad) || cantidad < 1) {
                    alert('Ingresá una cantidad válida.')
                    return
                }

                const carrito = obtenerCarrito()

                // guardamos la variante y la cantidad elegidas.
                carrito.push({
                    id: producto.id,
                    talle: datosCompra.get('talle'),
                    color: datosCompra.get('color'),
                    cantidad
                })

                guardarCarrito(carrito)
                actualizarContador()
                window.location.href = 'carrito.html'
            })
        }
    } else {
        contenedorDetalle.textContent = 'No encontramos el producto seleccionado.'
    }
}

// página del carrito: mostrar los productos y calcular el total.
const contenedorCarrito = document.getElementById('contenedor-carrito')

if (contenedorCarrito && productosCargados) {
    const tituloCarrito = document.getElementById('titulo-carrito')
    const resumenSubtotal = document.getElementById('resumen-subtotal')
    const resumenEnvio = document.getElementById('resumen-envio')
    const resumenTotal = document.getElementById('resumen-total')
    const costoEnvioTexto = document.getElementById('costo-envio-texto')
    const formCheckout = document.getElementById('form-checkout')
    const botonCalcularEnvio = document.getElementById('boton-calcular-envio')
    const codigoPostal = document.getElementById('cp-calc')

    if (botonCalcularEnvio) {
        botonCalcularEnvio.addEventListener('click', () => {
            if (!/^[0-9]{4,8}$/.test(codigoPostal.value.trim())) {
                costoEnvioTexto.textContent = 'Ingresá un código postal válido (de 4 a 8 números).'
                return
            }

            costoEnvioTexto.textContent = `Envío estimado: $${costoEnvioFijo}. Es un costo fijo de referencia.`
        })
    }

    function renderizarPaginaCarrito() {
        const carrito = obtenerCarrito()
        actualizarContador()

        if (tituloCarrito) {
            const cantidadTotal = carrito.reduce((total, articulo) => total + articulo.cantidad, 0)
            tituloCarrito.textContent = `MI CARRITO (${cantidadTotal})`
        }

        // mostrar un mensaje y totales en cero si no hay productos.
        if (carrito.length === 0) {
            contenedorCarrito.innerHTML = `
                <p class="mensaje-carrito-vacio">
                    Tu carrito está actualmente vacío. Podés explorar nuestras prendas en el
                    <a href="catalogo.html">Catálogo</a>.
                </p>
            `

            if (resumenSubtotal) resumenSubtotal.textContent = '$0'
            if (resumenEnvio) resumenEnvio.textContent = '$0'
            if (resumenTotal) resumenTotal.textContent = '$0'
            if (costoEnvioTexto) costoEnvioTexto.textContent = 'Costo de envío estimado: $0'
            return
        }

        // separar las variantes para mostrar cada una con su cantidad.
        const productosUnicos = []
        carrito.forEach((linea) => {
            const yaAgregado = productosUnicos.some((articulo) => {
                return articulo.id === linea.id && articulo.talle === linea.talle && articulo.color === linea.color
            })

            if (!yaAgregado) {
                productosUnicos.push(linea)
            }
        })

        let subtotal = 0
        let carritoHTML = ''

        productosUnicos.forEach((linea, indice) => {
            const producto = productosUrban.find((item) => {
                return item.id === linea.id
            })

            if (producto) {
                // usar la cantidad guardada para esta variante.
                const cantidad = linea.cantidad

                subtotal += producto.precio * cantidad

                carritoHTML += `
                    <article>
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                        <div>
                            <h4>${producto.nombre}</h4>
                            <p>Color: ${linea.color} · Talle: ${linea.talle}</p>
                            <p>Precio unitario: $${producto.precio}</p>
                        </div>
                        <div>
                            <span>Cantidad: ${cantidad}</span>
                            <button type="button" class="boton-eliminar" data-indice="${indice}">
                                Eliminar producto
                            </button>
                        </div>
                    </article>
                `
            }
        })

        contenedorCarrito.innerHTML = carritoHTML

        // por ahora, el envío es fijo para cualquier carrito no vacío.
        const costoEnvio = costoEnvioFijo
        const total = subtotal + costoEnvio

        if (resumenSubtotal) resumenSubtotal.textContent = `$${subtotal}`
        if (resumenEnvio) resumenEnvio.textContent = `$${costoEnvio}`
        if (resumenTotal) resumenTotal.textContent = `$${total}`
        if (costoEnvioTexto) costoEnvioTexto.textContent = `Costo de envío estimado: $${costoEnvio}`

        // eliminar solo la variante seleccionada.
        const botonesEliminar = contenedorCarrito.querySelectorAll('.boton-eliminar')
        botonesEliminar.forEach((boton) => {
            boton.addEventListener('click', () => {
                const nuevoCarrito = obtenerCarrito()
                nuevoCarrito.splice(Number(boton.dataset.indice), 1)

                guardarCarrito(nuevoCarrito)
                renderizarPaginaCarrito()
            })
        })
    }

    // botones de productos sugeridos: agregar una unidad al carrito.
    const botonesSugeridos = document.querySelectorAll('.boton-sugerido')
    botonesSugeridos.forEach((boton) => {
        boton.addEventListener('click', () => {
            const idSugerido = Number(boton.dataset.id)
            const producto = productosUrban.find((item) => {
                return item.id === idSugerido
            })

            if (producto) {
                const carrito = obtenerCarrito()
                carrito.push({ id: producto.id, talle: producto.talles[0], color: producto.colores[0], cantidad: 1 })
                guardarCarrito(carrito)
                renderizarPaginaCarrito()
            }
        })
    })

    // la confirmación solo debe vaciar el carrito después de guardar el pedido.
    if (formCheckout) {
        formCheckout.addEventListener('submit', (evento) => {
            const carrito = obtenerCarrito()

            if (carrito.length === 0) {
                evento.preventDefault()
                alert('Tu carrito está vacío. Agregá un producto antes de continuar.')
                return
            }

            if (!/^[0-9]{4,8}$/.test(codigoPostal.value.trim())) {
                evento.preventDefault()
                costoEnvioTexto.textContent = 'Ingresá un código postal válido (de 4 a 8 números).'
                codigoPostal.focus()
                return
            }

            const datosComprador = new FormData(formCheckout)
            const subtotal = carrito.reduce((total, linea) => {
                const producto = productosUrban.find((item) => item.id === linea.id)
                return total + (producto ? producto.precio * linea.cantidad : 0)
            }, 0)
            const pedido = {
                nombre: datosComprador.get('nombre'),
                direccion: datosComprador.get('direccion'),
                articulos: carrito.map((linea) => {
                    const producto = productosUrban.find((item) => item.id === linea.id)
                    return {
                        nombre: producto ? producto.nombre : 'Producto',
                        talle: linea.talle,
                        color: linea.color,
                        cantidad: linea.cantidad,
                        precio: producto ? producto.precio : 0
                    }
                }),
                subtotal,
                envio: costoEnvioFijo,
                total: subtotal + costoEnvioFijo
            }

            // guardar el resumen antes de vaciar el carrito en la confirmación.
            sessionStorage.setItem('pedidoPendiente', JSON.stringify(pedido))
        })
    }

    renderizarPaginaCarrito()
}

// página de confirmación: mostrar el pedido y vaciar el carrito solo al confirmarlo.
const confirmacionCompra = document.getElementById('confirmacion-compra')

if (confirmacionCompra) {
    const pedido = JSON.parse(sessionStorage.getItem('pedidoPendiente') || 'null')

    if (!pedido || pedido.articulos.length === 0) {
        confirmacionCompra.innerHTML = '<h2>No hay una compra para confirmar</h2><p>Podés revisar el carrito y completar el pedido.</p><p><a href="carrito.html">Volver al carrito</a></p>'
    } else {
        let productosHTML = ''
        pedido.articulos.forEach((articulo) => {
            productosHTML += `<li>${articulo.nombre} - talle ${articulo.talle}, color ${articulo.color}, cantidad ${articulo.cantidad}</li>`
        })

        confirmacionCompra.innerHTML = `
            <h2>Pedido confirmado</h2>
            <p>Gracias, ${pedido.nombre}.</p>
            <p>Dirección de entrega: ${pedido.direccion}</p>
            <ul>${productosHTML}</ul>
            <p>Subtotal: $${pedido.subtotal}</p>
            <p>Envío estimado: $${pedido.envio}</p>
            <p>Total: <strong>$${pedido.total}</strong></p>
            <p>Esta compra es una simulación. No se procesó un pago real.</p>
            <p><a href="catalogo.html">Seguir comprando</a></p>
        `

        vaciarCarrito()
        sessionStorage.removeItem('pedidoPendiente')
        actualizarContador()
    }
}
