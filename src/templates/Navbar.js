// src/templates/Navbar.js
const Navbar = {
    render: async () => {
        const routes = [
            { path: '#/admin/clientes', icon: 'users', label: 'Clientes' },
            { path: '#/admin/plataformas', icon: 'server', label: 'Plataformas' },
            { path: '#/admin/facturas', icon: 'file-text', label: 'Facturas' },
            { path: '#/admin/transacciones', icon: 'arrow-left-right', label: 'Transacciones' }
        ];

        // Determina la ruta activa para resaltarla en el menú
        const activeRoute = location.hash || '#/admin/clientes';

        return `
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#"><i data-lucide="database" class="me-2"></i>ExpertSoft DB</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav">
                            ${routes.map(route => `
                                <li class="nav-item">
                                    <a class="nav-link ${activeRoute.startsWith(route.path) ? 'active' : ''}" href="${route.path}">
                                        <i data-lucide="${route.icon}" class="me-1 icon"></i> ${route.label}
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </nav>
        `;
    },
    after_render: async () => {
        if (window.lucide) {
            lucide.createIcons();
        }
    }
};

export default Navbar;