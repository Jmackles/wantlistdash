// Customer Card Component components/cards/CustomerCard.js
import React from 'react';

const CustomerCard = ({ customer, onClick }) => {
    return (
        <div
            className="border border-black p-4 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
            onClick={onClick}
        >
            <h2 className="text-lg font-semibold">
                {customer.first_name} {customer.last_name}
            </h2>
            <p className="text-sm">Phone: {customer.phone}</p>
            <p className="text-sm">Email: {customer.email}</p>
        </div>
    );
};

export default CustomerCard;
