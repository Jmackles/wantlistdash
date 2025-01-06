// api/customers.js
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
        case 'POST': // Add or link customer
            const { first_name, last_name, phone, email } = req.body;
            try {
                let customer = await db.get(
                    'SELECT * FROM customers WHERE phone = ? OR email = ?',
                    [phone, email]
                );

                if (customer) {
                    if (customer.first_name !== first_name || customer.last_name !== last_name) {
                        return res.status(200).json({
                            conflict: true,
                            customer,
                            message: `A customer with this phone or email exists (${customer.first_name} ${customer.last_name}). Use existing or create new.`,
                        });
                    }
                } else {
                    const result = await db.run(
                        'INSERT INTO customers (first_name, last_name, phone, email) VALUES (?, ?, ?, ?)',
                        [first_name, last_name, phone, email]
                    );
                    customer = { id: result.lastID, first_name, last_name, phone, email };
                }

                res.status(200).json(customer);
            } catch (error) {
                console.error('Error in POST /api/customers:', error);
                res.status(500).json({ error: error.message });
            }
            break;

        case 'GET': // Fetch all customers
            try {
                const customers = await db.all('SELECT * FROM customers');
                res.status(200).json(customers);
            } catch (error) {
                console.error('Error in GET /api/customers:', error);
                res.status(500).json({ error: error.message });
            }
            break;

        default:
            res.status(405).json({ error: 'Method Not Allowed' });
    }
}
