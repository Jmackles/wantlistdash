export interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
}

export interface Plant {
    name: string;
    size?: string;
    quantity: number;
}

export interface WantListEntry {
    id: number;
    customer_id: number;
    initial: string;
    notes?: string;
    is_closed: boolean;
    spoken_to?: string;
    plants: Plant[];
    customer_first_name: string;
    customer_last_name: string;
}