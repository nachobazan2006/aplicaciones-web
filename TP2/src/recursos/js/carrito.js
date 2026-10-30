import { productosUrban } from './productos.js'
import {
    obtenerCarrito,
    guardarCarrito,
    vaciarCarrito,
    renderizarDetalleProducto,
    obtenerIdProductoSeleccionado
} from './funciones.js'

// 1. Actualizar el contador del carrito en el header (común a cualquier página que cargue carrito.js)
const productosSeleccionados = document.getElementById('productos-seleccionados')
const carritoActual = obtenerCarrito()
if (productosSeleccionados) {
    productosSeleccionados.textContent = `(${carritoActual.length})`
}

// 2. Si estamos en la página de detalle de producto (producto.html), renderizar el producto seleccionado
const contenedorDetalle = document.getElementById('contenedor-detalle-producto')
if (contenedorDetalle) {
    const idSeleccionado = obtenerIdProductoSeleccionado()
    const producto = productosUrban.find((item) => {
        return item.id === idSeleccionado
    })

    if (producto) {
        renderizarDetalleProducto(contenedorDetalle, producto)
    }

    // Asociar evento de compra al formulario dinámicamente renderizado
    const formCompra = document.querySelector('.form-compra')
    if (formCompra) {
        formCompra.addEventListener('submit', (evento) => {
            const inputCantidad = document.getElementById('input-cantidad')
            let cantidad = 1
            if (inputCantidad) {
                cantidad = parseInt(inputCantidad.value)
            }
            if (isNaN(cantidad) || cantidad < 1) {
                cantidad = 1
            }

            let idProducto = producto ? producto.id : 1
            const botonAgregar = document.getElementById('boton-agregar-detalle')
            if (botonAgregar && botonAgregar.dataset.id) {
                idProducto = parseInt(botonAgregar.dataset.id)
            }

            const carrito = obtenerCarrito()
            for (let i = 0; i < cantidad; i++) {
                carrito.push(idProducto)
            }
            guardarCarrito(carrito)
        })
    }
}

// 3. Si estamos en la página del carrito (carrito.html)
const contenedorCarrito = document.getElementById('contenedor-carrito')
if (contenedorCarrito) {
    const tituloCarrito = document.getElementById('titulo-carrito')
    const resumenSubtotal = document.getElementById('resumen-subtotal')
    const resumenEnvio = document.getElementById('resumen-envio')
    const resumenTotal = document.getElementById('resumen-total')
    const costoEnvioTexto = document.getElementById('costo-envio-texto')
    const formCheckout = document.getElementById('form-checkout')

    function renderizarPaginaCarrito() {
        let productosEnCarro = obtenerCarrito()

        // Actualizamos contador en el header y título principal
        if (productosSeleccionados) {
            productosSeleccionados.textContent = `(${productosEnCarro.length})`
        }
        if (tituloCarrito) {
            tituloCarrito.textContent = `MI CARRITO (${productosEnCarro.length})`
        }

        // Si el carrito está vacío
        if (productosEnCarro.length === 0) {
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

        // Si tiene productos: agrupamos IDs únicos para contar cantidades
        const productosUnicos = []
        productosEnCarro.forEach((id) => {
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
                const cantidad = productosEnCarro.filter((itemId) => {
                    return itemId === id
                }).length

                subtotal = subtotal + (producto.precio * cantidad)

                carritoHTML += `
                <article>
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                    <div>
                        <h4>${producto.nombre}</h4>
                        <p>Precio unitario: $${producto.precio}</p>
                    </div>
                    <form action="#" method="get">
                        <label for="cant-art-${producto.id}">Cantidad:</label>
                        <input type="number" id="cant-art-${producto.id}" name="cantidad" value="${cantidad}" min="1" readonly>
                        <button type="button" class="boton-eliminar" data-id="${producto.id}">Eliminar</button>
                    </form>
                </article>
                `
            }
        })

        contenedorCarrito.innerHTML = carritoHTML

        const costoEnvio = 3500
        const total = subtotal + costoEnvio

        if (resumenSubtotal) resumenSubtotal.textContent = `$${subtotal}`
        if (resumenEnvio) resumenEnvio.textContent = `$${costoEnvio}`
        if (resumenTotal) resumenTotal.textContent = `$${total}`
        if (costoEnvioTexto) costoEnvioTexto.textContent = `Costo de envío estimado: $${costoEnvio}`

        // Escuchadores para los botones Eliminar
        const botonesEliminar = contenedorCarrito.querySelectorAll('.boton-eliminar')
        botonesEliminar.forEach((boton) => {
            boton.addEventListener('click', (evento) => {
                const idAEliminar = parseInt(boton.dataset.id)
                productosEnCarro = productosEnCarro.filter((id) => {
                    return id !== idAEliminar
                })
                guardarCarrito(productosEnCarro)
                renderizarPaginaCarrito()
            })
        })
    }

    // Escuchadores para los botones de productos sugeridos ("TE PUEDE INTERESAR")
    const botonesSugeridos = document.querySelectorAll('.boton-sugerido')
    botonesSugeridos.forEach((boton) => {
        boton.addEventListener('click', (evento) => {
            const idSugerido = parseInt(boton.dataset.id)
            let carritoActualizado = obtenerCarrito()
            carritoActualizado.push(idSugerido)
            guardarCarrito(carritoActualizado)
            renderizarPaginaCarrito()
        })
    })

    // Validación al enviar el pedido
    if (formCheckout) {
        formCheckout.addEventListener('submit', (evento) => {
            const carritoActualizado = obtenerCarrito()
            if (carritoActualizado.length === 0) {
                evento.preventDefault()
                alert('Tu carrito está actualmente vacío. Por favor selecciona alguna prenda del catálogo antes de comprar.')
            }
        })
    }

    renderizarPaginaCarrito()
}

// 4. Si estamos en la página de confirmación de compra (confirmacion.html), vaciar el carrito
const confirmacionCompra = document.getElementById('confirmacion-compra')
if (confirmacionCompra) {
    vaciarCarrito()
    if (productosSeleccionados) {
        productosSeleccionados.textContent = '(0)'
    }
}
