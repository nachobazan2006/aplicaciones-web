import { cargarProductos } from './productos.js'
import {
    renderizarCatalogo,
    filtrarPorTalle,
    filtrarPorCategoria,
    filtrarPorTexto,
    obtenerCarrito,
    guardarCarrito
} from './funciones.js'

let productosEnCarro = obtenerCarrito()
let productosUrban = []
let productosCargados = false

const contenedorProductos = document.getElementById("contenedor-productos")
const dialogo = document.getElementById('dialogo')
const productosSeleccionados = document.getElementById('productos-seleccionados')
const botonFiltrar = document.getElementById('boton-aplicar-filtros')
const botonLimpiar = document.getElementById('boton-limpiar-filtros')
const selectCategoria = document.getElementById('filtro-categoria')
const selectTalle = document.getElementById('filtro-talle')
const buscar = document.getElementById('buscar-nav')

try {
    productosUrban = await cargarProductos()
    productosCargados = true
} catch (error) {
    console.error(error)
    if (contenedorProductos) {
        contenedorProductos.innerHTML = '<p role="alert">No se pudieron cargar los productos. Intentá recargar la página.</p>'
    }
}

// inicializar el contador en el header con la cantidad actual (inicia en 0 si está vacío).
if (productosSeleccionados) {
    productosSeleccionados.textContent = `(${productosEnCarro.reduce((total, item) => total + item.cantidad, 0)})`
}

// renderizamos el catálogo completo.
if (productosCargados) {
    const parametros = new URLSearchParams(window.location.search)
    if (buscar) buscar.value = parametros.get('q') || ''
    actualizarCatalogo()
}

function actualizarCatalogo() {
    if (!productosCargados) {
        return
    }

    let productosFiltrados = filtrarPorTexto(productosUrban, buscar?.value || '')

    if (selectCategoria && selectCategoria.value !== 'todas') {
        productosFiltrados = filtrarPorCategoria(productosFiltrados, selectCategoria.value)
    }

    if (selectTalle && selectTalle.value !== 'todos') {
        productosFiltrados = filtrarPorTalle(productosFiltrados, selectTalle.value)
    }

    renderizarCatalogo(contenedorProductos, productosFiltrados)
    asignarEventosBotones()
}

// función para asociar eventos a los botones de cada producto.
function asignarEventosBotones() {
    const botonesProducto = contenedorProductos.querySelectorAll('.boton-agregar-producto')

    botonesProducto.forEach((boton) => {
        boton.addEventListener('click', (evento) => {
            const idProducto = parseInt(boton.dataset.id)
            const producto = productosUrban.find((item) => item.id === idProducto)
            if (!producto) return
            productosEnCarro.push({ id: producto.id, talle: producto.talles[0], color: producto.colores[0], cantidad: 1 })
            guardarCarrito(productosEnCarro)
            console.log(productosEnCarro)

            if (productosSeleccionados) {
                productosSeleccionados.textContent = `(${productosEnCarro.reduce((total, item) => total + item.cantidad, 0)})`
            }

            if (dialogo) {
                dialogo.showModal()
            }
        })
    })

    const enlacesVer = contenedorProductos.querySelectorAll('.enlace-ver-producto')
    enlacesVer.forEach((enlace) => {
        enlace.addEventListener('click', (evento) => {
            const id = parseInt(enlace.dataset.id)
            localStorage.setItem('productoSeleccionado', id)
        })
    })
}

// eventos de filtrado.
if (botonFiltrar) {
    botonFiltrar.addEventListener('click', (evento) => {
        actualizarCatalogo()
    })
}

if (botonLimpiar) {
    botonLimpiar.addEventListener('click', (evento) => {
        if (selectCategoria) {
            selectCategoria.value = 'todas'
        }
        if (selectTalle) {
            selectTalle.value = 'todos'
        }

        if (buscar) buscar.value = ''
        actualizarCatalogo()
    })
}

if (buscar) {
    buscar.addEventListener('input', actualizarCatalogo)
}
