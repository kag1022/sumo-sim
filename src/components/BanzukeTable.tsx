import React from 'react';
import { useSumoStore } from '../store/useSumoStore';
import { Rikishi } from '../logic/types';
import clsx from 'clsx';

// Helper to translate Ranks to Kanji
const rankToKanji: Record<string, string> = {
  'Yokozuna': '横綱',
  'Ozeki': '大関',
  'Sekiwake': '関脇',
  'Komusubi': '小結',
  'Maegashira': '前頭',
  'Juryo': '十両',
};

export const BanzukeTable: React.FC = () => {
  const rikishis = useSumoStore(state => state.rikishis);

  // Group by Rank Rows
  // Strategy: We want to display rows. Each row has an East slot and a West slot.
  // Standard Banzuke:
  // Row 1: East Yokozuna | Rank | West Yokozuna
  // If multiple Yokozuna, they stack? No, usually Y1E, Y1W, Y2E...
  // Each "Rank Level" has slots.
  
  // We need to pair them up.
  // Sort by Rank/BP is active.
  // Filter East and West.
  const east = rikishis.filter(r => r.side === 'East');
  const west = rikishis.filter(r => r.side === 'West');
  
  // Determine max rows needed.
  const maxRows = Math.max(east.length, west.length);
  
  const rows = [];
  for (let i = 0; i < maxRows; i++) {
      rows.push({
          east: east[i] || null,
          west: west[i] || null,
      });
  }

  return (
    <div className="w-full bg-sumo-paper shadow-2xl border-4 border-sumo-black p-1 relative overflow-hidden">
        {/* Decorative Header Border */}
        <div className="absolute top-0 left-0 w-full h-2 bg-sumo-black"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-sumo-black"></div>

        <div className="flex flex-col w-full text-center">
            {/* Headers */}
            <div className="flex font-black text-xl border-b-2 border-sumo-black mb-2 py-2">
                <div className="flex-1 text-sumo-red">東 (EAST)</div>
                <div className="w-24">番付</div>
                <div className="flex-1 text-sumo-red">西 (WEST)</div>
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-1">
                {rows.map((row, idx) => {
                    // Determine Rank Label from the highest Rank presence
                    // Use East's rank preferably, else West
                    const r = row.east || row.west;
                    const rankRaw = r?.rank || 'Maegashira';
                    const rankNum = r?.rankNumber || 1;
                    const rankKanji = rankToKanji[rankRaw] || rankRaw;
                    
                    const isSanyaku = ['Yokozuna', 'Ozeki', 'Sekiwake', 'Komusubi'].includes(rankRaw);
                    const rowBg = isSanyaku ? 'bg-sumo-gold/10' : (idx % 2 === 0 ? 'bg-black/5' : 'transparent');
                    
                    return (
                        <div key={idx} className={clsx(
                            "flex items-center py-2 border-b border-gray-300 font-sumo",
                            rowBg,
                            isSanyaku && "border-sumo-gold border-b-2"
                        )}>
                            {/* East Cell */}
                            <RikishiCell rikishi={row.east} side="East" isSanyaku={isSanyaku} />

                            {/* Center Rank Column */}
                            <div className="w-24 font-bold text-lg text-sumo-black flex flex-col justify-center items-center h-full">
                                <span className={clsx(isSanyaku ? "text-xl scale-110" : "text-base")}>
                                    {rankKanji}
                                </span>
                                {rankRaw === 'Maegashira' && (
                                    <span className="text-xs">{rankNum}枚目</span>
                                )}
                            </div>

                            {/* West Cell */}
                            <RikishiCell rikishi={row.west} side="West" isSanyaku={isSanyaku} />
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

// Sub-component for individual cells
const RikishiCell: React.FC<{ rikishi: Rikishi | null, side: 'East' | 'West', isSanyaku: boolean }> = ({ rikishi, side, isSanyaku }) => {
    if (!rikishi) return <div className="flex-1"></div>;

    return (
        <div className={clsx(
            "flex-1 flex items-center px-4 gap-4",
            side === 'East' ? "flex-row-reverse text-right" : "flex-row text-left",
            isSanyaku ? "font-bold text-sumo-black" : "text-gray-800"
        )}>
           {/* Stats / Info */}
           <div className="text-xs text-gray-500 font-sans flex flex-col gap-1">
                <div>{rikishi.heyaId}部屋</div>
                <div>{rikishi.currentBasho.wins}勝 {rikishi.currentBasho.losses}敗</div>
                {rikishi.isKadoban && <span className="text-red-600 font-bold">[カド番]</span>}
           </div>


           {/* Name */}
           <div className={clsx(
               "text-2xl cursor-pointer hover:text-sumo-red transition-colors duration-200",
               isSanyaku && "text-3xl tracking-widest",
               "font-sumo"
           )}>
               {rikishi.name}
           </div>
           
           {/* Place for Rank Change Badge (Implementation Later) */}
           {/* <div className="text-xs">↑</div> */}
        </div>
    );
}
