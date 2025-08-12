// src/pages/admin/AdminInvoicesPage.js
import { getData, postData, patchData, deleteData } from '../../utils/getData.js';

const AdminInvoicesPage = {
    render: async () => {
        // Obtenemos los clientes para poblar el dropdown del formulario
        const customers = await getData('/customers?order=full_name.asc');
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1><i data-lucide="file-text" class="me-2"></i>Gestión de Facturas</h1>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#invoiceModal">
                    <i data-lucide="plus-circle" class="me-2 icon"></i>Crear Factura
                </button>
            </div>
            <div class="card"><div class="card-body"><div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead><tr><th>Nº Factura</th><th>Cliente</th><th>Monto</th><th>Estado</th><th>Vencimiento</th><th class="text-end">Acciones</th></tr></thead>
                    <tbody id="invoices-table-body"></tbody>
                </table>
            </div></div></div>
            <div class="modal fade" id="invoiceModal" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">
                <div class="modal-header"><h5 class="modal-title" id="invoiceModalLabel"></h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                <div class="modal-body">
                    <form id="invoice-form" class="row g-3">
                        <input type="hidden" id="invoice-id">
                        <div class="col-md-6"><label for="customer_id" class="form-label">Cliente</label>
                            <select id="customer_id" class="form-select" required>
                                <option value="">Seleccione un cliente...</option>
                                ${customers.map(c => `<option value="${c.customer_id}">${c.full_name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-6"><label for="invoice_number" class="form-label">Número de Factura</label><input type="text" class="form-control" id="invoice_number" required></div>
                        <div class="col-md-6"><label for="amount_due" class="form-label">Monto a Pagar</label><input type="number" step="0.01" class="form-control" id="amount_due" required></div>
                        <div class="col-md-6"><label for="due_date" class="form-label">Fecha de Vencimiento</label><input type="date" class="form-control" id="due_date" required></div>
                        <div class="col-md-12"><label for="status" class="form-label">Estado</label>
                            <select id="status" class="form-select" required>
                                <option value="pending">Pendiente</option><option value="paid">Pagada</option><option value="partially_paid">Pagada Parcialmente</option><option value="overdue">Vencida</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button><button type="button" class="btn btn-primary" id="guardar-invoice-btn">Guardar</button></div>
            </div></div></div>
        `;
    },
    after_render: async () => {
        const tableBody = document.getElementById('invoices-table-body');
        const invoiceModal = new bootstrap.Modal(document.getElementById('invoiceModal'));
        const form = document.getElementById('invoice-form');
        
        const cargarFacturas = async () => {
            // PostgREST nos permite hacer un "JOIN" usando `select`. Aquí traemos el nombre del cliente.
            const invoices = await getData('/invoices?select=*,customers(full_name)&order=invoice_id.desc');
            tableBody.innerHTML = invoices.map(i => `
                <tr>
                    <td>${i.invoice_number}</td>
                    <td>${i.customers.full_name}</td>
                    <td>$${Number(i.amount_due).toFixed(2)}</td>
                    <td><span class="badge bg-primary">${i.status}</span></td>
                    <td>${new Date(i.due_date).toLocaleDateString()}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-warning me-2 edit-btn" data-id="${i.invoice_id}" data-bs-toggle="modal" data-bs-target="#invoiceModal"><i data-lucide="edit" class="icon"></i></button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${i.invoice_id}"><i data-lucide="trash-2" class="icon"></i></button>
                    </td>
                </tr>`).join('');
            lucide.createIcons();
        };

        document.getElementById('guardar-invoice-btn').addEventListener('click', async () => {
            const id = form.querySelector('#invoice-id').value;
            const data = {
                customer_id: form.querySelector('#customer_id').value,
                invoice_number: form.querySelector('#invoice_number').value,
                amount_due: form.querySelector('#amount_due').value,
                due_date: form.querySelector('#due_date').value,
                status: form.querySelector('#status').value
            };

            if (id) await patchData(`/invoices?invoice_id=eq.${id}`, data);
            else await postData('/invoices', data);
            
            invoiceModal.hide();
            await cargarFacturas();
        });

        document.getElementById('invoiceModal').addEventListener('show.bs.modal', async (e) => {
            form.reset();
            form.querySelector('#invoice-id').value = '';
            const id = e.relatedTarget ? e.relatedTarget.dataset.id : null;

            if (id) {
                document.getElementById('invoiceModalLabel').textContent = 'Editar Factura';
                const [invoice] = await getData(`/invoices?invoice_id=eq.${id}`);
                if (invoice) {
                    form.querySelector('#invoice-id').value = invoice.invoice_id;
                    form.querySelector('#customer_id').value = invoice.customer_id;
                    form.querySelector('#invoice_number').value = invoice.invoice_number;
                    form.querySelector('#amount_due').value = invoice.amount_due;
                    form.querySelector('#due_date').value = invoice.due_date;
                    form.querySelector('#status').value = invoice.status;
                }
            } else {
                document.getElementById('invoiceModalLabel').textContent = 'Crear Factura';
            }
        });

        tableBody.addEventListener('click', async (e) => {
            const deleteButton = e.target.closest('.delete-btn');
            if (deleteButton) {
                const id = deleteButton.dataset.id;
                if (confirm(`¿Eliminar factura con ID ${id}? Esto borrará sus transacciones asociadas.`)) {
                    await deleteData(`/invoices?invoice_id=eq.${id}`);
                    await cargarFacturas();
                }
            }
        });
        await cargarFacturas();
    }
};
export default AdminInvoicesPage;