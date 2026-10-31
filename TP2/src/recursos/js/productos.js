async function cargarProductos() {
    const respuesta = await fetch('./recursos/datos/productos.json')

    if (!respuesta.ok) {
        throw new Error(`No se pudieron cargar los productos: ${respuesta.status}`)
    }

    const productos = await respuesta.json()

    if (!Array.isArray(productos)) {
        throw new Error('El archivo de productos no contiene una lista válida.')
    }

    return productos
}

export { cargarProductos }
