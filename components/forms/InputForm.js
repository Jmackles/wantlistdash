import React, { useState } from 'react';

const InputForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        initial: '',
        notes: '',
        plants: [],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddPlant = () => {
        setFormData({
            ...formData,
            plants: [...formData.plants, { name: '', size: '', quantity: 1 }],
        });
    };

    const handlePlantChange = (index, field, value) => {
        const updatedPlants = [...formData.plants];
        updatedPlants[index][field] = value;
        setFormData({ ...formData, plants: updatedPlants });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Ensure all required fields are present
        if (!formData.firstName || !formData.lastName || !formData.initial) {
            alert('First Name, Last Name, and Initial are required.');
            return;
        }
    
        try {
            const res = await onSubmit(formData);
    
            if (!res || typeof res !== 'object') {
                throw new Error('No response received or invalid response from the server.');
            }
    
            if (res.conflict) {
                const confirmUseExisting = window.confirm(res.message);
                if (confirmUseExisting) {
                    formData.spoken_to = `${formData.firstName} ${formData.lastName}`;
                    formData.customer_id = res.customer.id;
                    const finalRes = await onSubmit(formData);
    
                    if (!finalRes || !finalRes.success) {
                        throw new Error('Failed to submit form for the existing customer.');
                    }
                } else {
                    alert('Customer creation aborted.');
                }
            } else if (!res.success) {
                throw new Error(res.error || 'Failed to submit form.');
            } else {
                alert('Form submitted successfully!');
            }
        } catch (error) {
            console.error('Error during submission:', error.message || error);
            alert(error.message || 'An unexpected error occurred during form submission.');
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
            />
            <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
            />
            <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
            />
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
            />
            <input
                type="text"
                name="initial"
                value={formData.initial}
                onChange={handleChange}
                placeholder="Initial"
            />
            <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notes"
            ></textarea>

            <button type="button" onClick={handleAddPlant}>
                Add Plant
            </button>

            {formData.plants.map((plant, index) => (
                <div key={index}>
                    <input
                        type="text"
                        placeholder="Plant Name"
                        value={plant.name}
                        onChange={(e) => handlePlantChange(index, 'name', e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Size"
                        value={plant.size}
                        onChange={(e) => handlePlantChange(index, 'size', e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={plant.quantity}
                        onChange={(e) => handlePlantChange(index, 'quantity', e.target.value)}
                    />
                </div>
            ))}

            <button type="submit">Submit</button>
        </form>
    );
};

export default InputForm;
