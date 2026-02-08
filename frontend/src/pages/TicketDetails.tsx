import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Printer, Truck, Scale, MapPin, Calendar, 
    Camera, PlayCircle, Edit3, Save, X, Trash2, Aperture, 
    Monitor, Upload, ChevronDown, ChevronUp, Clock 
} from 'lucide-react';
import type { EventoLPR } from '../types';
import { API_BASE_URL, getMediaUrl } from '../config'; 
import { ClassificationCalculator } from '../components/ClassificationCalculator';
import { MediaModal } from '../components/dashboard/MediaModal';

interface GarraConfig { id: number; nome: string; }

export function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<EventoLPR | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<EventoLPR>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaModal, setMediaModal] = useState<{url: string, type: 'image' | 'video'} | null>(null);

  const [listaGarras, setListaGarras] = useState<GarraConfig[]>([]);
  const [cameraAtivaId, setCameraAtivaId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [capturando, setCapturando] = useState(false);

  useEffect(() => { carregarDados(); carregarGarras(); }, [id]);

  useEffect(() => {
    let intervalId: any;
    if (cameraAtivaId !== null) {
        const update = () => setPreviewUrl(`${API_BASE_URL}/proxy/snapshot/garra/${cameraAtivaId}?t=${Date.now()}`);
        update();
        intervalId = setInterval(update, 1000);
    } else { setPreviewUrl(''); }
    return () => clearInterval(intervalId);
  }, [cameraAtivaId]);

  const carregarGarras = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/config/garras`);
        if (res.ok) setListaGarras(await res.json());
    } catch (e) { console.error(e); }
  };

  const carregarDados = () => {
    fetch(`${API_BASE_URL}/eventos/${id}`)
      .then(res => res.json())
      .then(data => { setTicket(data); setFormData(data); setLoading(false); })
      .catch(err => console.error(err));
  }

  const handleSave = async () => {
    setSaving(true);
    try {
        const res = await fetch(`${API_BASE_URL}/eventos/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                ...formData,
                ticket_id: Number(formData.ticket_id),
                observacao: formData.observacao,
                peso_tara: Number(formData.peso_tara),
                dim_comprimento: Number(formData.dim_comprimento),
                dim_largura: Number(formData.dim_largura),
                dim_altura: Number(formData.dim_altura),
                impureza_porcentagem: Number(formData.impureza_porcentagem),
                tipo_sucata: formData.tipo_sucata
            })
        });
        if (res.ok) {
            const data = await res.json();
            setTicket(data); setFormData(data); setIsEditing(false);
            alert("Salvo com sucesso!");
        } else alert("Erro ao salvar.");
    } catch (e) { alert("Erro de conexão."); } finally { setSaving(false); }
  };

  const handleCapturaGarra = async () => {
      if (cameraAtivaId === null) return;
      setCapturando(true);
      try {
          const res = await fetch(`${API_BASE_URL}/eventos/${id}/captura-remota`, {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ garra_id: cameraAtivaId })
          });
          if (res.ok) { const d = await res.json(); atualizarListaFotos(d.url); }
          else alert("Falha na captura.");
      } catch (e) { alert("Erro."); } finally { setCapturando(false); }
  };

  const handleUploadManual = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.length) return;
      setUploading(true);
      const fd = new FormData(); fd.append('file', e.target.files[0]);
      try {
          const res = await fetch(`${API_BASE_URL}/eventos/${id}/upload-avaria`, { method: 'POST', body: fd });
          if (res.ok) { const d = await res.json(); atualizarListaFotos(d.url); }
      } catch (e) { console.error(e); } finally { setUploading(false); }
  };

  const handleDeleteFoto = async (url: string, e: React.MouseEvent) => {
      e.stopPropagation(); if(!confirm("Apagar?")) return;
      try {
          const res = await fetch(`${API_BASE_URL}/eventos/${id}/remover-foto`, {
              method: 'DELETE', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ foto_url: url })
          });
          if(res.ok) {
              const nova = ticket?.fotos_avaria?.split(',').filter(u => u !== url).join(',');
              setTicket(prev => prev ? ({...prev, fotos_avaria: nova}) : null);
              setFormData(prev => ({...prev, fotos_avaria: nova}));
          }
      } catch(e) { alert("Erro."); }
  }

  const atualizarListaFotos = (url: string) => {
      const nova = ticket?.fotos_avaria ? `${ticket.fotos_avaria},${url}` : url;
      if (ticket) setTicket({...ticket, fotos_avaria: nova});
      setFormData(prev => ({...prev, fotos_avaria: nova}));
  }

  if (loading) return <div className="p-10 text-center">Carregando...</div>;
  if (!ticket) return <div className="p-10 text-center text-red-500">Erro.</div>;

  const listaFotos = ticket.fotos_avaria ? ticket.fotos_avaria.split(',').filter(x=>x) : [];
  
  // Auditoria de Peso 
  const pesoBruto = ticket.peso_balanca || 0;
  const pesoTara = Number(formData.peso_tara) || 0;
  const pesoLiquido = Math.max(0, pesoBruto - pesoTara);

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      
      {mediaModal && <MediaModal url={mediaModal.url} type={mediaModal.type} onClose={() => setMediaModal(null)} />}

      {/* HEADER DE AÇÕES */}
      <div className="flex justify-between items-center no-print">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
          <ArrowLeft size={20} /> DashBoard
        </button>
        <div className="flex gap-3">
            {!isEditing ? (
                <>
                    <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 px-4 py-2 rounded font-medium hover:bg-slate-300"><Printer size={18} /> Imprimir Relatório</button>
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-500 shadow-lg"><Edit3 size={18} /> Editar Dados</button>
                </>
            ) : (
                <>
                    <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 px-4 py-2 rounded font-medium hover:bg-red-100"><X size={18} /> Cancelar</button>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-500 shadow-lg">{saving ? '...' : <><Save size={18} /> Salvar</>}</button>
                </>
            )}
        </div>
      </div>

      {/* CABEÇALHO TICKET */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center shadow-sm">
        <div>
            <div className="flex items-center gap-3">
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded uppercase">Entrada</span>
                <span className="text-sm text-slate-400 font-mono">{ticket.camera_nome}</span>
            </div>
            <h1 className="text-3xl font-bold mt-1 dark:text-white">Ticket #{ticket.ticket_id}</h1>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                <Clock size={14}/> Reg. Interno: {ticket.timestamp_registro}
            </p>
        </div>
        <div className={`px-4 py-2 rounded border text-center ${ticket.status_ticket==='Finalizado'?'bg-green-50 text-green-700 border-green-200':'bg-blue-50 text-blue-700 border-blue-200'}`}>
            <span className="block text-xs uppercase font-bold opacity-70">Status Sinobras</span>
            <span className="text-xl font-bold">{ticket.status_ticket}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* DADOS COMPLETOS */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 h-full shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Truck size={18} className="text-blue-500"/> Dados do Transporte
            </h3>
            <div className="space-y-3">
                <InfoRow label="Placa" value={ticket.placa_veiculo} highlight />
                <InfoRow label="UF" value={ticket.uf_veiculo} />
                <InfoRow label="Tipo Veículo" value={ticket.tipo_veiculo} />
                <InfoRow label="Motorista" value={ticket.motorista} />
                <div className="border-t border-slate-100 dark:border-slate-700 pt-2 mt-2"></div>
                <InfoRow label="Fornecedor" value={ticket.fornecedor_nome} />
                <InfoRow label="Produto" value={ticket.produto_declarado} />
                <InfoRow label="Nota Fiscal" value={ticket.nota_fiscal} />
                <InfoRow label="Entrada " value={ticket.data_entrada_sinobras} />
            </div>
          </div>
        </div>

        {/* AUDITORIA DE PESO */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 h-full shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Scale size={18} className="text-blue-500"/> Auditoria de Peso
            </h3>
            <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded border border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-500 block uppercase font-bold mb-1">Peso Bruto (agi)</span>
                    <span className="text-3xl font-mono font-bold dark:text-white text-slate-800">
                        {pesoBruto.toLocaleString()} <span className="text-sm font-sans text-slate-400">kg</span>
                    </span>
                </div>
                
                <div className="flex justify-between items-center px-2 py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-sm text-slate-500">Tara (carreta)</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{pesoTara.toLocaleString()} kg</span>
                </div>
                
                <div className="pt-2 flex justify-between items-center px-2 bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-100 dark:border-green-800">
                    <span className="text-sm font-bold text-green-600 uppercase">Peso Líquido</span>
                    <span className="font-mono text-xl font-bold text-green-700 dark:text-green-400">{pesoLiquido.toLocaleString()} kg</span>
                </div>
            </div>
          </div>
        </div>

        {/* MÍDIA DA ENTRADA */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Camera size={18} className="text-blue-500"/> Registro Visual da Entrada
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div 
                    className="aspect-video bg-black rounded flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 group relative"
                    onClick={() => ticket.snapshot_url && setMediaModal({url: ticket.snapshot_url, type: 'image'})}
                >
                    {ticket.snapshot_url ? (
                        <>
                            <img src={getMediaUrl(ticket.snapshot_url)} className="w-full h-full object-contain" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                                <Camera className="text-white drop-shadow-md" size={24}/>
                            </div>
                        </>
                    ) : <span className="text-xs text-slate-500">Sem foto</span>}
                </div>
                <div 
                    className="aspect-video bg-black rounded flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 group relative"
                    onClick={() => ticket.video_url && setMediaModal({url: ticket.video_url, type: 'video'})}
                >
                    {ticket.video_url ? (
                        <>
                            <video className="w-full h-full object-contain pointer-events-none"><source src={getMediaUrl(ticket.video_url)} type="video/mp4"/></video>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                                <PlayCircle className="text-white drop-shadow-md" size={32}/>
                            </div>
                        </>
                    ) : <span className="text-xs text-slate-500">Sem vídeo</span>}
                </div>
            </div>
        </div>
      </div>

      {/* MONITOR GARRAS */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Edit3 size={18} className="text-orange-500"/> Monitoramento de Classificação
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Observações do classificador</label>
                {isEditing ? (
                    <textarea className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 h-48 focus:ring-2 outline-none text-slate-700 dark:text-slate-200 resize-none"
                        value={formData.observacao || ''} onChange={e => setFormData({...formData, observacao: e.target.value})} placeholder="Registre observações..."/>
                ) : (
                    <div className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-lg p-3 h-48 overflow-y-auto text-slate-600 italic">
                        {ticket?.observacao || 'Descreva impurezas, objetos estranhos, etc...'}
                    </div>
                )}
            </div>
            
            <div className="lg:col-span-2 flex flex-col gap-4">
                {/* Câmera */}
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                     <div className="flex gap-2 overflow-x-auto">
                        {listaGarras.length > 0 ? listaGarras.map((cam) => (
                            <button key={cam.id} onClick={() => setCameraAtivaId(cameraAtivaId === cam.id ? null : cam.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold border flex items-center gap-2 ${cameraAtivaId === cam.id ? 'bg-red-600 text-white border-red-700' : 'bg-white dark:bg-slate-700 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                                <Monitor size={16}/> {cam.nome} {cameraAtivaId === cam.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                            </button>
                        )) : <span className="text-xs text-slate-400 px-2">Sem garras.</span>}
                    </div>
                    <label className="cursor-pointer flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-500 px-2 border-l ml-2 pl-4">
                        <Upload size={14}/> Upload Manual <input type="file" className="hidden" onChange={handleUploadManual} disabled={uploading} />
                    </label>
                </div>

                {/* Vídeo */}
                {cameraAtivaId !== null && (
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center border border-slate-800 shadow-lg">
                        {previewUrl ? <img src={previewUrl} className="w-full h-full object-contain" alt="Live" /> : <div className="text-white animate-pulse text-xs">Conectando...</div>}
                        <button onClick={handleCapturaGarra} disabled={capturando} className="absolute bottom-4 bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-full font-bold shadow-xl flex items-center gap-2">
                            {capturando ? '...' : <><Camera size={15} /> CAPTURAR</>}
                        </button>
                    </div>
                )}

                {/* Galeria de Evidências */}
                <div className="bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2"><Camera size={14} className="text-slate-400"/><span className="text-xs font-bold text-slate-500">EVIDÊNCIAS COLETADAS ({listaFotos.length})</span></div>
                    <div className="grid grid-cols-6 gap-2">
                        {listaFotos.length > 0 ? listaFotos.map((url, idx) => (
                            <div 
                                key={idx} 
                                className="relative group aspect-square bg-slate-200 rounded overflow-hidden cursor-pointer hover:ring-2 ring-blue-500 transition" 
                                onClick={() => setMediaModal({url, type: 'image'})}
                            >
                                <img src={getMediaUrl(url)} className="w-full h-full object-cover"/>
                                <button 
                                    onClick={(e) => handleDeleteFoto(url, e)} 
                                    className="absolute top-0 right-0 bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Excluir"
                                >
                                    <Trash2 size={12}/>
                                </button>
                            </div>
                        )) : <span className="col-span-6 text-center text-xs text-slate-400 py-2">Nenhuma impureza registrada.</span>}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* CALCULADORA */}
      <ClassificationCalculator formData={formData} setFormData={setFormData} ticket={ticket} />
    </div>
  );
}

function InfoRow({ label, value, highlight }: any) {
    return (
        <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-700/50 pb-2 h-10">
            <span className="text-sm text-slate-500 w-1/3">{label}</span>
            <span className={`font-medium text-right w-2/3 truncate ${highlight ? 'text-lg font-mono font-bold bg-slate-100 dark:bg-slate-900 px-2 rounded' : 'text-slate-700 dark:text-slate-200'}`}>{value || '---'}</span>
        </div>
    )
}
