// src/pages/admin/AdminPlatformsPage.js
import { getData, postData, patchData, deleteData } from '../../utils/getData.js';

const AdminPlatformsPage = {
    render: async () => `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1><i data-lucide="server" class="me-2"></i>Gestión de Plataformas</h1>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#platformModal">
                <i data-lucide="plus-circle" class="me-2 icon"></i>Crear Plataforma
            </button>
        </div>
        <div class="card"><div class="card-body"><div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead><tr><th>ID</th><th>Nombre</th><th class="text-end">Acciones</th></tr></thead>
                <tbody id="platforms-table-body"></tbody>
            </table>
        </div></div></div>
        <div class="modal fade" id="platformModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
            <div class="modal-header"><h5 class="modal-title" id="platformModalLabel"></h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">
                <form id="platform-form"><input type="hidden" id="platform-id">
                    <div class="mb-3">
                        <label for="name" class="form-label">Nombre de la Plataforma</label>
                        <input type="text" class="form-control" id="name" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button><button type="button" class="btn btn-primary" id="guardar-platform-btn">Guardar</button></div>
        </div></div></div>
    `,
    after_render: async () => {
        const tableBody = document.getElementById('platforms-table-body');
        const platformModal = new bootstrap.Modal(document.getElementById('platformModal'));
        const form = document.getElementById('platform-form');
        
        const cargarPlataformas = async () => {
            const platforms = await getData('/platforms?order=platform_id.asc');
            tableBody.innerHTML = platforms.map(p => `
                <tr><td>${p.platform_id}</td><td>${p.name}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-warning me-2 edit-btn" data-id="${p.platform_id}" data-bs-toggle="modal" data-bs-target="#platformModal"><i data-lucide="edit" class="icon"></i></button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${p.platform_id}"><i data-lucide="trash-2" class="icon"></i></button>
                </td></tr>`).join('');
            lucide.createIcons();
        };

        document.getElementById('guardar-platform-btn').addEventListener('click', async () => {
            const id = form.querySelector('#platform-id').value;
            const data = { name: form.querySelector('#name').value };
            if (id) await patchData(`/platforms?platform_id=eq.${id}`, data);
            else await postData('/platforms', data);
            platformModal.hide();
            await cargarPlataformas();
        });

        document.getElementById('platformModal').addEventListener('show.bs.modal', async (e) => {
            form.reset();
            form.querySelector('#platform-id').value = '';
            const id = e.relatedTarget ? e.relatedTarget.dataset.id : null;
            if (id) {
                document.getElementById('platformModalLabel').textContent = 'Editar Plataforma';
                const [platform] = await getData(`/platforms?platform_id=eq.${id}`);
                if (platform) {
                    form.querySelector('#platform-id').value = platform.platform_id;
                    form.querySelector('#name').value = platform.name;
                }
            } else {
                document.getElementById('platformModalLabel').textContent = 'Crear Plataforma';
            }
        });

        tableBody.addEventListener('click', async (e) => {
            const deleteButton = e.target.closest('.delete-btn');
            if (deleteButton) {
                const id = deleteButton.dataset.id;
                if (confirm(`¿Eliminar plataforma con ID ${id}?`)) {
                    await deleteData(`/platforms?platform_id=eq.${id}`);
                    await cargarPlataformas();
                }
            }
        });
        await cargarPlataformas();
    }
};
export default AdminPlatformsPage;