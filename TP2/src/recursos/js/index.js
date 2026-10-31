import { productosUrban, categorias } from './productos.js'
import {
    renderizarCatalogo,
    filtrarPorTalle,
    filtrarPorCategoria,
    obtenerCarrito,
    guardarCarrito
} from './funciones.js'

let productosEnCarro = obtenerCarrito()

const contenedorProductos = document.getElementById("contenedor-productos")
const dialogo = document.getElementById('dialogo')
const productosSeleccionados = document.getElementById('productos-seleccionados')
const botonFiltrar = document.getElementById('boton-aplicar-filtros')
const botonLimpiar = document.getElementById('boton-limpiar-filtros')
const selectCategoria = document.getElementById('filtro-categoria')
const selectTalle = document.getElementById('filtro-talle')

// Inicializar el contador en el header con la cantidad actual (inicia en 0 si está vacío)
if (productosSeleccionados) {
    productosSeleccionados.textContent = `(${productosEnCarro.length})`
}

// Renderizamos el catálogo completo
renderizarCatalogo(contenedorProductos, productosUrban)

// Función para asociar eventos a los botones de cada producto
function asignarEventosBotones() {
    const botonesProducto = contenedorProductos.querySelectorAll('.boton-agregar-producto')

    botonesProducto.forEach((boton) => {
        boton.addEventListener('click', (evento) => {
            const idProducto = parseInt(boton.dataset.id)
            productosEnCarro.push(idProducto)
            guardarCarrito(productosEnCarro)
            console.log(productosEnCarro)

            if (productosSeleccionados) {
                productosSeleccionados.textContent = `(${productosEnCarro.length})`
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

// Asignamos los escuchadores a los botones de productos renderizados
asignarEventosBotones()

// Eventos de filtrado
if (botonFiltrar) {
    botonFiltrar.addEventListener('click', (evento) => {
        let productosFiltrados = productosUrban

        if (selectCategoria && selectCategoria.value !== 'todas') {
            productosFiltrados = filtrarPorCategoria(productosFiltrados, selectCategoria.value)
        }

        if (selectTalle && selectTalle.value !== 'todos') {
            productosFiltrados = filtrarPorTalle(productosFiltrados, selectTalle.value)
        }

        renderizarCatalogo(contenedorProductos, productosFiltrados)
        asignarEventosBotones()
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

        renderizarCatalogo(contenedorProductos, productosUrban)
        asignarEventosBotones()
    })
}
