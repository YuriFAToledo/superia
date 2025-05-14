/**
 * Define os status possíveis para uma nota fiscal
 */
export type NotaStatus = "pendente" | "em_processamento" | "aprovado" | "rejeitado";

/**
 * Representa uma nota fiscal no sistema
 */
export interface NotaFiscal {
    id: string;
    numero_nf: number;
    cnpj_prestador: string;
    data_emissao: string;
    valor_total: number;
    item_lista_serv?: string;
    discriminacao?: string;
    pricod?: string;
    status: NotaStatus | string;
    motivos_pendencia?: {
        motivo: string;
    };
    attempt_count?: number;
    next_retry?: string | null;
    is_reprocessing?: boolean;
    xml_path?: string;
    pdf_path?: string;
    xml_hash?: string;
    pdf_hash?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Parâmetros para busca de notas fiscais
 */
export interface NotasParams {
    page?: number;
    limit?: number;
    status?: string;
    fornecedor?: string;
    sort?: string;
    order?: 'asc' | 'desc';
}

/**
 * Resposta paginada da API
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Configuração de ordenação
 */
export interface SortConfig {
    field: keyof NotaFiscal | null;
    direction: 'asc' | 'desc';
}

/**
 * Ação de uma nota fiscal
 */
export interface NotaActionConfig {
    label: string;
    onClick: (nota: NotaFiscal) => void;
    className?: string;
}

/**
 * Dados para adicionar uma nova nota fiscal
 */
export interface NotaAddData {
    numero: string;
    fornecedor: string;
    dataEmissao: string;
    valor: string;
}

/**
 * Dados para atualizar uma nota fiscal existente
 */
export interface NotaUpdateData {
    numero?: string;
    fornecedor?: string;
    dataEmissao?: string;
    valor?: string;
    status?: NotaStatus;
    motivo?: string;
} 