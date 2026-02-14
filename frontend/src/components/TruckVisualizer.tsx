import React from "react";

interface MaterialItem {
  tipo: string;
  pct: number;
  impureza: number;
}

interface TruckProps {
  materiais: MaterialItem[];
}

const COLORS = [
  "from-blue-600 to-blue-500",
  "from-green-600 to-green-500",
  "from-purple-600 to-purple-500",
  "from-orange-600 to-orange-500",
  "from-yellow-500 to-yellow-400",
  "from-red-600 to-red-500",
];

export function TruckVisualizer({ materiais }: TruckProps) {
  const cleaned = materiais.map((m) => ({
    ...m,
    pct: Number.isFinite(m.pct) ? Math.max(0, m.pct) : 0,
  }));

  const total = cleaned.reduce((acc, m) => acc + m.pct, 0);

  let normalized = cleaned.map((m) => ({
    ...m,
    pctNorm: total > 0 ? (m.pct / total) * 100 : 0,
  }));

  if (total > 0 && normalized.length > 0) {
    const sumNorm = normalized.reduce((acc, m) => acc + m.pctNorm, 0);
    const diff = 100 - sumNorm;
    normalized = normalized.map((m, i) =>
      i === normalized.length - 1 ? { ...m, pctNorm: m.pctNorm + diff } : m
    );
  }

  return (
    <div className="w-full flex flex-col items-center mt-4">
      <div className="w-full flex flex-wrap justify-center gap-3 text-[10px] font-bold text-slate-500 mb-2">
        {normalized.map((m, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <div
              className={`w-3 h-3 rounded-sm bg-gradient-to-r ${
                COLORS[idx % COLORS.length]
              }`}
            />
            {m.tipo || "N/A"} ({m.pctNorm.toFixed(1)}%)
          </div>
        ))}
      </div>

      {/* Container Geral */}
      <div className="relative w-full max-w-lg h-64 border-b border-slate-200 dark:border-slate-700 mx-auto">
        <div
          className="absolute z-0 flex flex-col-reverse overflow-hidden opacity-90"
          style={{
            top: "65px", // Ajuste para descer/subir a carga
            left: "40px", // Ajuste para esquerda/direita
            width: "350px", // Largura exata da caçamba
            height: "105px", // Altura máxima da caçamba
            borderRadius: "0 0 5px 5px", // Leve curva no fundo se precisar
          }}
        >
          {normalized.map((m, idx) => (
            <div
              key={idx}
              className={`w-full bg-gradient-to-r ${
                COLORS[idx % COLORS.length]
              } transition-all duration-1000 border-t border-white/20`}
              style={{ height: `${m.pctNorm}%` }}
            >
              <span className="sr-only">
                {m.tipo}: {m.pctNorm.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>

        <img
          src="/truckSinobras.png"
          alt="Caminhão"
          className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
        />
      </div>
    </div>
  );
}

