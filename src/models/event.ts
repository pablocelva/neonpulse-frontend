// Enum con valores
export enum EventStatus {
    SCHEDULED = 'SCHEDULED',
    LIVE = 'LIVE',
    FINISHED = 'FINISHED',
    CANCELED = 'CANCELED',
}

// Interfaz de evento
export interface Event {
    id: string;
    title: string;
    artist: string;
    date: Date;
    time?: string;
    status: EventStatus;
    imageUrl?: string;
    isFeatured?: boolean;
}