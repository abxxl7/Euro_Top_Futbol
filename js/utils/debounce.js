// Funcion para no filtrar en cada tecla presionada sino esperar a que
// el usuario termine de escribir
export default function debounce(cb, ms = 300) {
    let temporizador;
    return function (...args) {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => cb.apply(this, args), ms);
    };
}
