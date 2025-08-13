-----

# Financial CRUD Management System

## 📖 System Description

This project is a full-stack web application designed to manage financial data sourced from Fintech platforms. It provides a clean, responsive, and efficient user interface for performing **CRUD (Create, Read, Update, Delete)** operations on a normalized PostgreSQL database.

The entire backend is powered by a **PostgREST** API, which is automatically generated from the database schema, and the entire infrastructure is containerized with **Docker** for consistent and scalable deployment. A **Traefik** reverse proxy handles secure connections (HTTPS) and routing.

-----

## ✨ Key Features

  * **Full CRUD Functionality:** Complete create, read, update, and delete operations for Customers, Platforms, and Invoices.
  * **Data Visualization:** Read-only views for complex data like financial Transactions.
  * **Normalized Database:** A robust PostgreSQL database designed up to the Third Normal Form (3NF) to ensure data integrity and eliminate redundancy.
  * **Auto-generated RESTful API:** A secure and high-performance API served by PostgREST, requiring no manual backend coding for CRUD endpoints.
  * **Dockerized Environment:** The entire application stack (Database, API, Web Server) is containerized, ensuring easy setup and consistent behavior across different environments.
  * **Advanced Query Endpoints:** Custom API endpoints for complex reporting, created using PostgreSQL Views.

-----

## 🛠️ Technologies Used

| Category | Technology |
| :--- | :--- |
| **Frontend** | JavaScript (ESM), Bootstrap 5, Lucide Icons, Webpack |
| **Backend** | PostgREST, Nginx |
| **Database** | PostgreSQL |
| **Infrastructure** | Docker, Docker Compose, Traefik (Reverse Proxy) |
| **Development Tools** | Node.js, npm, Postman, DBeaver |

-----

## 🚀 Getting Started / Project Execution

Follow these instructions to get the project running locally for development or deployed on a server.

### Prerequisites

  * Node.js & npm
  * Docker & Docker Compose
  * A code editor (e.g., VS Code)
  * A database client (e.g., DBeaver)
  * A REST client (e.g., Postman)

### Local Frontend Development

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd Crud_Database
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Configure the API URL:**
    Open `src/utils/getData.js` and set the `API_URL` constant to your deployed API endpoint (e.g., `https://api-financiera.ingeniot.com.co`).
5.  **Start the development server:**
    ```bash
    npm start
    ```
    This will open the application on `http://localhost:8080`.

### Server-side Deployment (Docker)

1.  **Prepare the Server:**
      * Ensure your server has Docker, Docker Compose, and Traefik running.
      * Configure your DNS records (`A` records for `crud-financiero.ingeniot.com.co` and `api-financiera.ingeniot.com.co`) to point to your server's IP address.
      * Create the project directory on the server (e.g., `/home/ingeadmin/crud-app`).
2.  **Upload Configuration Files:**
      * Upload `docker-compose.yml`, `.env`, the `database` folder, and the `nginx-conf` folder to your project directory on the server.
3.  **Build and Upload Frontend:**
      * Run `npm run build` locally to generate the `/dist` folder.
      * Use `scp` to upload the contents of the `/dist` folder to the `/dist` folder on the server.
        ```bash
        scp -r ./dist/* your_user@your_server_ip:/path/to/crud-app/dist/
        ```
4.  **Launch the Application:**
      * SSH into your server, navigate to the project directory, and run:
        ```bash
        docker compose up -d
        ```

-----

## 🗃️ Database Normalization

The database was designed following normalization principles to ensure data integrity and efficiency.

### Relational Model

The schema consists of four main tables, normalized to the Third Normal Form (3NF).

### Normalization Explained

Normalization was applied to:

  * **Eliminate Data Redundancy:** Information for entities like customers and platforms is stored only once. For example, a customer's name is not repeated for every invoice they have.
  * **Prevent Data Anomalies:** Separating data into distinct tables prevents issues. For instance, you can't delete a customer's only transaction and accidentally lose their contact information. You can also add a new customer before they have any invoices.
  * **Ensure Data Integrity:** Foreign key constraints are used to guarantee that relationships are valid (e.g., an invoice cannot be created for a customer that does not exist).

-----

## 🚚 Bulk Data Loading from CSV

The project includes a Node.js script to perform a bulk data import from CSV files into the PostgreSQL database.

**Instructions:**

1.  Place your data files (`customers.csv`, `platforms.csv`, `invoices.csv`, `transactions.csv`) inside the `/database` folder in the project root.
2.  Ensure the column headers in each CSV file exactly match the column names in the database tables.
3.  Install the required dependencies:
    ```bash
    npm install pg csv-parser
    ```
4.  Configure the database connection details in the `importer.js` file.
5.  Execute the script from your local machine's terminal:
    ```bash
    node importer.js
    ```

-----

##  Advanced API Queries

Custom, complex query endpoints were created without writing additional backend code by leveraging PostgREST's features. These can be tested using the provided Postman collection.

### 1\. Total Paid per Customer

  * **Requirement:** Get the sum of all payments grouped by each customer.
  * **Implementation:** A PostgreSQL `VIEW` named `customer_payment_totals` was created. PostgREST automatically exposes this view as an API endpoint.
  * **Endpoint:** `GET /customer_payment_totals`

