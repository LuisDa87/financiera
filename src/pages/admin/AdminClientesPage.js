// src/pages/admin/AdminClientesPage.js
import { getData, postData, patchData, deleteData } from '../../utils/getData.js';

const AdminClientesPage = {
    render: async () => {
        
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1><i data-lucide="users" class="me-2"></i>Gestión de Clientes</h1>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#clienteModal">
                    <i data-lucide="plus-circle" class="me-2 icon"></i>Crear Nuevo Cliente
                </button>
            </div>

            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre Completo</th>
                                    <th>Email</th>
                                    <th>Teléfono</th>
                                    <th class="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="clientes-table-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="clienteModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="clienteModalLabel"></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="cliente-form">
                                <input type="hidden" id="cliente-id">
                                <div class="mb-3">
                                    <label for="nombre_completo" class="form-label">Nombre Completo</label>
                                    <input type="text" class="form-control" id="nombre_completo" required>
                                </div>
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="email" required>
                                </div>
                                <div class="mb-3">
                                    <label for="numero_telefono" class="form-label">Teléfono</label>
                                    <input type="text" class="form-control" id="numero_telefono">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="guardar-cliente-btn">Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    after_render: async () => {
        if (window.lucide) lucide.createIcons();
        const tableBody = document.getElementById('clientes-table-body');
        // Esta línea ahora funcionará porque el HTML del modal ya existe
        const clienteModal = new bootstrap.Modal(document.getElementById('clienteModal'));
        const form = document.getElementById('cliente-form');
        const modalLabel = document.getElementById('clienteModalLabel');
        const saveButton = document.getElementById('guardar-cliente-btn');

        const cargarClientes = async () => {
            const clientes = await getData('/customers?order=customer_id.asc');
            tableBody.innerHTML = clientes.map(c => `
                <tr>
                    <td>${c.customer_id}</td>
                    <td>${c.full_name}</td>
                    <td>${c.email}</td>
                    <td>${c.phone_number || 'N/A'}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-warning me-2 edit-btn" data-id="${c.customer_id}" data-bs-toggle="modal" data-bs-target="#clienteModal"><i data-lucide="edit" class="icon"></i></button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${c.customer_id}"><i data-lucide="trash-2" class="icon"></i></button>
                    </td>
                </tr>`).join('');
            lucide.createIcons();
        };

        saveButton.addEventListener('click', async () => {
            const id = form.querySelector('#cliente-id').value;
            const data = {
                full_name: form.querySelector('#nombre_completo').value,
                email: form.querySelector('#email').value,
                phone_number: form.querySelector('#numero_telefono').value,
            };
            if (id) await patchData(`/customers?customer_id=eq.${id}`, data);
            else await postData('/customers', data);
            clienteModal.hide();
            await cargarClientes();
        });
        
        document.getElementById('clienteModal').addEventListener('show.bs.modal', async (e) => {
            form.reset();
            form.querySelector('#cliente-id').value = '';
            const id = e.relatedTarget ? e.relatedTarget.dataset.id : null;
            if (id) {
                modalLabel.textContent = 'Editar Cliente';
                const [cliente] = await getData(`/customers?customer_id=eq.${id}`);
                if (cliente) {
                    form.querySelector('#cliente-id').value = cliente.customer_id;
                    form.querySelector('#nombre_completo').value = cliente.full_name;
                    form.querySelector('#email').value = cliente.email;
                    form.querySelector('#numero_telefono').value = cliente.phone_number;
                }
            } else { modalLabel.textContent = 'Crear Nuevo Cliente'; }
        });

        tableBody.addEventListener('click', async (e) => {
            const deleteButton = e.target.closest('.delete-btn');
            if (deleteButton) {
                const id = deleteButton.dataset.id;
                if (confirm(`¿Seguro que quieres eliminar al cliente con ID ${id}?`)) {
                    await deleteData(`/customers?customer_id=eq.${id}`);
                    await cargarClientes();
                }
            }
        });
        await cargarClientes();
    }
};

export default AdminClientesPage;