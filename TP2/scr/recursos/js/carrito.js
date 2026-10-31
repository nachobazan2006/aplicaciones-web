
import { productosUrban } from './productos.js'
import {
    obtenerCarrito,
    guardarCarrito,
    vaciarCarrito,
    renderizarDetalleProducto,
    obtenerIdProductoSeleccionado
} from './funciones.js'

// Mostrar cuántas unidades hay en el carrito (en el encabezado).
const productosSeleccionados = document.getElementById('productos-seleccionados')

function actualizarContador() {
    if (productosSeleccionados) {
        const carrito = obtenerCarrito()
        productosSeleccionados.textContent = `(${carrito.length})`
    }
}

actualizarContador()

// PÁGINA DE DETALLE: mostrar el producto seleccionado y permitir agregarlo.
const contenedorDetalle = document.getElementById('contenedor-detalle-producto')

if (contenedorDetalle) {
    const idSeleccionado = obtenerIdProductoSeleccionado()
    const producto = productosUrban.find((item) => {
        return item.id === idSeleccionado
    })

    if (producto) {
        renderizarDetalleProducto(contenedorDetalle, producto)

        // El formulario se crea dentro de renderizarDetalleProducto().
        const formCompra = document.querySelector('.form-compra')

        if (formCompra) {
            formCompra.addEventListener('submit', (evento) => {
                evento.preventDefault()

                const inputCantidad = document.getElementById('input-cantidad')
                const cantidad = Number(inputCantidad.value)

                if (!Number.isInteger(cantidad) || cantidad < 1) {
                    alert('Ingresá una cantidad válida.')
                    return
                }

                const carrito = obtenerCarrito()

                // Guardamos el ID tantas veces como unidades pidió el usuario.
                for (let i = 0; i < cantidad; i++) {
                    carrito.push(producto.id)
                }

                guardarCarrito(carrito)
                actualizarContador()
                window.location.href = 'carrito.html'
            })
        }
    } else {
        contenedorDetalle.textContent = 'No encontramos el producto seleccionado.'
    }
}

// PÁGINA DEL CARRITO: mostrar los productos y calcular el total.
const contenedorCarrito = document.getElementById('contenedor-carrito')

if (contenedorCarrito) {
    const tituloCarrito = document.getElementById('titulo-carrito')
    const resumenSubtotal = document.getElementById('resumen-subtotal')
    const resumenEnvio = document.getElementById('resumen-envio')
    const resumenTotal = document.getElementById('resumen-total')
    const costoEnvioTexto = document.getElementById('costo-envio-texto')
    const formCheckout = document.getElementById('form-checkout')

    function renderizarPaginaCarrito() {
        const carrito = obtenerCarrito()
        actualizarContador()

        if (tituloCarrito) {
            tituloCarrito.textContent = `MI CARRITO (${carrito.length})`
        }

        // Mostrar un mensaje y totales en cero si no hay productos.
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

        // Crear un arreglo con IDs sin repetir.
        const productosUnicos = []
        carrito.forEach((id) => {
            if (!productosUnicos.includes(id)) {
                productosUnicos.push(id)
            }
        })

        let subtotal = 0
        let carritoHTML = ''

        productosUnicos.forEach((id) => {
            const producto = productosUrban.find((item) => {
                return item.id === id
            })

            if (producto) {
                // Contar las veces que aparece el ID (cantidad comprada).
                const cantidad = carrito.filter((itemId) => {
                    return itemId === id
                }).length

                subtotal += producto.precio * cantidad

                carritoHTML += `
                    <article>
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                        <div>
                            <h4>${producto.nombre}</h4>
                            <p>Precio unitario: $${producto.precio}</p>
                        </div>
                        <div>
                            <span>Cantidad: ${cantidad}</span>
                            <button type="button" class="boton-eliminar" data-id="${producto.id}">
                                Eliminar producto
                            </button>
                        </div>
                    </article>
                `
            }
        })

        contenedorCarrito.innerHTML = carritoHTML

        // Por ahora, el envío es fijo para cualquier carrito no vacío.
        const costoEnvio = 3500
        const total = subtotal + costoEnvio

        if (resumenSubtotal) resumenSubtotal.textContent = `$${subtotal}`
        if (resumenEnvio) resumenEnvio.textContent = `$${costoEnvio}`
        if (resumenTotal) resumenTotal.textContent = `$${total}`
        if (costoEnvioTexto) costoEnvioTexto.textContent = `Costo de envío estimado: $${costoEnvio}`

        // Eliminar todas las unidades del producto seleccionado.
        const botonesEliminar = contenedorCarrito.querySelectorAll('.boton-eliminar')
        botonesEliminar.forEach((boton) => {
            boton.addEventListener('click', () => {
                const idAEliminar = Number(boton.dataset.id)
                const nuevoCarrito = obtenerCarrito().filter((id) => {
                    return id !== idAEliminar
                })

                guardarCarrito(nuevoCarrito)
                renderizarPaginaCarrito()
            })
        })
    }

    // Botones de productos sugeridos: agregar una unidad al carrito.
    const botonesSugeridos = document.querySelectorAll('.boton-sugerido')
    botonesSugeridos.forEach((boton) => {
        boton.addEventListener('click', () => {
            const idSugerido = Number(boton.dataset.id)
            const producto = productosUrban.find((item) => {
                return item.id === idSugerido
            })

            if (producto) {
                const carrito = obtenerCarrito()
                carrito.push(producto.id)
                guardarCarrito(carrito)
                renderizarPaginaCarrito()
            }
        })
    })

    // La confirmación solo debe vaciar el carrito después de enviar el formulario.
    if (formCheckout) {
        formCheckout.addEventListener('submit', (evento) => {
            if (obtenerCarrito().length === 0) {
                evento.preventDefault()
                alert('Tu carrito está vacío. Agregá un producto antes de continuar.')
                return
            }

            // Marca una confirmación pendiente para la página siguiente.
            sessionStorage.setItem('pedidoConfirmado', 'si')
        })
    }

    renderizarPaginaCarrito()
}

// PÁGINA DE CONFIRMACIÓN: vaciar solo después de enviar un pedido.
const confirmacionCompra = document.getElementById('confirmacion-compra')

if (confirmacionCompra) {
    if (sessionStorage.getItem('pedidoConfirmado') === 'si') {
        vaciarCarrito()
        sessionStorage.removeItem('pedidoConfirmado')
        actualizarContador()
    }
}
