import React from 'react';
import { Calculator, Scale, Box, Percent, CheckCircle, AlertTriangle } from 'lucide-react';
import { TruckVisualizer } from './TruckVisualizer';
import type { EventoLPR } from '../types';

// Configurações de Densidade Copiadas da Planilha
const DENSITY_RANGES: Record<string, [number, number]> = {
  "SUCATA MISTA": [0.2, 0.4],
  "SUCATA MIÚDA": [0.5, 1.5],
  "SUCATA PESADA": [0.5, 1.6],
  "SUCATA GRAÚDA DE CORTE": [0.6, 1.7],
  "SUCATA TRILHO FERROVIÁRIO": [0.6, 1.7],
  "SUCATA SHREDDER INDUSTRIALIZADA": [0.65, 1.15],
  "SUCATA TESOURADA INDUSTRIALIZADA": [0.45, 1.1],
  "SUCATA PESADA INDUSTRIALIZADA": [0.5, 1.6],
  "SUCATA DE GUSA INDUSTRIALIZADA": [2.0, 4.0],
  "GUSA SÓLIDO INDUSTRIALIZADO": [2.7, 3.9],
  "SUCATA PACOTE ENCHARUTADO": [0.4, 1.5],
  "SUCATA PACOTE MISTO": [0.4, 1.5]
};

const MAX_VOLUME_REF = 110; // m3 Bitrem

interface Props {
    formData: Partial<EventoLPR>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<EventoLPR>>>;
    isEditing: boolean;
    ticket: EventoLPR | null;
}

