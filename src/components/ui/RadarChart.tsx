
import React from 'react';

interface RadarChartProps {
    stats: {
        m: number; // Mind (Target: Top)
        t: number; // Tech (Target: Bottom Right)
        b: number; // Body (Target: Bottom Left)
    };
    labels: [string, string, string];
    size?: number; // Added size prop for flexibility
}

export const RadarChart: React.FC<RadarChartProps> = ({ stats, labels, size = 100 }) => {
    // 0-100 scale. Center 50,50. Radius 40.
    const r = 40;

    // Helper to get coords
    const getPoint = (value: number, angleDeg: number) => {
        const normalized = Math.min(100, Math.max(0, value)) / 100;
        const dist = normalized * r;

        // Up (Mind) - 0 deg
        if (angleDeg === 0) return { x: 50, y: 50 - dist };
        // Right Down (Tech) - 120 deg
        if (angleDeg === 120) return { x: 50 + dist * 0.866, y: 50 + dist * 0.5 };
        // Left Down (Body) - 240 deg
        if (angleDeg === 240) return { x: 50 - dist * 0.866, y: 50 + dist * 0.5 };
        return { x: 50, y: 50 };
    };

    const pM = getPoint(stats.m, 0);
    const pT = getPoint(stats.t, 120);
    const pB = getPoint(stats.b, 240);

    const polyPoints = `${pM.x},${pM.y} ${pT.x},${pT.y} ${pB.x},${pB.y}`;

    const bgM = getPoint(100, 0);
    const bgT = getPoint(100, 120);
    const bgB = getPoint(100, 240);
    const bgPoly = `${bgM.x},${bgM.y} ${bgT.x},${bgT.y} ${bgB.x},${bgB.y}`;

    return (
        <div className="relative mx-auto" style={{ width: size, height: size }}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                {/* Background Triangle */}
                <polygon points={bgPoly} fill="#fcf9f2" stroke="#e2e8f0" strokeWidth="1" />
                {/* Mid lines */}
                <line x1="50" y1="50" x2={bgM.x} y2={bgM.y} stroke="#e2e8f0" strokeWidth="0.5" />
                <line x1="50" y1="50" x2={bgT.x} y2={bgT.y} stroke="#e2e8f0" strokeWidth="0.5" />
                <line x1="50" y1="50" x2={bgB.x} y2={bgB.y} stroke="#e2e8f0" strokeWidth="0.5" />

                {/* Data Polygon */}
                <polygon points={polyPoints} fill="rgba(183, 40, 46, 0.2)" stroke="#b7282e" strokeWidth="1.5" />

                {/* Dots */}
                <circle cx={pM.x} cy={pM.y} r="2" fill="#b7282e" />
                <circle cx={pT.x} cy={pT.y} r="3" fill="#d97706" /> {/* Amber-600 */}
                <circle cx={pB.x} cy={pB.y} r="2" fill="#475569" />
            </svg>

            {/* Labels */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 bg-white/80 px-1 rounded whitespace-nowrap">
                {labels[0]} {Math.floor(stats.m)}
            </div>
            <div className="absolute bottom-2 right-0 text-[10px] font-bold text-slate-500 bg-white/80 px-1 rounded whitespace-nowrap translate-x-1/4">
                {labels[1]} {Math.floor(stats.t)}
            </div>
            <div className="absolute bottom-2 left-0 text-[10px] font-bold text-slate-500 bg-white/80 px-1 rounded whitespace-nowrap -translate-x-1/4">
                {labels[2]} {Math.floor(stats.b)}
            </div>
        </div>
    );
};
