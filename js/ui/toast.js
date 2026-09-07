// Notificaciones temporales.
const contenedor = document.querySelector(".toast-contenedor");

// Funcion que crea el toast y programa su desaparicion
export function mostrarToast(mensaje, tipo = "exito") {
    if (!contenedor) return;

    const toast = document.createElement("div");
    toast.className = `toast toast--${tipo}`;
    toast.textContent = mensaje;
    contenedor.appendChild(toast);

    // Despues de 3s empieza la animacion de salida, y a los 300ms mas
    // recien lo sacamos del DOM para que la transicion se vea completa
    setTimeout(() => {
        toast.classList.add("toast--saliendo");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Atajos para no repetir el string del tipo en main.js
export function mostrarToastExito(mensaje) {
    mostrarToast(mensaje, "exito");
}

export function mostrarToastError(mensaje) {
    mostrarToast(mensaje, "error");
}