### 2\. Pending Invoices with Details

  * **Requirement:** List all invoices that are not fully paid, including the customer's name and any associated transactions.
  * **Implementation:** Uses PostgREST's URL parameters for filtering and embedding related data.
  * **Endpoint:** `GET /invoices?select=invoice_number,status,amount_due,customer:customers(full_name),transactions(*)&status=in.(pending,partially_paid)`

### 3\. Transactions by Platform

  * **Requirement:** List all transactions from a specific platform (e.g., "Nequi"), including invoice and customer details.
  * **Implementation:** Uses PostgREST's URL parameters to filter based on a value in a related table.
  * **Endpoint:** `GET /transactions?select=*,invoice:invoices(invoice_number,customer:customers(full_name)),platform:platforms(name)&platforms.name=eq.Nequi`

-----

## 👨‍💻 Developer Info

  * **Name:** Luis David
  * **Clan:** *Van Rossum*
  * **Email:** *Luis David Ducuara Cadavid*

¡Excelente! Recuerdo perfectamente el init.sql y las consultas. Centralizar toda la lógica de las consultas complejas en Vistas (Views) de la base de datos es una práctica muy profesional y limpia. Simplifica enormemente las llamadas desde el frontend o Postman.
He modificado el archivo init.sql para que incluya no solo la primera vista, sino las cuatro vistas que necesitas: las tres originales y la nueva para el ranking de deudas.
Explicación de la Estrategia
En lugar de construir URLs largas y complejas, crearemos una "tabla virtual" (una Vista) en PostgreSQL para cada consulta. PostgREST detectará estas vistas y creará automáticamente un endpoint de API para cada una. Así, tus llamadas desde Postman serán mucho más sencillas y la lógica estará centralizada en la base de datos.
 * Consulta 1 → Vista customer_payment_totals
 * Consulta 2 → Vista pending_invoices_details
 * Consulta 3 → Vista detailed_transactions
 * Consulta 4 (Nueva) → Vista customer_debt_ranking
Nuevo init.sql con las 4 Vistas Incluidas
Aquí tienes el archivo init.sql completo y actualizado. Solo necesitas reemplazar el contenido de tu archivo database/init.sql actual con este.
-- Creación de la tabla para los clientes
CREATE TABLE IF NOT EXISTS customers (
    customer_id         SERIAL PRIMARY KEY,
    full_name           VARCHAR(255) NOT NULL,
    email               VARCHAR(255) UNIQUE NOT NULL,
    phone_number        VARCHAR(20) UNIQUE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creación de la tabla para las plataformas
CREATE TABLE IF NOT EXISTS platforms (
    platform_id         SERIAL PRIMARY KEY,
    name                VARCHAR(50) UNIQUE NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creación de la tabla para las facturas
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id          SERIAL PRIMARY KEY,
    customer_id         INTEGER NOT NULL,
    invoice_number      VARCHAR(100) UNIQUE NOT NULL,
    amount_due          DECIMAL(10, 2) NOT NULL,
    due_date            DATE NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_invoice_customer
        FOREIGN KEY(customer_id) 
        REFERENCES customers(customer_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_invoice_status
        CHECK (status IN ('pending', 'paid', 'partially_paid', 'overdue'))
);

-- Creación de la tabla para las transacciones
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id      SERIAL PRIMARY KEY,
    invoice_id          INTEGER NOT NULL,
    platform_id         INTEGER NOT NULL,
    amount_paid         DECIMAL(10, 2) NOT NULL,
    transaction_date    TIMESTAMP WITH TIME ZONE NOT NULL,
    reference_code      VARCHAR(255) UNIQUE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

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


-- =================================================================
-- VISTAS PARA CONSULTAS AVANZADAS Y REPORTES
-- PostgREST creará automáticamente un endpoint GET para cada vista.
-- =================================================================

-- VISTA 1: Total pagado por cada cliente.
-- Endpoint: GET /customer_payment_totals
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


-- VISTA 2: Detalles de facturas pendientes.
-- Endpoint: GET /pending_invoices_details
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


-- VISTA 3: Transacciones detalladas con nombres de plataforma, cliente y factura.
-- Endpoint: GET /detailed_transactions (se puede filtrar con ?platform_name=eq.Nequi)
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


-- VISTA 4 (NUEVA): Ranking de clientes por deuda actual.
-- Endpoint: GET /customer_debt_ranking
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


Próximos Pasos
 * Reemplaza el archivo: Copia todo el contenido de arriba y pégalo en tu archivo database/init.sql en el servidor, sobrescribiendo el anterior.
 * Reinicia la base de datos: Para que Docker cree estas nuevas vistas, debes reiniciar la base de datos desde cero. Conéctate a tu servidor, navega a /home/ingeadmin/crud-app y ejecuta:
   # Detiene y elimina todo, incluyendo el volumen de datos
docker compose down -v

# Vuelve a levantar todo. La BD se creará con las 4 vistas.
docker compose up -d

 * Carga los datos: Vuelve a ejecutar node importer.js desde tu PC para poblar la base de datos recién creada.
 * Prueba en Postman: Ahora puedes hacer peticiones GET a los nuevos endpoints:
   * GET https://api-financiera.ingeniot.com.co/customer_payment_totals
   * GET https://api-financiera.ingeniot.com.co/pending_invoices_details
   * GET https://api-financiera.ingeniot.com.co/detailed_transactions
   * GET https://api-financiera.ingeniot.com.co/detailed_transactions?platform_name=eq.Nequi (para filtrar)
   * GET https://api-financiera.ingeniot.com.co/customer_debt_ranking


