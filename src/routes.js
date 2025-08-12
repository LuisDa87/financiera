// src/routes.js
import Navbar from './templates/Navbar.js';
import AdminClientesPage from './pages/admin/AdminClientesPage.js';
import AdminPlatformsPage from './pages/admin/AdminPlatformsPage.js';
import AdminInvoicesPage from './pages/admin/AdminInvoicesPage.js';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage.js';
import Error404 from './pages/Error404.js';

const routes = {
    '/': AdminClientesPage,
    '#/admin/clientes': AdminClientesPage,
    '#/admin/plataformas': AdminPlatformsPage,
    '#/admin/facturas': AdminInvoicesPage,
    '#/admin/transacciones': AdminTransactionsPage
};

const router = async () => {
    const navbar = document.getElementById('navbar-container');
    const content = document.getElementById('app-container');
    
    // Renderiza siempre la barra de navegación
    navbar.innerHTML = await Navbar.render();
    await Navbar.after_render();
    
    const request = location.hash || '/';
    const page = routes[request] || Error404;

    content.innerHTML = await page.render();
    if (page.after_render) {
      await page.after_render();
    }
};

export default router;