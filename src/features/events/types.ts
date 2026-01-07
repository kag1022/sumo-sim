export type EventType = 'Good' | 'Bad' | 'Flavor' | 'Special';

export interface GameEvent {
    id: string;
    title: string;
    description: string;
    type: EventType;
    image?: string;
    effects?: {
        funds?: number;
        reputation?: number;
        motivation?: number; // Affects 'mind' stat or stress
    };
}
