import api from './api-config';
import { NotaFiscal } from '@/components/common/notas/types';

// Interface para os parâmetros de busca de notas fiscais
export interface NotasParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    fornecedor?: string;
    status?: string;
    dataInicio?: string;
    dataFim?: string;
}

// Interface para a resposta paginada da API
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Classe de serviço para Notas Fiscais
class NotasService {
    // Buscar todas as notas com paginação e filtros
    async getNotas(params: NotasParams = {}): Promise<PaginatedResponse<NotaFiscal>> {
        const { data } = await api.get<PaginatedResponse<NotaFiscal>>('/notas', {
            params,
        });
        return data;
    }

    // Buscar notas históricas (aprovadas)
    async getHistoricoNotas(params: NotasParams = {}): Promise<PaginatedResponse<NotaFiscal>> {
        // Adicionando filtro de status para aprovado
        const { data } = await api.get<PaginatedResponse<NotaFiscal>>('/notas/historico', {
            params: {
                ...params,
                status: 'aprovado',
            },
        });
        return data;
    }

    // Buscar uma nota específica pelo ID
    async getNotaById(id: string): Promise<NotaFiscal> {
        const { data } = await api.get<NotaFiscal>(`/notas/${id}`);
        return data;
    }

    // Acessar PDF de uma nota
    async getNotaPDF(id: string): Promise<Blob> {
        const { data } = await api.get<Blob>(`/notas/${id}/pdf`, {
            responseType: 'blob',
        });
        return data;
    }

    // Exportar nota como XML
    async getNotaXML(id: string): Promise<Blob> {
        const { data } = await api.get<Blob>(`/notas/${id}/xml`, {
            responseType: 'blob',
        });
        return data;
    }

    // Atualizar status de uma nota
    async updateNotaStatus(id: string, status: string): Promise<NotaFiscal> {
        const { data } = await api.patch<NotaFiscal>(`/notas/${id}/status`, { status });
        return data;
    }
}

// Exportar uma instância única do serviço
export const notasService = new NotasService(); 