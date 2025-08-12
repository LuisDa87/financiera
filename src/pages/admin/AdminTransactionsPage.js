// src/pages/admin/AdminTransactionsPage.js
import { getData } from '../../utils/getData.js';

const AdminTransactionsPage = {
    render: async () => `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1><i data-lucide="arrow-left-right" class="me-2"></i>Historial de Transacciones</h1>
        </div>
        <div class="card"><div class="card-body"><div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead><tr><th>ID</th><th>Factura</th><th>Plataforma</th><th>Monto Pagado</th><th>Fecha</th><th>Referencia</th></tr></thead>
                <tbody id="transactions-table-body"></tbody>
            </table>
        </div></div></div>
    `,
    after_render: async () => {
        const tableBody = document.getElementById('transactions-table-body');
        
        // Hacemos un JOIN múltiple para traer los nombres en lugar de solo los IDs.
        const transactions = await getData('/transactions?select=*,invoices(invoice_number),platforms(name)&order=transaction_id.desc');
        
        tableBody.innerHTML = transactions.map(t => `
            <tr>
                <td>${t.transaction_id}</td>
                <td>${t.invoices.invoice_number}</td>
                <td>${t.platforms.name}</td>
                <td>$${Number(t.amount_paid).toFixed(2)}</td>
                <td>${new Date(t.transaction_date).toLocaleString()}</td>
                <td><code>${t.reference_code || 'N/A'}</code></td>
            </tr>`).join('');
        lucide.createIcons();
    }
};
export default AdminTransactionsPage;