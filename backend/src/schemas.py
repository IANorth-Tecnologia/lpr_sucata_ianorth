from pydantic import BaseModel
from typing import Optional

class EventoUpdate(BaseModel):
    ticket_id: Optional[int] = None
    status_ticket: Optional[str] = None
    motorista: Optional[str] = None
    fornecedor_nome: Optional[str] = None
    produto_declarado: Optional[str] = None
    nota_fiscal: Optional[str] = None
    tipo_veiculo: Optional[str] = None
    peso_nf: Optional[float] = None
    peso_balanca: Optional[float] = None
    observacao: Optional[str] = None

    peso_tara: Optional[float] = None
    dim_comprimento: Optional[float] = None
    dim_largura: Optional[float] = None
    dim_altura: Optional[float] = None
    impureza_porcentagem: Optional[float] = None
    tipo_sucata: Optional[str] = None
    uf_veiculo: Optional[str] = None
    data_entrada_sinobras: Optional[str] = No

class EventoLPRResponse(BaseModel):
    id: int
    timestamp_registro: str
    placa_veiculo: str
    camera_nome: str
    
    ticket_id: Optional[int] = None
    status_ticket: Optional[str] = None
    motorista: Optional[str] = None
    fornecedor_nome: Optional[str] = None
    produto_declarado: Optional[str] = None
    nota_fiscal: Optional[str] = None
    tipo_veiculo: Optional[str] = None
    codigo_fluxo: Optional[str] = None
    
    peso_nf: Optional[float] = None
    peso_balanca: Optional[float] = None
    
    snapshot_url: Optional[str] = None
    video_url: Optional[str] = None
    origem_dado: Optional[str] = None

    observacao: Optional[str] = None
    fotos_avaria: Optional[str] = None

    peso_tara: Optional[float] = None
    peso_liquido: Optional[float] = None
    dim_comprimento: Optional[float] = None
    dim_largura: Optional[float] = None
    dim_altura: Optional[float] = None
    cubagem_m3: Optional[float] = None
    densidade: Optional[float] = None
    impureza_porcentagem: Optional[float] = None
    desconto_kg: Optional[float] = None
    tipo_sucata: Optional[str] = None

    class Config:
        from_attributes = True

class CameraConfigSchema(BaseModel):
    ip_address: str
    username: str
    password: str
    is_active: bool = True

    class Config:
        from_attributes = True
