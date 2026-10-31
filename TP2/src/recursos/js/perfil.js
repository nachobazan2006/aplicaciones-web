const formulario = document.getElementById('form-perfil')
const mensaje = document.getElementById('mensaje-perfil')
const clavePerfil = 'perfilUsuario'

try {
    const datos = JSON.parse(localStorage.getItem(clavePerfil) || 'null')
    if (datos && formulario) {
        Object.entries(datos).forEach(([nombre, valor]) => {
            const campo = formulario.elements.namedItem(nombre)
            if (campo) campo.value = valor
        })
    }
} catch (error) {
    console.error('No se pudo leer el perfil guardado:', error)
}

formulario?.addEventListener('submit', (evento) => {
    evento.preventDefault()
    if (!formulario.reportValidity()) return
    const datos = Object.fromEntries(new FormData(formulario).entries())
    try {
        localStorage.setItem(clavePerfil, JSON.stringify(datos))
        mensaje.textContent = 'Los cambios se guardaron en este navegador.'
    } catch (error) {
        mensaje.textContent = 'No se pudieron guardar los cambios en este navegador.'
        console.error(error)
    }
})
