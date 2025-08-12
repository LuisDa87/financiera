import router from './routes.js';

// Escucha la carga inicial de la página y los cambios en el hash de la URL
window.addEventListener('load', router);
window.addEventListener('hashchange', router);