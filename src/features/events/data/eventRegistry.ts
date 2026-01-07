import { GameEvent } from '../types';

export const EVENTS: GameEvent[] = [
    // --- 1. 経営・金銭関連 (Financial) ---
    {
        id: 'tanimachi_party',
        title: 'タニマチの激励会',
        description: '有力な後援者が激励会を開いてくれた。ご祝儀により懐が温まった。',
        type: 'Good',
        effects: { funds: 3000000, motivation: 5 }
    },
    {
        id: 'tv_cm_offer',
        title: 'ローカルCM出演',
        description: '地元の商店街からCM出演の依頼が来た。親方の笑顔がお茶の間に流れる。',
        type: 'Good',
        effects: { funds: 1500000, reputation: 3 }
    },
    {
        id: 'inflation_chanko',
        title: '食材価格の高騰',
        description: '野菜と肉の価格が上がっている。ちゃんこ鍋の質を落とすわけにはいかない…。',
        type: 'Bad',
        effects: { funds: -50000 }
    },
    {
        id: 'tax_audit',
        title: '税務調査',
        description: '経理上の不備が見つかり、追徴課税を支払うことになった。',
        type: 'Bad',
        effects: { funds: -2000000, reputation: -2 }
    },
    {
        id: 'facility_repair',
        title: '屋根の雨漏り',
        description: '昨夜の台風で稽古場の屋根が破損した。早急に修理が必要だ。',
        type: 'Bad',
        effects: { funds: -120000 }
    },

    // --- 2. 力士・部屋の雰囲気 (Wrestler & Atmosphere) ---
    {
        id: 'wrestler_bonding',
        title: '兄弟子の手料理',
        description: 'ベテラン力士が振る舞った特製ちゃんこが絶品だった。部屋の結束が深まった。',
        type: 'Good',
        effects: { motivation: 10 }
    },
    {
        id: 'local_festival',
        title: '地域の祭り',
        description: '地元の祭りに参加し、子供相撲の相手をした。弟子たちもリフレッシュできたようだ。',
        type: 'Flavor',
        effects: { motivation: 5, reputation: 2 }
    },
    {
        id: 'love_letter',
        title: 'ファンレター',
        description: '若手力士宛に熱心なファンレターが届いた。彼は顔を真っ赤にして喜んでいる。',
        type: 'Flavor',
        effects: { motivation: 15 }
    },
    {
        id: 'flu_outbreak',
        title: '風邪の流行',
        description: '季節の変わり目で体調を崩す者が続出している。稽古に身が入らない。',
        type: 'Bad',
        effects: { motivation: -10 }
    },
    {
        id: 'fight_in_heya',
        title: '兄弟喧嘩',
        description: 'ちゃんこの味付けを巡って、力士同士が取っ組み合いの喧嘩をした。空気が悪い。',
        type: 'Bad',
        effects: { motivation: -20, reputation: -1 }
    },

    // --- 3. 社会的信用・スキャンダル (Reputation) ---
    {
        id: 'save_cat',
        title: '力士の人助け',
        description: '所属力士が木から降りられなくなった猫を救助し、SNSで「優しい巨人」と話題になった。',
        type: 'Good',
        effects: { reputation: 10, motivation: 5 }
    },
    {
        id: 'mayor_visit',
        title: '市長の表敬訪問',
        description: '市長が部屋を視察に訪れた。地域貢献活動として評価された。',
        type: 'Special',
        effects: { reputation: 15 }
    },
    {
        id: 'scandal_nightlife',
        title: '夜の街での噂',
        description: '弟子が繁華街で泥酔していたという目撃情報が寄せられた。教育が必要だ。',
        type: 'Bad',
        effects: { reputation: -10, motivation: -5 }
    },
    {
        id: 'snack_theft',
        title: 'コンビニ買い食い',
        description: '着物姿でコンビニのアイスを立ち食いしている姿が写真に撮られた。「品格に欠ける」との理不尽な苦情。',
        type: 'Bad',
        effects: { reputation: -5 }
    },

    // --- 4. 季節の風物詩 (Seasonal Flavor) ---
    {
        id: 'cherry_blossom',
        title: '花見',
        description: '稽古を早めに切り上げ、皆で桜を見ながら団子を食べた。春の訪れを感じる。',
        type: 'Flavor',
        effects: { motivation: 3 }
    },
    {
        id: 'summer_heat',
        title: '猛暑',
        description: '今年の夏は異常に暑い。冷房代がかさむが、昼寝の時間は天国だ。',
        type: 'Flavor',
        effects: { funds: -10000, motivation: -2 }
    },
    {
        id: 'winter_training',
        title: '寒稽古',
        description: '凍えるような寒さの中、裸で四股を踏む。白い息が立ち上り、精神が研ぎ澄まされる。',
        type: 'Good',
        effects: { motivation: 8 }
    },

    // --- Original Proposals ---
    {
        id: 'event_gift_farmers',
        title: '農家からの差し入れ',
        description: '近所の農家から大量の野菜が届いた。ちゃんこ鍋が豪華になりそうだ。',
        type: 'Flavor',
        effects: { motivation: 10 } // Slightly increased from just "Up"
    }
];
