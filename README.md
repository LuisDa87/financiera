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
