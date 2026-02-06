import React from "react";

interface TruckProps {
    volume: number;
    maxVolume: number; 
    impurezaPct: number;
}

export function TruckVisualizer({ volume, maxVolume, impurezaPct }:  TruckProps) {
    const fillPercentage = Math.min((volume / maxVolume) * 100, 100);
    const totalHeight = 60 * (fillPercentage / 100);

    const impurityHeight = totalHeight * (impurezaPct / 100)
    const scrapHeight = totalHeight - impurityHeight;

    const yScrap = 80 - scrapHeight;
    const yImpurity = yScrap - impurityHeight;

  return (
    <div className="relative w-full h-48 mt-4 select-none flex flex-col items-center">
            <div className="w-full flex justify-end gap-4 text-[10px] font-bold text-slate-500 mb-2">
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-600 rounded-sm"></div>Sucata Limpa ({100 - impurezaPct})</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Impureza ({ impurezaPct }%)</span>
            </div>

            <svg viewBox="0 0 300 100" className="w-full h-full drop-shadow-xl filter">
            <g fill="#334155">
                <circle cx="50" cy="90" r="8" />
                <circle cx="70" cy="90" r="8" />
                <circle cx="230" cy="90" r="8" />
                <circle cx="250" cy="90" r="8" />
                <circle cx="270" cy="90" r="8" />
            </g>
            <path d="M220,80 L220,40 L240,40 L250,55 L250,80 Z" fill="#94a3b8" stroke="#475569" strokeWidth="2"/>
            <rect x="20" y="20" width="15" height="60" fill="#f1f5f9" stroke="#475569" strokeWidth="2" rx="2" />
            <defs>
                    <clipPath id="loadClip">
                        <rect x="21" y="21" width="188" height="58" />
                    </clipPath>
                    <linearGradient id="scrapGradient" x1="0" x2="0" y1="0" y2="1" >
                        <stop offset="%0" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#b91c1c" />
                    </linearGradient>
            </defs>
                <rect x="21" 
                      y={yImpurity}
                      width="188"
                      height={impurityHeight}
                      fill="url(#trashGradient)"
                      clipPath="url(#loadClip)"
                      className="transition-all duration-1000 ease-out"
                />

                <g stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" opacity="0.5">
                    <line x1="20" y1="50" x2="210" y2="50" />
                    <line x1="20" y1="20" x2="210" y2="20" />
                </g>
                <text x="5" y="53" fontSize="8" fill="#64748b">50%</text>
                <text x="5" y="23" fontSize="8" fill="#64748b">100%</text>
            </svg>

            <div className="absolute top-1/3 left-1/3 bg-white/90 backdrop-blur px-3 py-1 rounded-full border border-slate-200 text-xs font-bold text-slate-700 shadow-sm ">
                Volume Ocupado: {fillPercentage.toFixed(1)}%
            </div>
        </div>
  );
}