export function ClassificationCalculator({ formData, setFormData, isEditing, ticket }: Props) {
    
    const pesoBruto = Number(formData.peso_balanca) || (ticket?.peso_balanca || 0);
    const pesoTara = Number(formData.peso_tara) || 0;
    const pesoLiquido = Math.max(0, pesoBruto - pesoTara);
    const pesoTon = pesoLiquido / 1000;

    const comp = Number(formData.dim_comprimento) || 0;
    const larg = Number(formData.dim_largura) || 0;
    const alt = Number(formData.dim_altura) || 0;
    const volumeM3 = comp * larg * alt;

    const densidade = volumeM3 > 0 ? (pesoTon / volumeM3) : 0;
    
    const impurezaPct = Number(formData.impureza_porcentagem) || 0;
    const descontoKg = pesoLiquido * (impurezaPct / 100);
    const pesoFinal = pesoLiquido - descontoKg;

    // Validação de Faixa 
    const tipoSelecionado = formData.tipo_sucata || "";
    const range = DENSITY_RANGES[tipoSelecionado];
    
    let statusDensidade = "Aguardando dados";
    let statusColor = "text-slate-400";
    let statusBg = "bg-slate-100";
    
    if (range && volumeM3 > 0) {
        if (densidade < range[0]) { 
            statusDensidade = "ABAIXO DA FAIXA"; 
            statusColor = "text-red-600";
            statusBg = "bg-red-50 border-red-200";
        } else if (densidade > range[1]) { 
            statusDensidade = "ACIMA DA FAIXA"; 
            statusColor = "text-orange-600";
            statusBg = "bg-orange-50 border-orange-200";
        } else { 
            statusDensidade = "DENSIDADE OK"; 
            statusColor = "text-green-700";
            statusBg = "bg-green-50 border-green-200";
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mt-6">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 dark:text-white">
                    <Calculator size={18} className="text-green-600"/> Classificação & Cubagem
                </h3>
                
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Material:</span>
                    {isEditing ? (
                        <select className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm font-bold w-64 outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.tipo_sucata || ''} onChange={e => setFormData({...formData, tipo_sucata: e.target.value})}>
                            <option value="">-- Selecione o Material --</option>
                            {Object.keys(DENSITY_RANGES).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    ) : <span className="font-bold text-sm dark:text-white px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded">{ticket?.tipo_sucata || 'Não classificado'}</span>}
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Pesos */}
                <div className="space-y-3 border-r border-slate-100 dark:border-slate-700 pr-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Scale size={10}/> Balança</h4>
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm text-slate-500">Peso Bruto</span>
                        <span className="font-mono font-bold dark:text-white">{pesoBruto.toLocaleString()} <span className="text-xs text-slate-400">kg</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Tara</span>
                        {isEditing ? (
                            <input type="number" className="w-24 bg-slate-50 border rounded px-1 text-right font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.peso_tara || ''} onChange={e=>setFormData({...formData, peso_tara: Number(e.target.value)})}/>
                        ) : <span className="font-mono text-slate-600 dark:text-slate-300">{pesoTara.toLocaleString()} kg</span>}
                    </div>
                    <div className="pt-2 border-t flex justify-between items-center">
                        <span className="text-xs font-bold text-green-600">LÍQUIDO</span>
                        <span className="font-mono font-bold text-lg text-green-700 dark:text-green-400">{pesoLiquido.toLocaleString()} kg</span>
                    </div>
                </div>

                {/* Dimensões */}
                <div className="space-y-3 border-r border-slate-100 dark:border-slate-700 pr-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Box size={10}/> Dimensões (m)</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {['comprimento', 'largura', 'altura'].map((f) => (
                            <div key={f}>
                                <span className="text-[10px] text-slate-400 block capitalize">{f.substr(0,4)}.</span>
                                {isEditing ? (
                                    <input type="number" className="w-full bg-slate-50 border rounded px-1 text-center font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData[`dim_${f}` as keyof EventoLPR] || ''} 
                                        onChange={e=>setFormData({...formData, [`dim_${f}`]: Number(e.target.value)})}/>
                                ) : <span className="font-mono text-sm block text-center dark:text-white">{ticket ? ticket[`dim_${f}` as keyof EventoLPR] : '-'}</span>}
                            </div>
                        ))}
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center border border-blue-100 dark:border-blue-800">
                        <span className="text-[10px] font-bold text-blue-600 block uppercase">Volume Total</span>
                        <span className="text-xl font-mono font-bold text-blue-700 dark:text-blue-400">{volumeM3.toFixed(2)} m³</span>
                    </div>
                </div>

                {/* Densidade */}
                <div className="space-y-3 border-r border-slate-100 dark:border-slate-700 pr-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase">Densidade (t/m³)</h4>
                    <div className="flex items-center justify-between">
                        <span className="text-3xl font-mono font-bold text-slate-800 dark:text-white">{densidade.toFixed(3)}</span>
                        <div className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1 ${statusBg} ${statusColor}`}>
                            {statusDensidade.includes("OK") ? <CheckCircle size={10}/> : <AlertTriangle size={10}/>}
                            {statusDensidade}
                        </div>
                    </div>
                    {range && (
                        <div className="text-[10px] text-slate-400 text-center mt-2 bg-slate-100 dark:bg-slate-700 rounded py-1">
                            Faixa Ideal: <strong>{range[0]}</strong> a <strong>{range[1]}</strong>
                        </div>
                    )}
                </div>

                {/* Impureza*/}
                <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Percent size={10}/> Resultados</h4>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Impureza (%)</span>
                        {isEditing ? (
                            <input type="number" className="w-16 bg-slate-50 border rounded px-1 text-right font-mono text-sm text-red-600 focus:ring-2 focus:ring-red-500 outline-none"
                                value={formData.impureza_porcentagem || ''} onChange={e=>setFormData({...formData, impureza_porcentagem: Number(e.target.value)})}/>
                        ) : <span className="font-mono font-bold text-red-600">{impurezaPct}%</span>}
                    </div>
                    <div className="text-right text-xs text-red-400 font-mono">- {descontoKg.toFixed(0)} kg</div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800 text-center mt-2">
                        <span className="text-[10px] font-bold text-green-700 dark:text-green-500 uppercase block">Peso Final (Pagamento)</span>
                        <span className="text-2xl font-mono font-bold text-green-800 dark:text-green-400">{pesoFinal.toLocaleString()} <span className="text-sm">kg</span></span>
                    </div>
                </div>

            </div>

            <div className="px-6 pb-6 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-400 uppercase mt-4 mb-2 text-center">Simulação de Carga (Volume vs Impureza)</h4>
                <TruckVisualizer volume={volumeM3} maxVolume={MAX_VOLUME_REF} impurezaPct={impurezaPct} />
            </div>
        </div>
    );
}
