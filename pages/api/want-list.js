// api/want-list.js
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
        case 'POST':
            try {
                const { customer_id, initial, notes, plants, spoken_to } = req.body;

                if (!customer_id || !initial) {
                    return res.status(400).json({ error: "Missing required fields: customer_id or initial." });
                }

                const result = await db.run(
                    'INSERT INTO want_list (customer_id, initial, notes, is_closed, spoken_to) VALUES (?, ?, ?, ?, ?)',
                    [customer_id, initial, notes, false, spoken_to || null]
                );
                const wantListId = result.lastID;

                if (plants && plants.length > 0) {
                    for (const plant of plants) {
                        if (!plant.name) {
                            console.error("Plant data missing 'name':", plant);
                            continue;
                        }
                        await db.run(
                            'INSERT INTO plants (want_list_id, name, size, quantity) VALUES (?, ?, ?, ?)',
                            [wantListId, plant.name, plant.size || null, plant.quantity || 1]
                        );
                    }
                }

                res.status(200).json({ success: true, id: wantListId });
            } catch (error) {
                console.error("Error in POST /api/want-list:", error);
                res.status(500).json({ error: error.message });
            }
            break;

        case 'PUT':
            try {
                const { id: wantListId, updatedFields } = req.body;

                console.log('Received PUT request with data:', req.body);

                // Filter out fields that do not belong to the want_list table
                const allowedFields = ['initial', 'notes', 'is_closed', 'spoken_to'];
                const filteredFields = Object.keys(updatedFields)
                    .filter(field => allowedFields.includes(field))
                    .reduce((obj, key) => {
                        obj[key] = updatedFields[key];
                        return obj;
                    }, {});

                const updateQuery = Object.keys(filteredFields)
                    .map((field) => `${field} = ?`)
                    .join(', ');
                const values = Object.values(filteredFields);

                if (updateQuery) {
                    console.log('Executing update query:', `UPDATE want_list SET ${updateQuery} WHERE id = ${wantListId}`);
                    await db.run(
                        `UPDATE want_list SET ${updateQuery} WHERE id = ?`,
                        [...values, wantListId]
                    );
                }

                // Update plants
                if (updatedFields.plants) {
                    console.log('Updating plants for want_list_id:', wantListId);
                    await db.run('DELETE FROM plants WHERE want_list_id = ?', [wantListId]);
                    for (const plant of updatedFields.plants) {
                        console.log('Inserting plant:', plant);
                        await db.run(
                            'INSERT INTO plants (want_list_id, name, size, quantity) VALUES (?, ?, ?, ?)',
                            [wantListId, plant.name, plant.size || null, plant.quantity || 1]
                        );
                    }
                }

                res.status(200).json({ success: true });
            } catch (error) {
                console.error("Error in PUT /api/want-list:", error);
                res.status(500).json({ error: error.message });
            }
            break;

        case 'GET':
            try {
                const entries = await db.all(
                    `SELECT want_list.*, customers.first_name AS customer_first_name, customers.last_name AS customer_last_name 
                     FROM want_list INNER JOIN customers ON want_list.customer_id = customers.id`
                );

                const plantsData = await db.all(
                    'SELECT * FROM plants'
                );

                const combinedEntries = entries.map((entry) => {
                    const plants = plantsData.filter(
                        (plant) => plant.want_list_id === entry.id
                    );
                    return { ...entry, plants };
                });

                res.status(200).json(combinedEntries);
            } catch (error) {
                console.error("Error in GET /api/want-list:", error);
                res.status(500).json({ error: error.message });
            }
            break;

        default:
            res.status(405).json({ error: 'Method Not Allowed' });
    }
}