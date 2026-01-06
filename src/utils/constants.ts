export const QUOTA_MAKUUCHI = 42;
export const QUOTA_JURYO = 28;
export const QUOTA_MAKUSHITA = 120;
export const QUOTA_SANDANME = 200;
export const QUOTA_JONIDAN = 200;
export const QUOTA_JONOKUCHI = 9999;
export const MAX_PLAYERS_PER_HEYA = 20;

export const QUOTA_YOKOZUNA_MIN = 1;
export const QUOTA_OZEKI_MIN = 2;
export const QUOTA_SEKIWAKE = 2;
export const QUOTA_KOMUSUBI = 2;

export const RANK_VALUE_MAP: Record<string, number> = {
    "Yokozuna": 13000, // Boosted to keep above Ozeki
    "Ozeki": 12000,
    "Sekiwake": 11500,
    "Komusubi": 11000,
    "Maegashira": 10000,
    "Juryo": 5000,
    "Makushita": 1000,
    "Sandanme": 500,
    "Jonidan": 200,
    "Jonokuchi": 100
};

export const ATTRIBUTE_ADVANTAGE_BONUS = 0.15;

export const getRankValue = (rank: string): number => {
    // Determine broad category value
    // For M1, M2 etc logic, we need parsing. 
    // current prototype uses just "Maegashira", "Juryo" as strings.
    // So distinct sorting between M1 and M10 isn't fully possible unless we have distinct rank strings or a secondary 'rankNum' field.
    // For this prototype, we will assume strict hierarchy based on string or index in array if we had all wrestlers.
    // However, the Quota System relies on sorting EVERYONE.
    // If multiple people are "Maegashira", how do we know who is M1 vs M15?
    // REQUIRED: We need to assign relative value.
    // Since we are Re-shuffling, the 'current' rank value matters less than the 'score'.
    // BUT 'score' depends on 'current rank'.
    // If everyone is generic "Maegashira", they are equal? No, typical sim tracks exact position.
    // For this prototype, let's treat generic ranks as "Bottom of that rank" or "Average"?
    // OR: assume the input wrestler array is ALREADY sorted by rank? (Usually list is).
    // Let's rely on array index for tie-breaking if generic.

    return RANK_VALUE_MAP[rank] || 0;
};
