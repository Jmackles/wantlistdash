// Want List Card Component components/cards/WantListCard.js
import React from 'react';

const WantListCard = ({ entry, onClick }) => {
    return (
        <div
            className={`border p-4 rounded-lg shadow-md hover:shadow-lg cursor-pointer ${
                entry.is_closed ? 'border-gray-400 line-through opacity-75' : 'border-black'
            }`}
            onClick={onClick}
        >
            <h2 className="text-lg font-semibold">
                {entry.customer_first_name} {entry.customer_last_name}
            </h2>
            <p className="text-sm">Initial: {entry.initial}</p>
            <p className="text-sm">Notes: {entry.notes}</p>
            <p className="text-sm">Spoken To: {entry.spoken_to || 'N/A'}</p>
            <p className="text-sm">Status: {entry.is_closed ? 'Closed' : 'Open'}</p>
            <p className="text-sm font-medium mt-2">Plants:</p>
            <ul className="list-disc pl-4">
                {entry.plants?.map((plant, index) => (
                    <li key={index}>
                        {plant.name} - {plant.size || 'N/A'} - Qty: {plant.quantity || 1}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WantListCard;
