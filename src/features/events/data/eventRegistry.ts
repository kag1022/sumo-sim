import { GameEvent } from '../types';

export const EVENTS: GameEvent[] = [
    // --- 1. 経営・金銭関連 (Financial) ---
    {
        id: 'tanimachi_party',
        title: 'event.tanimachi_party.title',
        description: 'event.tanimachi_party.desc',
        type: 'Good',
        effects: { funds: 3000000, motivation: 5 }
    },
    {
        id: 'tv_cm_offer',
        title: 'event.tv_cm_offer.title',
        description: 'event.tv_cm_offer.desc',
        type: 'Good',
        effects: { funds: 1500000, reputation: 3 }
    },
    {
        id: 'inflation_chanko',
        title: 'event.inflation_chanko.title',
        description: 'event.inflation_chanko.desc',
        type: 'Bad',
        effects: { funds: -50000 }
    },
    {
        id: 'tax_audit',
        title: 'event.tax_audit.title',
        description: 'event.tax_audit.desc',
        type: 'Bad',
        effects: { funds: -2000000, reputation: -2 }
    },
    {
        id: 'facility_repair',
        title: 'event.facility_repair.title',
        description: 'event.facility_repair.desc',
        type: 'Bad',
        effects: { funds: -120000 }
    },

    // --- 2. 力士・部屋の雰囲気 (Wrestler & Atmosphere) ---
    {
        id: 'wrestler_bonding',
        title: 'event.wrestler_bonding.title',
        description: 'event.wrestler_bonding.desc',
        type: 'Good',
        effects: { motivation: 10 }
    },
    {
        id: 'local_festival',
        title: 'event.local_festival.title',
        description: 'event.local_festival.desc',
        type: 'Flavor',
        effects: { motivation: 5, reputation: 2 }
    },
    {
        id: 'love_letter',
        title: 'event.love_letter.title',
        description: 'event.love_letter.desc',
        type: 'Flavor',
        effects: { motivation: 15 }
    },
    {
        id: 'flu_outbreak',
        title: 'event.flu_outbreak.title',
        description: 'event.flu_outbreak.desc',
        type: 'Bad',
        effects: { motivation: -10 }
    },
    {
        id: 'fight_in_heya',
        title: 'event.fight_in_heya.title',
        description: 'event.fight_in_heya.desc',
        type: 'Bad',
        effects: { motivation: -20, reputation: -1 }
    },

    // --- 3. 社会的信用・スキャンダル (Reputation) ---
    {
        id: 'save_cat',
        title: 'event.save_cat.title',
        description: 'event.save_cat.desc',
        type: 'Good',
        effects: { reputation: 10, motivation: 5 }
    },
    {
        id: 'mayor_visit',
        title: 'event.mayor_visit.title',
        description: 'event.mayor_visit.desc',
        type: 'Special',
        effects: { reputation: 15 }
    },
    {
        id: 'scandal_nightlife',
        title: 'event.scandal_nightlife.title',
        description: 'event.scandal_nightlife.desc',
        type: 'Bad',
        effects: { reputation: -10, motivation: -5 }
    },
    {
        id: 'snack_theft',
        title: 'event.snack_theft.title',
        description: 'event.snack_theft.desc',
        type: 'Bad',
        effects: { reputation: -5 }
    },

    // --- 4. 季節の風物詩 (Seasonal Flavor) ---
    {
        id: 'cherry_blossom',
        title: 'event.cherry_blossom.title',
        description: 'event.cherry_blossom.desc',
        type: 'Flavor',
        effects: { motivation: 3 }
    },
    {
        id: 'summer_heat',
        title: 'event.summer_heat.title',
        description: 'event.summer_heat.desc',
        type: 'Flavor',
        effects: { funds: -10000, motivation: -2 }
    },
    {
        id: 'winter_training',
        title: 'event.winter_training.title',
        description: 'event.winter_training.desc',
        type: 'Good',
        effects: { motivation: 8 }
    },

    // --- 5. 新規追加イベント (New Variations) ---
    {
        id: 'gift_farmers',
        title: 'event.gift_farmers.title',
        description: 'event.gift_farmers.desc',
        type: 'Good',
        effects: { motivation: 10 }
    },
    {
        id: 'school_visit',
        title: 'event.school_visit.title',
        description: 'event.school_visit.desc',
        type: 'Good',
        effects: { reputation: 2, motivation: 3 }
    },
    {
        id: 'equipment_break',
        title: 'event.equipment_break.title',
        description: 'event.equipment_break.desc',
        type: 'Bad',
        effects: { funds: -50000, motivation: -2 }
    },
    {
        id: 'stray_dog',
        title: 'event.stray_dog.title',
        description: 'event.stray_dog.desc',
        type: 'Flavor',
        effects: { reputation: 1 }
    }
];
