Financial CRUD Management System
📖 System Description
This project is a full-stack web application designed to manage financial data sourced from Fintech platforms. It provides a clean, responsive, and efficient user interface for performing CRUD (Create, Read, Update, Delete) operations on a normalized PostgreSQL database.

The entire backend is powered by a PostgREST API, which is automatically generated from the database schema, and the entire infrastructure is containerized with Docker for consistent and scalable deployment. A Traefik reverse proxy handles secure connections (HTTPS) and routing.

✨ Key Features
Full CRUD Functionality: Complete create, read, update, and delete operations for Customers, Platforms, and Invoices.
Data Visualization: Read-only views for complex data like financial Transactions.
Normalized Database: A robust PostgreSQL database designed up to the Third Normal Form (3NF) to ensure data integrity and eliminate redundancy.
Auto-generated RESTful API: A secure and high-performance API served by PostgREST, requiring no manual backend coding for CRUD endpoints.
Dockerized Environment: The entire application stack (Database, API, Web Server) is containerized, ensuring easy setup and consistent behavior across different environments.
Advanced Query Endpoints: Custom API endpoints for complex reporting, created using PostgreSQL Views.
🛠️ Technologies Used
Category	Technology
Frontend	JavaScript (ESM), Bootstrap 5, Lucide Icons, Webpack
Backend	PostgREST, Nginx
Database	PostgreSQL
Infrastructure	Docker, Docker Compose, Traefik (Reverse Proxy)
Development Tools	Node.js, npm, Postman, DBeaver
🚀 Getting Started / Project Execution
Follow these instructions to get the project running locally for development or deployed on a server.

Prerequisites
Node.js & npm
Docker & Docker Compose
A code editor (e.g., VS Code)
A database client (e.g., DBeaver)
A REST client (e.g., Postman)
Local Frontend Development
Clone the repository:
git clone <your-repository-url>
Navigate to the project directory:
cd Crud_Database
Install dependencies:
npm install
Configure the API URL: Open src/utils/getData.js and set the API_URL constant to your deployed API endpoint (e.g., https://api-financiera.ingeniot.com.co).
Start the development server:
npm start
This will open the application on http://localhost:8080.
Server-side Deployment (Docker)
Prepare the Server:
Ensure your server has Docker, Docker Compose, and Traefik running.
Configure your DNS records (A records for crud-financiero.ingeniot.com.co and api-financiera.ingeniot.com.co) to point to your server's IP address.
Create the project directory on the server (e.g., /home/ingeadmin/crud-app).
Upload Configuration Files:
Upload docker-compose.yml, .env, the database folder, and the nginx-conf folder to your project directory on the server.
Build and Upload Frontend:
Run npm run build locally to generate the /dist folder.
Use scp to upload the contents of the /dist folder to the /dist folder on the server.
scp -r ./dist/* your_user@your_server_ip:/path/to/crud-app/dist/
Launch the Application:
SSH into your server, navigate to the project directory, and run:
docker compose up -d
🗃️ Database Normalization
The database was designed following normalization principles to ensure data integrity and efficiency.

Relational Model
The schema consists of four main tables, normalized to the Third Normal Form (3NF).

Normalization Explained
Normalization was applied to:

Eliminate Data Redundancy: Information for entities like customers and platforms is stored only once. For example, a customer's name is not repeated for every invoice they have.
Prevent Data Anomalies: Separating data into distinct tables prevents issues. For instance, you can't delete a customer's only transaction and accidentally lose their contact information. You can also add a new customer before they have any invoices.
Ensure Data Integrity: Foreign key constraints are used to guarantee that relationships are valid (e.g., an invoice cannot be created for a customer that does not exist).
🚚 Bulk Data Loading from CSV
The project includes a Node.js script to perform a bulk data import from CSV files into the PostgreSQL database.

Instructions:

Place your data files (customers.csv, platforms.csv, invoices.csv, transactions.csv) inside the /database folder in the project root.
Ensure the column headers in each CSV file exactly match the column names in the database tables.
Install the required dependencies:
npm install pg csv-parser
Configure the database connection details in the importer.js file.
Execute the script from your local machine's terminal:
node importer.js
Advanced API Queries
Custom, complex query endpoints were created without writing additional backend code by leveraging PostgREST's features. These can be tested using the provided Postman collection.

1. Total Paid per Customer
Requirement: Get the sum of all payments grouped by each customer.
Implementation: A PostgreSQL VIEW named customer_payment_totals was created. PostgREST automatically exposes this view as an API endpoint.
Endpoint: GET /customer_payment_totals
2. Pending Invoices with Details
Requirement: List all invoices that are not fully paid, including the customer's name and any associated transactions.
Implementation: Uses PostgREST's URL parameters for filtering and embedding related data.
Endpoint: GET /invoices?select=invoice_number,status,amount_due,customer:customers(full_name),transactions(*)&status=in.(pending,partially_paid)
3. Transactions by Platform
Requirement: List all transactions from a specific platform (e.g., "Nequi"), including invoice and customer details.
Implementation: Uses PostgREST's URL parameters to filter based on a value in a related table.
Endpoint: GET /transactions?select=*,invoice:invoices(invoice_number,customer:customers(full_name)),platform:platforms(name)&platforms.name=eq.Nequi
👨‍💻 Developer Info
Name: Luis David
Clan: Van Rossum
Email: Luis David Ducuara Cadavid