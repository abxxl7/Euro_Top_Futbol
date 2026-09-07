// El modal va a mostrar el detalle de un equipo y el formulario para crear o editar
// un favorito
import { createRef } from "react";
import { formatearAnio, truncarTexto, farmatearTexto } from "./utils/format.js";
import { formatearTexto } from "../utils/format.js";

// Guardamos los elementos del modal una sola vez
const modal = document.querySelector("#modal-detalle");
const modalFondo = document.querySelector("#modal-fondo");
const modalCuerpo = document.querySelector("#modal-cuerpo");
const modalCerrar = document.querySelector("#modal-cerrar");

function cerrarModal() {
    modal?.classList.add("oculto");
    if (modalCuerpo) modalCuerpo.innerHTML = "";
}

// El boton de cerrar, el fondo oscuro y la tecla Escape hacen lo mismo
modalCerrar?.addEventListener("click", cerrarModal);
modalFondo?.addEventListener("click", cerrarModal);
document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") cerrarModal();
});

// Funcion que muestra el detalle de un equipo de la API. Si todavia no es favorito,
// agrega el formulario para sumarlo a la coleccion y usa el POST
export function abrirModalDetalle (equipo, yaEsFavorito, onAgregarFavorito) {
    if (!modal || !modalCuerpo) return;
    modalCuerpo.innerHTML == "";

    modalCuerpo.appendChild(crearTitulo(equipo.strTeam));

    const img = document.createElement("img");
    img.className = "modal_escudo";
    img.src = equipo.strBagde || "";
    img.alt = `Escudo de ${equipo.strTeam}`;
    modalCuerpo.appendChild(img);

    const detalles = document.createElement("ul");
    detalles.className = "modal_detalles";
    [
        `Liga : ${formatearTexto(equipo.strLeague)}`,
        `País : ${formatearTexto(equipo.strCountry)}`,
        `Estadio : ${formatearTexto(equipo, strStadium)}`,
        formatearAnio(equipo.intFormedYear),
    ].forEach((texto) => {
        const item = document.createElement("li");
        item.textContent = texto;
        detalles.appendChild(item);
    });
    modalCuerpo.appendChild(detalles);

    const descripcion = document.createElement("p");
    descripcion.className = "modal_descripcion";
    // Preferimos la descripcion en español, si el equipo no la tiene cargada
    // en la API, usamos la version en ingles como respaldo
    descripcion.textContent = truncarTexto(equipo.strDescriptionES || equipo.strDescriptionEN);
    modalCuerpo.appendChild(descripcion);

    if (yaEsFavorito) {
        const aviso = document.createElement("p");
        aviso.className = "modal_aviso";
        aviso.textContent = "Este equipo ya está en tu colección.";
        modalCuerpo.appendChild(aviso);
    } else {
        modalCuerpo.appendChild(
            crearFormularioFavorito("Agregar a favoritos", {}, (datos) => onAgregarFavorito(datos))
        );
    }

    modal.classList.remove("oculto");
}

// Muestra el formulario para editar la nota y la calificacion de un favorito ya guaradado
export function abrirModalEditarFavorito(favorito, onGuardar) {
    if (!modal || !modalCuerpo) return;
    modalCuerpo.innerHTML = "";

    modalCuerpo.appendChild(crearTitulo(`Editar ${favorito.strTeam}`));
    modalCuerpo.appendChild(
        crearFormularioFavorito("Guardar cambios", favorito, (datos) => onGuardar(favorito.id, datos))
    );

    modal.classList.remove("oculto");
}

function crearTitulo (texto) {
    const titulo = document.createElement("h2");
    titulo.id = "modal-titulo";
    titulo.textContent = texto;
    return titulo;
}

// Formulario reutilizable que se usa tanto para crear como para editar
function crearFormularioFavorito (textoBoton, valoresIniciales, onEnviar) {
    const form = document.createElement("form");
    form.className = "form-favorito";

    const labelNota = document.createElement("label");
    labelNota.textContent = "Nota personal";
    const nota = document.createElement("textarea");
    nota.name = "nota";
    nota.maxLength = 200;
    nota.value = valoresIniciales.nota || "";
    labelNota.appendChild(nota);
    form.appendChild(labelNota);

    const grupoCalificacion = document.createElement("div");
    grupoCalificacion.className = "form-favorito_grupo";
    const etiquetaCalificacion = document.createElement("span");
    etiquetaCalificacion.className = "form-favorito_etiqueta";
    etiquetaCalificacion.textContent = "Calificación";
    grupoCalificacion.appendChild(etiquetaCalificacion);
    const calificacion = crearSelectorEstrellas(valoresIniciales.calificacion);
    grupoCalificacion.appendChild(calificacion.elemento);
    form.appendChild(grupoCalificacion);

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "boton boton--primario";
    submit.textContent = textoBoton;
    form.appendChild(submit);

    form.addEventListener("submit", (evento) => {
        evento.preventDefault();
        onEnviar({
            nota: nota.value.trim(),
            calificacion: calificacion.obtenerValor(),
        });
        cerrarModal();
    });

    return form;
}

// Grupo de botones con estrellas para elegir del 1 al 5. Devuelve el elemento a insertar
// y una funcion para leer el valor elegido al momento de enviar el formulario
function crearSelectorEstrellas(valorInicial) {
    let calificacionSeleccionada = Number(valorInicial) || 1;

    const contenedor = document.createElement("div");
    contenedor.className = "selector-estrellas";
    contenedor.setAttribute("role", "radiogroup");
    contenedor.setAttribute("aria-label", "Calificación");

    const botones = [];
    for (let valor = 1; valor <= 5; valor++) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "selector-estrellas_boton";
        boton.setAttribute("aria-label", `${valor} estrella${valor > 1 ? "s" : ""}`);
        boton.innerHTML = 'i data-lucide="star"></i>';
        boton.addEventListener("click", () => {
            calificacionSeleccionada = valor;
            botones.forEach((b, i) => b.classList.toggle("activa", i < valor));
        });
        botones.push(boton);
        contenedor.appendChild(boton);
    }
    botones.forEach((b, i) => b.classList.toggle("activa", i < calificacionSeleccionada));

    window.lucide?.createIcons({ root: contenedor });

    return {
        elemento: contenedor,
        obtenerValor: () => calificacionSeleccionada,
    };
}

// Exportacion agrupada
export { cerrarModal };