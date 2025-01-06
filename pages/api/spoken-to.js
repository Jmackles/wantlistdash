// api/spoken-to.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const openDb = async () => {
    return open({
        filename: './database.sqlite',
        driver: sqlite3.Database,
    });
};

export default async function handler(req, res) {
    const db = await openDb();

    switch (req.method) {
        case 'POST': // Add a "spoken to" record
            const { name, customer_id, plant_id } = req.body;
            try {
                const result = await db.run(
                    'INSERT INTO spoken_to (name, customer_id, plant_id) VALUES (?, ?, ?)',
                    [name, customer_id || null, plant_id || null]
                );

                res.status(200).json({ success: true, id: result.lastID });
            } catch (error) {
                console.error('Error in POST /api/spoken-to:', error);
                res.status(500).json({ error: error.message });
            }
            break;

        case 'GET': // Fetch all "spoken to" records
            try {
                const records = await db.all(`
                    SELECT spoken_to.*, customers.first_name AS customer_first_name, customers.last_name AS customer_last_name, 
                           plants.name AS plant_name, plants.size AS plant_size
                    FROM spoken_to
                    LEFT JOIN customers ON spoken_to.customer_id = customers.id
                    LEFT JOIN plants ON spoken_to.plant_id = plants.id
                `);

                res.status(200).json(records);
            } catch (error) {
                console.error('Error in GET /api/spoken-to:', error);
                res.status(500).json({ error: error.message });
            }
            break;

        default:
            res.status(405).json({ error: 'Method Not Allowed' });
    }
}
