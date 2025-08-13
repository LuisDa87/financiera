-- Creación de la tabla para los clientes
CREATE TABLE IF NOT EXISTS customers (
customer_id SERIAL PRIMARY KEY,
full_name VARCHAR(255) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
phone_number VARCHAR(20) UNIQUE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creación de la tabla para las plataformas
CREATE TABLE IF NOT EXISTS platforms (
platform_id SERIAL PRIMARY KEY,
name VARCHAR(50) UNIQUE NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creación de la tabla para las facturas
CREATE TABLE IF NOT EXISTS invoices (
invoice_id SERIAL PRIMARY KEY,
customer_id INTEGER NOT NULL,
invoice_number VARCHAR(100) UNIQUE NOT NULL,
amount_due DECIMAL(10, 2) NOT NULL,
due_date DATE NOT NULL,
status VARCHAR(20) NOT NULL DEFAULT 'pending',
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

CONSTRAINT fk_invoice_customer
FOREIGN KEY(customer_id)
REFERENCES customers(customer_id)
ON DELETE RESTRICT,

CONSTRAINT chk_invoice_status
CHECK (status IN ('pending', 'paid', 'partially_paid', 'overdue'))
);

-- Creación de la tabla para las transacciones
CREATE TABLE IF NOT EXISTS transactions (
transaction_id SERIAL PRIMARY KEY,
invoice_id INTEGER NOT NULL,
platform_id INTEGER NOT NULL,
amount_paid DECIMAL(10, 2) NOT NULL,
transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
reference_code VARCHAR(255) UNIQUE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

CONSTRAINT fk_transaction_invoice
FOREIGN KEY(invoice_id)
REFERENCES invoices(invoice_id)
ON DELETE CASCADE,

CONSTRAINT fk_transaction_platform
FOREIGN KEY(platform_id)
REFERENCES platforms(platform_id)
ON DELETE RESTRICT
);

-- Función y Trigger para actualizar 'updated_at' en la tabla de clientes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Vista 1 Total pagado por cada cliente - GET /customer_payment_totals
CREATE OR REPLACE VIEW customer_payment_totals AS
SELECT
c.customer_id,
c.full_name,
c.email,
SUM(t.amount_paid) AS total_paid
FROM
customers c
JOIN
invoices i ON c.customer_id = i.customer_id
JOIN
transactions t ON i.invoice_id = t.invoice_id
GROUP BY
c.customer_id, c.full_name, c.email
ORDER BY
total_paid DESC;


--Vista 2 Detalles de facturas pendientes - GET /pending_invoices_details
CREATE OR REPLACE VIEW pending_invoices_details AS
SELECT
i.invoice_id,
i.invoice_number,
i.amount_due,
i.status,
i.due_date,
c.full_name AS customer_name,
c.email AS customer_email
FROM
invoices i
JOIN
customers c ON i.customer_id = c.customer_id
WHERE
i.status IN ('pending', 'partially_paid', 'overdue')
ORDER BY
i.due_date ASC;


-- Vista 3 Transacciones detalladas con nombres de plataforma, cliente y factura - GET /detailed_transactions (se puede filtrar con ?platform_name=eq.Nequi)
CREATE OR REPLACE VIEW detailed_transactions AS
SELECT
t.transaction_id,
t.amount_paid,
t.transaction_date,
t.reference_code,
p.name AS platform_name,
i.invoice_number,
c.full_name AS customer_name
FROM
transactions t
JOIN
platforms p ON t.platform_id = p.platform_id
JOIN
invoices i ON t.invoice_id = i.invoice_id
JOIN
customers c ON i.customer_id = c.customer_id
ORDER BY
t.transaction_date DESC;

/*
-- Vista 4  Ranking de clientes por deuda actual - GET /customer_debt_ranking
CREATE OR REPLACE VIEW customer_debt_ranking AS
WITH invoice_payments AS (
-- Primero, calculamos el total pagado para cada factura
SELECT
invoice_id,
SUM(amount_paid) as total_paid
FROM
transactions
GROUP BY
invoice_id
)
SELECT
c.customer_id,
c.full_name,
-- Calculamos la deuda sumando (monto_factura - total_pagado) para todas sus facturas pendientes
SUM(i.amount_due - COALESCE(ip.total_paid, 0)) AS total_debt
FROM
customers c
JOIN
invoices i ON c.customer_id = i.customer_id
-- Usamos LEFT JOIN por si una factura pendiente aún no tiene pagos
LEFT JOIN
invoice_payments ip ON i.invoice_id = ip.invoice_id
WHERE
i.status <> 'paid'
GROUP BY
c.customer_id, c.full_name
-- Nos aseguramos de mostrar solo clientes con deuda real
HAVING
SUM(i.amount_due - COALESCE(ip.total_paid, 0)) > 0
ORDER BY
total_debt DESC;
*/