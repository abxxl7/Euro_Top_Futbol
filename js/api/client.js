// Funcion asincrona para pedir los datos, se usa "export" ya que tambien
// lo utilizaremos en recursos.js y coleccion.js
export async function pedirDatos(url, opciones = {}) {
    // Usamos TryCatch para manejar los errores en caso
    // de que suceda algo inesperado.
    try{
        const respuesta = await fetch(url, opciones);
        if (!respuesta.ok) {
            let mensaje;
            // Errores personalizados con switch
            switch (respuesta.status) {
                case 404:
                    mensaje = "No se pudo encontrar lo que usted solicita";
                    break;
                case 401:
                    mensaje = "Usted no esta autenticado";
                    break;
                case 403: 
                    mensaje = "Acceso restringido, no esta autorizado";
                    break;
                case 500:
                    mensaje = "Fallo en el servidor, no se pudo registrar su solicitud";
                    break;
                default:
                    mensaje = "Ocurrio un error inesperado, intente de nuevo";
            }
            throw new Error (mensaje);
        } else {
            return await respuesta.json();
        }
        // este catch lo usamos para el manejo de error de conexion, ya que ese tipo de
        // error no lo responde el servidor
    } catch (error) {
        if (error instanceof TypeError) {
            console.error ('Error de red:', error);
            throw new Error ('No se pudo conectar. Revisa tu conexion a internet.');
        }
        console.error('Hubo un problema', error);
        throw error;
    }
}
