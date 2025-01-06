// Frontend pages/dashboard.tsx
import React, { useState, useEffect } from 'react';
import InputForm from '../components/forms/InputForm';
import CustomerCard from '../components/cards/CustomerCard';
import { Customer } from '../lib/types';

const Dashboard = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [editCustomerData, setEditCustomerData] = useState<Partial<Customer>>({});
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await fetch('/api/customers');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setCustomers(data); // Only set if data is an array
                } else {
                    console.error('Unexpected response format:', data);
                    setCustomers([]); // Fallback to empty array
                }
            } catch (error) {
                console.error('Error fetching customers:', error);
                setCustomers([]); // Fallback to empty array on error
            }
        };

        fetchCustomers();
    }, []);

    const handleFormSubmit = async (formData) => {
        const { firstName, lastName, phone, email, initial, notes, plants, spokenTo } = formData;

        try {
            // Add or fetch customer
            const customerRes = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    phone,
                    email,
                }),
            });

            if (!customerRes.ok) {
                const errorData = await customerRes.json();
                throw new Error(errorData.error || 'Failed to add or fetch customer.');
            }

            const customerData = await customerRes.json();
            const customer_id = customerData.id || customerData.customer?.id;

            // If plants are provided, submit want-list entry
            if (plants && plants.length > 0) {
                const wantListRes = await fetch('/api/want-list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_id,
                        initial,
                        notes,
                        plants,
                    }),
                });

                if (!wantListRes.ok) {
                    const errorData = await wantListRes.json();
                    throw new Error(errorData.error || 'Failed to add want list entry.');
                }
            }

            // If spokenTo is specified, log it
            if (spokenTo) {
                await fetch('/api/spoken-to', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: spokenTo,
                        customer_id,
                    }),
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Error in handleFormSubmit:', error);
            return { success: false, error: error.message };
        }
    };

    const handleEditCustomer = async () => {
        const res = await fetch('/api/customers', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editCustomerData.id, updatedFields: editCustomerData }),
        });
        if (res.ok) {
            alert('Customer updated successfully!');
            setCustomers((prev) =>
                prev.map((customer) =>
                    customer.id === editCustomerData.id ? { ...customer, ...editCustomerData } : customer
                )
            );
            setEditMode(false);
        } else {
            alert('Failed to update customer.');
        }
    };

    const handleInputChange = (field, value) => {
        setEditCustomerData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Want List Dashboard</h1>
            <InputForm onSubmit={handleFormSubmit} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {customers.map((customer) => (
                    <CustomerCard
                        key={customer.id}
                        customer={customer}
                        onClick={() => {
                            setSelectedCustomer(customer);
                            setEditMode(true);
                            setEditCustomerData(customer);
                        }}
                    />
                ))}
            </div>

            {editMode && selectedCustomer && (
                <div className="mt-8 p-4 border rounded">
                    <h2 className="text-lg font-semibold mb-4">
                        Edit Customer: {selectedCustomer.first_name} {selectedCustomer.last_name}
                    </h2>
                    <input
                        type="text"
                        value={editCustomerData.first_name || ''}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className="mb-2 p-2 border w-full"
                    />
                    <input
                        type="text"
                        value={editCustomerData.last_name || ''}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className="mb-2 p-2 border w-full"
                    />
                    <input
                        type="text"
                        value={editCustomerData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mb-2 p-2 border w-full"
                    />
                    <input
                        type="email"
                        value={editCustomerData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mb-2 p-2 border w-full"
                    />
                    <button
                        onClick={handleEditCustomer}
                        className="p-2 bg-green-500 text-white rounded mt-2"
                    >
                        Save Changes
                    </button>
                    <button
                        onClick={() => setEditMode(false)}
                        className="p-2 bg-gray-500 text-white rounded mt-2 ml-2"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;