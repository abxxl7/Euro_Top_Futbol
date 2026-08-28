import { pedirDatos } from "./client.js";

//URL base reutilizable
export const URL_BASE = "https://www.thesportsdb.com/api/v1/json/123/";

//Array de las ligas que va a esperar nuestra API
const LIGAS = [
    "English Premier League",
    "Spanish La Liga",
    "Italian Serie A",
    "German Bundesliga",
    "French Ligue 1"
];

// Async Function que trae los equipos de las 5 grandes ligas europeas
// combinados en un solo array
export async function topEquiposEuropa() {
    // uso .map para hacer las 5 llamadas en paralelo, la constante
    // promesas termina siendo un array de 5 promesas pendientes
    const promesas = LIGAS.map (liga => 
        pedirDatos(
            `${URL_BASE}search_all_teams.php?l=${encodeURIComponent(liga)}`
        )
    );
    
    // uso .allSettled por si alguna llamada falla, asi no se abortan las demas
    const resultados = await Promise.allSettled(promesas);

    const equipos = resultados
        // Filtramos solo las ligas que respondieron bien
        .filter(r => r.status === "fulfilled")
        // usamos .flatMap para aplanar los 5 arrays de
        // equipos en uno solo
        .flatMap(r => r.value.teams ?? []);

    return equipos;
}
