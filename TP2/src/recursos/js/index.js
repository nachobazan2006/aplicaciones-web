import { cargarProductos } from './productos.js'
import { renderizarCatalogo, filtrarPorTalle, filtrarPorCategoria, filtrarPorTexto, obtenerCarrito, guardarCarrito } from './funciones.js'

const contenedor = document.getElementById('contenedor-productos')
const contador = document.getElementById('productos-seleccionados')
const dialogo = document.getElementById('dialogo')
const categoria = document.getElementById('filtro-categoria')
const talle = document.getElementById('filtro-talle')
const buscar = document.getElementById('buscar-nav')
const aplicar = document.getElementById('boton-aplicar-filtros')
const limpiar = document.getElementById('boton-limpiar-filtros')

let productos = []

function actualizarCatalogo() {
    let lista = filtrarPorTexto(productos, buscar?.value || '')
    lista = filtrarPorCategoria(lista, categoria?.value || 'todas')
    lista = filtrarPorTalle(lista, talle?.value || 'todos')
    renderizarCatalogo(contenedor, lista)
}

try {
    productos = await cargarProductos()
    const parametros = new URLSearchParams(location.search)
    if (buscar) buscar.value = parametros.get('q') || ''
    if (categoria && parametros.has('cat')) categoria.value = parametros.get('cat')
    if (talle && parametros.has('talle')) talle.value = parametros.get('talle')
    if (contador) contador.textContent = `(${obtenerCarrito().reduce((total, item) => total + item.cantidad, 0)})`
    actualizarCatalogo()

    aplicar?.addEventListener('click', actualizarCatalogo)
    buscar?.addEventListener('input', actualizarCatalogo)
    categoria?.addEventListener('change', actualizarCatalogo)
    talle?.addEventListener('change', actualizarCatalogo)
    limpiar?.addEventListener('click', () => {
        if (buscar) buscar.value = ''
        if (categoria) categoria.value = 'todas'
        if (talle) talle.value = 'todos'
        history.replaceState(null, '', location.pathname)
        actualizarCatalogo()
    })

    contenedor?.addEventListener('click', (evento) => {
        const boton = evento.target.closest('.boton-agregar-producto')
        const enlace = evento.target.closest('.enlace-ver-producto')
        if (enlace) localStorage.setItem('productoSeleccionado', enlace.dataset.id)
        if (!boton) return
        const producto = productos.find((item) => item.id === Number(boton.dataset.id))
        if (!producto) return
        const carrito = obtenerCarrito()
        carrito.push({ id: producto.id, talle: producto.talles[0], color: producto.colores[0], cantidad: 1 })
        guardarCarrito(carrito)
        if (contador) contador.textContent = `(${obtenerCarrito().reduce((total, item) => total + item.cantidad, 0)})`
        if (dialogo?.showModal) dialogo.showModal()
    })
} catch (error) {
    console.error(error)
    if (contenedor) contenedor.innerHTML = '<p role="alert">No pudimos cargar el catálogo. Revisá tu conexión e intentá recargar la página.</p>'
}
