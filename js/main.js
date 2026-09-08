import { state } from "./state.js";
import { topEquiposEuropa as obtenerEquiposTop } from "./api/recursos.js"
import * as coleccionApi from "./api/coleccion.js";
import debounce from "./utils/debounce.js";
import {
    mostrarCargando,
    mostrarError,
    renderGrilla,
    poblarFiltroLigas,
    renderFavoritos,
} from "./ui/render.js";
import { abrirModalDetalle, abrirModalEditarFavorito } from "./ui/modal.js";
import { mostrarToastExito, mostrarToastError } from "./ui/toast.js";

// Convertimos los emojis de lucide del HTML estatico en iconos SVG.
window.lucide?.createIcons();

// Elementos que se consultan mas de una vez
const inputBusqueda = document.querySelector("#input-busqueda");
const selectLiga = document.querySelector("#select-liga");
const btnModoOscuro = document.querySelector("#btn-modo-oscuro");
const iconoLuna = document.querySelector(".icono-modo--luna");
const iconoSol = document.querySelector(".icono-modo--sol");

// Callbacks que le pasamos siempre igual a renderFavoritos.
const callbacksFavoritos = {
    onEditar: manejarEditarFavorito,
    onEliminar: manejarEliminarFavorito,
    onCambiarCalificacion: manejarCambioCalificacionRapido,
};

// Funcion para el modo oscuro
function aplicarModoOscuro(activo) {
    document.body.classList.toggle("modo-oscuro", activo);
    iconoLuna?.classList.toggle("oculto", activo);
    iconoSol?.classList.toggle("oculto", !activo);
    localStorage.setItem("modoOscuro", activo ? "1" : "0");
}

btnModoOscuro?.addEventListener("click", () => {
    aplicarModoOscuro(!document.body.classList.contains("modo-oscuro"));
});

// Recuperamos la preferencia guardada al arrancar
aplicarModoOscuro(localStorage.getItem("modoOscuro") === "1");

// Grilla de equipos + busqueda y filtro por liga
function renderizarEquipos() {
    const texto = state.textoBusqueda.trim().toLowerCase();
    const liga = state.filtroPorLigas;

    const equiposFiltrados = state.equipos.filter((equipo) => {
        const coincideTexto = !texto || equipo.strTeam?.toLowerCase().includes(texto);
        const coincideLiga = liga === "Todas" || equipo.strLeague === liga;
        return coincideTexto && coincideLiga;
    });

    renderGrilla(equiposFiltrados, manejarSeleccionEquipo);
}


function manejarSeleccionEquipo(idTeam) {
    const equipo = state.equipos.find((e) => e.idTeam === idTeam);
    if (!equipo) return;

    const yaEsFavorito = state.favoritos.some((f) => f.idTeam === idTeam);
    abrirModalDetalle(equipo, yaEsFavorito, (datos) => agregarNuevoFavorito(equipo, datos));
}

// El buscador filtra en tiempo real, pero con debounce para
// no reenderizar en cada tecla presionada
const buscarConDebounce = debounce(() => {
    state.textoBusqueda = inputBusqueda?.value ?? "";
    renderizarEquipos();
}, 300);

inputBusqueda?.addEventListener("input", buscarConDebounce);

selectLiga?.addEventListener("change", () => {
    state.filtroPorLigas = selectLiga.value;
    renderizarEquipos();
});

// Coleccion de favoritos (CRUD)
async function cargarFavoritos() {
    try {
        state.favoritos = await coleccionApi.equiposFavoritos();
        renderFavoritos(state.favoritos, callbacksFavoritos);
    }catch (error) {
        mostrarToastError(error.message);
    }
}

async function agregarNuevoFavorito(equipo, datos) {
    try {
        const nuevoFavorito = await coleccionApi.agregarNuevoFavorito({
            idTeam: equipo.idTeam,
            strTeam: equipo.strTeam,
            strBadge: equipo.strBadge,
            strLeague: equipo.strLeague,
            nota: datos.nota,
            calificacion: datos.calificacion,
        });

        //Actualizamos el estado local con la respuesta del
        // servidor para que la UI quede consistente con lo que
        // realmente se guardo
        state.favoritos = [...state.favoritos, nuevoFavorito];
        renderFavoritos(state.favoritos, callbacksFavoritos);
        mostrarToastExito(`${equipo.strTeam} se agregó a tu colección`);
    } catch (error) {
        mostrarToastError(error.message);
    }
}

function manejarEditarFavorito(favorito) {
    abrirModalEditarFavorito(favorito, async (id, datos) => {
        try {
            const actualizado = await coleccionApi.editarFavorito(id, { ...favorito, ...datos});
            state.favoritos = state.favoritos.map((f) => (f.id === id ? actualizado : f));
            renderFavoritos(state.favoritos, callbacksFavoritos);
            mostrarToastExito("Favorito actualizado");
        } catch (error) {
            mostrarToastError(error.message);
        }
    });
}

async function manejarCambioCalificacionRapido(id, calificacion) {
    try {
        const actualizado = await coleccionApi.editarCalificacion(id, calificacion);
        state.favoritos = state.favoritos.map((f) => (f.id === id ? actualizado : f));
        renderFavoritos(state.favoritos, callbacksFavoritos);
        mostrarToastExito("Calificación actualizada");
    } catch (error) {
        mostrarToastError(error.message);
    }
}

async function manejarEliminarFavorito(favorito) {
    const confirmar = window.confirm(`¿Eliminar a ${favorito.strTeam} de tu colección?`);
    if (!confirmar) return;

    try {
        await coleccionApi.eliminarEquipoFavorito(favorito.id);
        state.favoritos = state.favoritos.filter((f) => f.id !== favorito.id);
        renderFavoritos(state.favoritos, callbacksFavoritos);
        mostrarToastExito("Favorito eliminado");
    } catch (error) {
        mostrarToastError(error.message);
    }
}

// Carga inicial
async function iniciar (){
    state.cargando = true;
    mostrarCargando(true);
    mostrarError(null);

    try {
        state.equipos = await obtenerEquiposTop();

        const ligas = [...new Set(state.equipos.map((e) => e.strLeague).filter(Boolean))].sort();
        poblarFiltroLigas(ligas);
        renderizarEquipos();
    } catch (error) {
        state.errorCarga = error.message;
        mostrarError(error.message);
    } finally {
        state.cargando = false;
        mostrarCargando(false);
    }

    // La coleccion se levanta a parte para que no se rompa si
    // es que json server no esta levantado
    await cargarFavoritos();
}

iniciar();