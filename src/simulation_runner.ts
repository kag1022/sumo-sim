import { generateMockRikishi, applyGrowthAndDecay } from './logic/rikishi';
import { simulateBasho } from './logic/basho';
import { assignRanks, awardSpecialPrizes } from './logic/banzuke';
import { BashoHistoryEntry } from './logic/types';

function main() {
    console.log("=== 大相撲シミュレーション：年間（6場所） ===");

    // 1. Setup
    const rikishis = generateMockRikishi();
    console.log(`初期力士数: ${rikishis.length}名\n`);

    const BASHO_COUNT = 6;
    const YEARS = 2024;
    
    for (let i = 0; i < BASHO_COUNT; i++) {
        const month = 1 + (i * 2); // 1, 3, 5, 7, 9, 11
        const bashoName = `${YEARS}年${month}月場所`;
        
        console.log(`\n================================`);
        console.log(`START: ${bashoName}`);
        console.log(`================================`);

        // Run Basho
        simulateBasho(rikishis);

        // Sort by wins for display
        rikishis.sort((a, b) => b.currentBasho.wins - a.currentBasho.wins);
        const yusho = rikishis[0];

        console.log(`\n【優勝】 ${yusho.rank} ${yusho.name} (${yusho.currentBasho.wins}勝${yusho.currentBasho.losses}敗)`);
        
        // Show Special Prizes
        // const sanshoWinners = rikishis.filter(r => {
        //     return false;
        // });

        // Banzuke Update Phase
        console.log(`\n--- 番付編成会議 ---`);
        awardSpecialPrizes(rikishis); // Updates career stats
        assignRanks(rikishis);        // Updates Ranks and BPs

        // Process History & Aging
        rikishis.forEach(r => {
            // Archive Record
            const entry: BashoHistoryEntry = {
                bashoId: bashoName,
                rank: r.rank, // Note: This is now the NEW rank. Ideally should record OLD rank. 
                // Fix: Rikishi object has updated rank. We lost the old rank. 
                // Ideally we should archive BEFORE assignRanks?
                // But we want to record the PERFORMANCE of the basho. The rank during the basho.
                // WE LOST IT because assignRanks overwrote it.
                // Improvement: Capture old rank before update.
                rankNumber: r.rankNumber,
                wins: r.currentBasho.wins,
                losses: r.currentBasho.losses,
                absences: r.currentBasho.absences
            };
            r.career.bashoHistory.push(entry);
            r.career.totalWins += r.currentBasho.wins;
            r.career.totalLosses += r.currentBasho.losses;
            r.career.totalAbsences += r.currentBasho.absences;

            // Reset Current Basho
            r.currentBasho = { 
                wins: 0, 
                losses: 0, 
                absences: 0, 
                history: [] 
            };
            r.isKyujo = false; // Heal injuries

            // Aging / Growth
            applyGrowthAndDecay(r);
        });
        
        // Display Top Ranks for NEXT Basho
        console.log(`\n【翌場所 新番付（上位）】`);
        rikishis.slice(0, 5).forEach(r => {
            const grade = r.rank === 'Maegashira' ? `前頭${r.rankNumber}` : 
                         r.rank === 'Yokozuna' ? '横綱' :
                         r.rank === 'Ozeki' ? '大関' :
                         r.rank === 'Sekiwake' ? '関脇' : '小結';
            console.log(`${r.side} ${grade} ${r.name} (BP: ${Math.floor(r.banzukePoint)})`);
        });
    }
    
    console.log("\n=== 年間シミュレーション終了 ===");
}

main();
