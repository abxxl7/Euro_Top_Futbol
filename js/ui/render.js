import { formatearTexto } from "../utils/format.js";

// Se guardan los elemenetos de manera temporal una sola vez porque se usan
// en varias funciones
const grilla = document.querySelector("#grilla-equipos");
const estadoCarga = document.querySelector("#estado-carga");
const estadoError = document.querySelector("#estado-error");
const estadoVacio = document.querySelector("#estado-vacio");
const selectLiga = document.querySelector("#select-liga");
const listaFavoritos = document.querySelector("#lista-favoritos");
const coleccionVacio = document.querySelector("#coleccion-vacio");

// Funcion que muestra u oculta el spinner de carga
export function mostrarCarga(mostrar) {
    estadoCarga?.classList.toggle("oculto", !mostrar);
}

// Funcion que muestra un mensaje de error, o lo limpia si se le pasa null
export function mostrarError(mensaje) {
    if (!estadoError) return;
    if (!mensaje) {
        estadoError.classList.add("oculto");
        estadoError.textContent = "";
        return;
    }
    estadoError.textContent = mensaje;
    estadoError.classList.remove("oculto");
}

// Funcion que dibuja la grilla de equipos.
export function renderGrilla(equipos, onSeleccionar) {
    if (!grilla) return;
    grilla.innerHTML = "";

    if (equipos.length === 0) {
        estadoVacio?.classList.remove("oculto");
        return;
    }
    estadoVacio?.classList.add("oculto");

    const fragmento = document.createDocumentFragment();
    equipos.forEach((equipo) => fragmento.appendChild(crearTarjetaEquipo(equipo)));
    grilla.appendChild(fragmento);

    grilla.onclick = (event) => {
        const tarjeta = evento.target.closest(".tarjeta-equipo");
        if (!tarjeta) return;
        onSeleccionar(tarjeta.dataset.id);
    };
}

function crearTarjetaEquipo(equipo) {
    const articulo = document.createElement("article");
    articulo.className = "tarjeta-equipo";
    articulo.dataset.id = equipo.idTeam;

    const img = document.createElement("img");
    img.className = "tarjeta-equipo__escudo";
    img.src = equipo.strBadge || "";
    img.alt = `Escudo de ${equipo.strTeam}`;
    img.loading = "lazy";
    articulo.appendChild(img);

    const titulo = document.createElement("h3");
    titulo.textContent = equipo.strTeam;
    articulo.appendChild(titulo);

    const liga = document.createElement("p");
    liga.className = "tarjeta-equipo__dato";
    liga.textContent = formatearTexto(equipo.strLeague);
    articulo.appendChild(liga);

    const pais = document.createElement("p");
    pais.className = "tarjeta-equipo__dato";
    pais.textContent = formatearTexto(equipo.strCountry);
    articulo.appendChild(pais);

    return articulo;
}

// Funcion que llena el <select> de ligas que realmeente vinieron de los datos,
// conservarndo la seleccion actual del usuario.
export function poblarFiltroLigas(ligas) {
    if (!selectLiga) return;
    const valorActual = selectLiga.value;

    selectLiga.innerHTML = "";
    const opcionTodas = document.createElement("option");
    opcionTodas.value = "Todas";
    opcionTodas.textContent = "Todas las ligas";
    selectLiga.appendChild(opcionTodas);

    ligas.forEach((liga) => {
        const opcion = document.createElement("option");
        opcion.value = liga;
        opcion.textContent = liga;
        selectLiga.appendChild(opcion);
    });

    const sigueExistiendo = [...selectLiga.options].some((o) => o.value === valorActual);
    if (sigueExistiendo) selectLiga.value = valorActual;
}

// Funcion que dibuja la lista de favoritos
export function renderFavoritos(favoritos, callbacks) {
    if (!listaFavoritos) return;
    listaFavoritos.innerHTML = "";

    if (favoritos.length === 0) {
        coleccionVacio?.classList.remove("oculto");
        return;
    }
    coleccionVacio?.classList.add("oculto");

    const fragmento = document.createDocumentFragment();
    favoritos.forEach((favorito) => fragmento.appendChild(crearFilaFavorito(favorito, callbacks)));
    listaFavoritos.appendChild(fragmento);
}

function crearFilaFavorito(favorito, callbacks) {
    const fila = document.createElement("article");
    fila.className = "fila-favorito";

    const img = document.createElement("img");
    img.className = "favorito__escudo";
    img.src = favorito.strBadge || "";
    img.alt = `Escudo de ${favorito.strTeam}`;
    fila.appendChild(img);

    const info = document.createElement("div");
    info.className = "favorito__info";

    const nombre = document.createElement("h4");
    nombre.textContent = favorito.strTeam;
    info.appendChild(nombre);

    const nota = document.createElement("p");
    nota.className = "favorito__nota";
    nota.textContent = favorito.nota ? favorito.nota : "Sin nota personal";
    info.appendChild(nota);

    fila.appendChild(info);
    fila.appendChild(crearSelectorCalificacion(favorito, callbacks));
    fila.appendChild(crearAccionesFavorito(favorito, callbacks));

    return fila;
}

 // Funcion que crea los botones con las estrellas. Solo cambia la calificacion, no la nota
function crearSelectorCalificacion(favorito, callbacks) {
    const contenedor = document.createElement("div");
    contenedor.className = "selector-estrellas";
    contenedor.setAttribute("role", "radiogroup");
    contenedor.setAttribute("aria-label", `Calificación de ${favorito.strTeam}`);

    for (let valor = 1; valor <= 5; valor++) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "selector-estrellas__boton";
        boton.classList.toggle("activa", valor <= Number(favorito.calificacion));
        boton.setAttribute("aria-label", `${valor} estrella${valor > 1 ? "s" : ""}`);
        boton.innerHTML = '<i data-lucide="star"></i>';
        boton.addEventListener("click", () => callbacks.onCambiarCalificacion(favorito.id, valor));
        contenedor.appendChild(boton);
    }
    
    // Los botones que se crean, hay que convertirlos a svg
    window.Lucide?.createIcons({ root: contenedor });

    return contenedor;
}

function crearAccionesFavorito(favorito, callbacks) {
    const acciones = document.createElement("div");
    acciones.className = "favorito__acciones";

    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.className = "boton boton--secundario";
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", () => callbacks.onEditar(favorito));
    acciones.appendChild(btnEditar);

    const btnBorrar = document.createElement("button");
    btnBorrar.type = "button";
    btnBorrar.className = "boton boton--peligro";
    btnBorrar.textContent = "Eliminar";
    btnBorrar.addEventListener("click", () => callbacks.onEliminar(favorito));
    acciones.appendChild(btnBorrar);

    return acciones;
}
