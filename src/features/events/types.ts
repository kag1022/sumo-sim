export type EventType = 'Good' | 'Bad' | 'Flavor' | 'Special';

export interface GameEvent {
    id: string;
    title: string;
    description: string;
    type: EventType;
    image?: string;
    targetWrestlerId?: string; // ID of the specific wrestler this event targets
    params?: Record<string, string | number>; // For i18n interpolation
    effects?: {
        funds?: number;
        reputation?: number;
        motivation?: number; // Affects 'mind' stat or stress
    };
}
