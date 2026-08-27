import { topEquiposEuropa } from "./api/recursos.js";

topEquiposEuropa()
    .then(equipos => console.log("Total:", equipos.length, equipos))
    .catch(error => console.error("Falló:", error));

    //FUNCIONA