¡Excelente pregunta! Este es un punto clave para sacarle todo el provecho a la arquitectura que montamos.

Para crear las APIs de estas consultas avanzadas, no necesitas escribir ni una sola línea de código de backend adicional. Aprovecharemos dos características muy potentes de PostgREST: las Vistas (Views) de la base de datos y los parámetros avanzados en la URL.

Aquí te explico detalladamente cómo crear cada API y cómo configurar tu colección de Postman.

1. Creando la API para la Consulta #1 (Total pagado por cliente)
Esta consulta requiere agrupar datos y hacer una suma (SUM y GROUP BY), algo que no se puede hacer directamente con los parámetros de la URL de PostgREST. La solución es crear una Vista en la base de datos.

Una Vista es como una tabla virtual cuyo contenido se basa en una consulta SQL. PostgREST creará automáticamente un endpoint de API para esta vista.

Paso 1: Modifica tu archivo database/init.sql
Abre tu archivo init.sql local y añade el siguiente código SQL al final del todo:

SQL

-- database/init.sql (añadir al final)

-- =================================================================
-- VISTA PARA CONSULTAS AVANZADAS
-- =================================================================

-- VISTA #1: Total pagado por cada cliente
-- Esta vista calcula la suma de todas las transacciones por cliente.
-- PostgREST creará automáticamente el endpoint GET /customer_payment_totals
-- -----------------------------------------------------------------
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
    c.customer_id, c.full_name, c.email;
Paso 2: Reinicia la Base de Datos para Aplicar los Cambios
Para que esta nueva vista se cree en tu base de datos, debemos forzar a Docker a que vuelva a ejecutar el init.sql.

Conéctate a tu servidor por SSH.

Navega a la carpeta /home/ingeadmin/crud-app.

Ejecuta los siguientes comandos:

Bash

# Detiene todo y elimina el volumen de datos para forzar la reinicialización
docker compose down -v

# Levanta todo de nuevo. La base de datos se creará desde cero con la nueva vista.
docker compose up -d
Vuelve a cargar los datos ejecutando node importer.js desde tu PC local, ya que la base de datos ahora está vacía.

Paso 3: ¡Tu Nueva API está Lista!
¡Eso es todo! PostgREST ha detectado la nueva vista y ha creado automáticamente este endpoint:

Endpoint: GET /customer_payment_totals

URL Completa: https://api-financiera.ingeniot.com.co/customer_payment_totals

2. Creando las Consultas #2 y #3 (con Parámetros de URL)
Para las otras dos consultas, que son de filtrado y selección de datos, podemos usar los potentes parámetros de URL de PostgREST sin necesidad de crear más vistas.

Consulta #2: Facturas Pendientes
Necesitamos facturas cuyo estado sea pending o partially_paid y que incluyan el nombre del cliente y sus transacciones.

Método: GET

URL:

https://api-financiera.ingeniot.com.co/invoices?select=invoice_number,status,amount_due,customer:customers(full_name),transactions(*)&status=in.(pending,partially_paid)
Desglose:

select=...: Selecciona campos específicos.

customer:customers(full_name): Hace un "JOIN" con la tabla customers y nos trae solo el full_name.

transactions(*): Trae todas las transacciones asociadas a cada factura.

status=in.(pending,partially_paid): Filtra para que el estado esté dentro de la lista especificada.

Consulta #3: Listado de Transacciones por Plataforma
Necesitamos todas las transacciones de una plataforma específica (ej. 'Nequi') y que incluyan los datos del cliente y la factura.

Método: GET

URL:

https://api-financiera.ingeniot.com.co/transactions?select=*,invoice:invoices(invoice_number,customer:customers(full_name)),platform:platforms(name)&platforms.name=eq.Nequi
Desglose:

select=*,invoice:invoices(...,customer:customers(...)),platform:platforms(name): Es un JOIN anidado. Trae todos los campos de la transacción, la información de la factura (incluyendo el nombre del cliente anidado) y el nombre de la plataforma.

platforms.name=eq.Nequi: Filtra las transacciones donde el name de la tabla relacionada platforms sea exactamente (eq) 'Nequi'.

3. Configurando tu Colección de Postman
Ahora, vamos a organizar todo esto en Postman.

Crea una Nueva Colección:

Abre Postman y haz clic en "New" > "Collection".

Nómbrala "ExpertSoft Financial API".

Añade las Peticiones del CRUD:

Crea una carpeta dentro de la colección llamada "CRUD Clientes".

GET All Customers:

Crea una nueva petición GET.

URL: https://api-financiera.ingeniot.com.co/customers

POST Create Customer:

Crea una nueva petición POST.

URL: https://api-financiera.ingeniot.com.co/customers

Ve a la pestaña Body, selecciona raw y JSON. Pega:

JSON

{
    "full_name": "Cliente desde Postman",
    "email": "postman@test.com",
    "phone_number": "555-5555"
}
Guarda la petición.

Añade las Consultas Avanzadas:

Crea una carpeta llamada "Consultas Avanzadas".

#1 Total por Cliente:

Petición: GET

URL: https://api-financiera.ingeniot.com.co/customer_payment_totals

#2 Facturas Pendientes:

Petición: GET

URL: https://api-financiera.ingeniot.com.co/invoices?select=invoice_number,status,amount_due,customer:customers(full_name),transactions(*)&status=in.(pending,partially_paid)

#3 Transacciones por Plataforma:

Petición: GET

URL: https://api-financiera.ingeniot.com.co/transactions?select=*,invoice:invoices(invoice_number,customer:customers(full_name)),platform:platforms(name)&platforms.name=eq.Nequi

Exporta la Colección:

Haz clic en los tres puntos (...) al lado del nombre de tu colección "ExpertSoft Financial API".

Selecciona "Export" y guarda el archivo JSON. Este es el archivo que debes incluir en tu repositorio.

¡Y listo! Con esto, has creado APIs personalizadas y complejas sin escribir código de backend, y tienes una colección de Postman profesional para probarlas.


¡Por supuesto\! Basado en todo el contexto de nuestro proyecto, he preparado un `README.md` profesional y detallado en inglés, siguiendo la estructura que solicitaste.

Puedes copiar y pegar este contenido directamente en tu archivo `README.md`.

-----

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


