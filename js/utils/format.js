// Funciones chiquitas para no repetir código en varios lugares

// Funcion para limpiar un texto y asegurar que no este vacio
export function formatearTexto(valor, porDefecto = "No disponible") {
    if (!valor || typeof valor !== "string" || valor.trim() === "") {
        return porDefecto;
    }
    return valor.trim();
}

// Funcion que arma el texto del año de fundacion del equipo
export function formatearAnio(anio) {
    if (!anio) return "Año de fundacion desconocido";
    return `Fundado en ${anio}`;
}

// Funcion que recorta una descripcion larga para que no rompa el layout del modal
function truncarTexto(texto, maxCaracteres = 220) {
    const textoSeguro = formatearTexto(texto, "");
    if (!textoSeguro) return "Sin descripcion disponible.";
    if (textoSeguro.length <= maxCaracteres) return textoSeguro;
    return `${textoSeguro.slice(0, maxCaracteres)}...`;
}

// Funcion que pone en mayuscula la primera letra
function capitalizar(texto) {
    if (!texto) return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Exportacion agrupada de las funciones de formateo
export { truncarTexto, capitalizar };