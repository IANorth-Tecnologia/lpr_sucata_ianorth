import React from "react";

interface MaterialItem {
    tipo: string;
    pct: number;
    impureza: number;
}

interface TruckProps {
    volume: number;
    maxVolume: number;
    materiais: MaterialItem[];
}

const COLORS = [
    'from-blue-600 to-blue-500', 
    'from-green-600 to-green-500', 
    'from-purple-600 to-purple-500', 
    'from-orange-600 to-orange-500'
];

export function TruckVisualizer({ volume, maxVolume, materiais }: TruckProps) {
    const totalFillPercentage = Math.min((volume / maxVolume) * 100, 100);

    return (
        <div className="w-full flex flex-col items-center mt-4">
             <div className="w-full flex flex-wrap justify-end gap-3 text-[10px] font-bold text-slate-500 mb-2">
                {materiais.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded-sm bg-gradient-to-r ${COLORS[idx % COLORS.length]}`}></div>
                        {m.tipo || 'N/A'} ({m.pct}%)
                    </div>
                ))}
            </div>

            <div className="relative w-full max-w-lg h-64 border-b border-slate-200 dark:border-slate-700">
                <div className="absolute bottom-[45px] left-[25px] right-[85px] h-[150px] flex flex-col-reverse justify-start overflow-hidden opacity-90 rounded-sm bg-slate-100 dark:bg-slate-800/50">
                    {materiais.map((m, idx) => {
                        const itemHeight = totalFillPercentage * (m.pct / 100);
                        return (
                            <div 
                                key={idx}
                                className={`w-full bg-gradient-to-r ${COLORS[idx % COLORS.length]} transition-all duration-1000 border-t border-white/20 relative group`}
                                style={{ height: `${itemHeight}%` }}
                            >
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition">
                                    {m.impureza > 0 && `Imp: ${m.impureza}%`}
                                </span>
                            </div>
                        )
                    })}
                </div>

                <img 
                    src="/truckSinobras.png"
                    alt="Caminhão"
                    className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none mix-blend-multiply dark:mix-blend-normal"
                />

                <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold shadow border dark:border-slate-600 dark:text-white">
                    {totalFillPercentage.toFixed(1)}% Ocupado
                </div>
            </div>
        </div>
    );
}
