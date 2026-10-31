async function cargarProductos() {
    const respuesta = await fetch(new URL('../datos/productos.json', import.meta.url))
    if (!respuesta.ok) {
        throw new Error(`No se pudo cargar el catálogo (${respuesta.status}).`)
    }

    const productos = await respuesta.json()
    if (!Array.isArray(productos)) {
        throw new Error('El archivo de productos no contiene una lista válida.')
    }

    return productos
}

export { cargarProductos }
