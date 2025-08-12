// importer.js
import fs from 'fs';
import csv from 'csv-parser';
import pg from 'pg';

// --- Configuración para conectar a la BD en Docker ---
const { Pool } = pg;
const pool = new Pool({
    user: 'financial_admin',           // De tu archivo .env
    host: '100.92.47.88',              // La IP de tu servidor
    database: 'financial_db',          // De tu archivo .env
    password: 'CRUD_2025*', // De tu archivo .env
    port: 5434,                        // El puerto que mapeaste en Docker
});

/**
 * Función genérica para leer un CSV e insertarlo en una tabla.
 * Esta función es reutilizable y no necesita cambios.
 */
async function importCSV(filePath, tableName) {
    console.log(`Iniciando importación para la tabla: ${tableName}...`);
    
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                const client = await pool.connect();
                try {
                    for (const row of results) {
                        const columns = Object.keys(row).join(', ');
                        const placeholders = Object.keys(row).map((_, index) => `$${index + 1}`).join(', ');
                        const values = Object.values(row).map(value => value === '' ? null : value);
    
                        // Usamos ON CONFLICT DO NOTHING para evitar errores si intentas importar datos duplicados (basado en claves únicas)
                        const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`;
                        await client.query(query, values);
                    }
                    console.log(`✅ Finalizó la importación para la tabla: ${tableName}.`);
                    resolve();
                } catch (error) {
                    console.error(`❌ Error importando la tabla ${tableName}:`, error.message);
                    reject(error);
                } finally {
                    client.release();
                }
            });
    });
}

/**
 * Función principal que orquesta todas las importaciones en el orden correcto.
 */
async function main() {
    console.log("--- Iniciando proceso de carga de datos para Financial DB ---");
    
    try {
        // ¡IMPORTANTE! El orden es crucial para respetar las claves foráneas.
        // 1. Tablas sin dependencias
        await importCSV('./database/customers.csv', 'customers');
        await importCSV('./database/platforms.csv', 'platforms');
    
        // 2. Tablas que dependen de las anteriores
        await importCSV('./database/invoices.csv', 'invoices');
        
        // 3. Tablas que dependen de invoices y platforms
        await importCSV('./database/transactions.csv', 'transactions');
        
        console.log("--- Proceso de carga completado exitosamente ---");

    } catch (error) {
        console.error("--- El proceso de carga falló. Error: ---", error);
    } finally {
        // Cerramos todas las conexiones a la base de datos
        await pool.end();
        console.log("Conexión a la base de datos cerrada.");
    }
}

// Ejecutamos la función principal
main();

