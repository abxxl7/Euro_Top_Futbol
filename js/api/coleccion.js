import { pedirDatos } from "./client.js";

//URL de la coleccion
const URL_COLECCION = "http://localhost:3000/favoritos";

//Metodo GET
export async function equiposFavoritos() {
    return pedirDatos(URL_COLECCION);
}

//Metodo POST
export async function agregarNuevoFavorito(equipo) {
    return pedirDatos(URL_COLECCION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipo),
    });
}

//Metodo PUT
export async function editarFavorito(id, datosActualizados) {
    return pedirDatos(`${URL_COLECCION}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify(datosActualizados),
    });
}

//Metodo PATCH
export async function editarCalificacion(id, calificacion) {
    return pedirDatos(`${URL_COLECCION}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calificacion }),
    });
}

//Metodo DELETE
export async function eliminarEquipoFavorito(id) {
    return pedirDatos(`${URL_COLECCION}/${id}`, {
        method: "DELETE",
    });
}