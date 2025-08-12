// Asume que esta es la URL base de tu API de PostgREST para la BD financiera
const API_URL = 'https://api-financiera.ingeniot.com.co'; 

/**
 * Maneja errores de la respuesta de fetch.
 * @param {Response} response - El objeto de respuesta de fetch.
 */
async function handleApiError(response) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    const errorMessage = errorData.message || `Error HTTP: ${response.status}`;
    throw new Error(errorMessage);
}

/**
 * Obtiene datos de un recurso de la API.
 * @param {string} resource - El recurso a consultar (ej. '/clientes' o '/clientes?cliente_id=eq.1').
 * @returns {Promise<Array>} - Una promesa que resuelve a un array de datos.
 */
export const getData = async (resource) => {
    try {
        const response = await fetch(`${API_URL}${resource}`);
        if (!response.ok) await handleApiError(response);
        return await response.json();
    } catch (error) {
        console.error(`Error en getData(${resource}):`, error.message);
        return [];
    }
};

/**
 * Envía datos para crear un nuevo recurso.
 * @param {string} resource - El recurso a crear (ej. '/clientes').
 * @param {object} body - El cuerpo de la solicitud.
 * @returns {Promise<object|null>} - El recurso creado o null si hay error.
 */
export const postData = async (resource, body) => {
    try {
        const response = await fetch(`${API_URL}${resource}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Prefer': 'return=representation' // Pide a PostgREST que devuelva el objeto creado.
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) await handleApiError(response);
        return await response.json();
    } catch (error) {
        console.error(`Error en postData(${resource}):`, error.message);
        return null;
    }
};

/**
 * Envía datos para actualizar un recurso existente.
 * @param {string} resource - El recurso a actualizar con sus filtros (ej. '/clientes?cliente_id=eq.1').
 * @param {object} body - Los campos a actualizar.
 * @returns {Promise<object|null>} - El recurso actualizado o null si hay error.
 */
export const patchData = async (resource, body) => {
    try {
        const response = await fetch(`${API_URL}${resource}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) await handleApiError(response);
        return await response.json();
    } catch (error) {
        console.error(`Error en patchData(${resource}):`, error.message);
        return null;
    }
};

/**
 * Elimina un recurso.
 * @param {string} resource - El recurso a eliminar con sus filtros (ej. '/clientes?cliente_id=eq.1').
 * @returns {Promise<boolean>} - True si tuvo éxito, false si no.
 */
export const deleteData = async (resource) => {
    try {
        const response = await fetch(`${API_URL}${resource}`, {
            method: 'DELETE'
        });
        if (!response.ok) await handleApiError(response);
        return true;
    } catch (error) {
        console.error(`Error en deleteData(${resource}):`, error.message);
        return false;
    }
};