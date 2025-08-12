const Error404 = {
    render: async () => {
        return `
            <div class="text-center">
                <h1 class="display-1">404</h1>
                <p class="lead">Página No Encontrada</p>
                <a href="/" class="btn btn-primary">Volver al Inicio</a>
            </div>
        `;
    },
    after_render: async () => {}
};

export default Error404;