// /WantListDashboard.tsx
import React, { useEffect, useState } from 'react';
import WantListCard from '../components/cards/WantListCard';

const WantListDashboard = () => {
    const [wantListEntries, setWantListEntries] = useState([]);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        const fetchWantListEntries = async () => {
            const res = await fetch('/api/want-list?all=true');
            const data = await res.json();
            setWantListEntries(data);
        };

        fetchWantListEntries();
    }, []);

    const closeModal = () => {
        setSelectedEntry(null);
        setEditData(null);
    };

    const handleEditChange = (field, value) => {
        setEditData((prev) => ({ ...prev, [field]: value }));
    };

    const saveChanges = async () => {
        try {
            const res = await fetch(`/api/want-list`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: editData.id, updatedFields: editData }),
            });
            if (res.ok) {
                alert('Changes saved successfully!');
                const updatedEntries = wantListEntries.map((entry) =>
                    entry.id === editData.id ? { ...entry, ...editData } : entry
                );
                setWantListEntries(updatedEntries);
                closeModal();
            } else {
                alert('Failed to save changes.');
            }
        } catch (error) {
            console.error('Error saving changes:', error);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Want List Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {wantListEntries.map((entry) => (
                    <WantListCard key={entry.id} entry={entry} onClick={() => {
                        setSelectedEntry(entry);
                        setEditData(entry);
                    }} />
                ))}
            </div>

            {selectedEntry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-2/3 relative">
                        <h2 className="text-xl font-bold mb-4">
                            Edit Entry for {selectedEntry.customer_first_name} {selectedEntry.customer_last_name}
                        </h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Initial:</label>
                            <input
                                type="text"
                                value={editData.initial || ''}
                                onChange={(e) => handleEditChange('initial', e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Notes:</label>
                            <textarea
                                value={editData.notes || ''}
                                onChange={(e) => handleEditChange('notes', e.target.value)}
                                className="w-full p-2 border rounded"
                            ></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Spoken To:</label>
                            <input
                                type="text"
                                value={editData.spoken_to || ''}
                                onChange={(e) => handleEditChange('spoken_to', e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Status:</label>
                            <select
                                value={editData.is_closed ? 'Closed' : 'Open'}
                                onChange={(e) => handleEditChange('is_closed', e.target.value === 'Closed')}
                                className="w-full p-2 border rounded"
                            >
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Plants:</label>
                            <ul className="list-disc pl-4">
                                {editData.plants?.map((plant, index) => (
                                    <li key={index}>
                                        {plant.name} - {plant.size || 'N/A'} - Qty: {plant.quantity || 1}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded"
                                onClick={saveChanges}
                            >
                                Save
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WantListDashboard;