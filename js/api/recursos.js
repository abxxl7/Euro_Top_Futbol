import { pedirDatos } from "./client.js";
export const URL_BASE = "https://www.thesportsdb.com/api/v1/json/123/";

const LIGAS = [
    "English Premier League",
    "Spanish La Liga",
    "Italian Serie A",
    "German Bundesliga",
    "French Ligue 1"
];
export async function topEquiposEuropa() {
    const promesas = LIGAS.map
    (liga => pedirDatos(`${URL_BASE}search_all_teams.php?l=${encodeURIComponent(liga)}`));
    const resultados = await Promise.allSettled(promesas);

    const equipos = resultados
        .filter(r => r.status === "fulfilled")
        .flatMap(r => r.value.teams ?? []);
    return equipos;
}
