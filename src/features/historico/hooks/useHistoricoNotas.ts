import { useCallback, useState, useEffect } from 'react'
import { NotaFiscal, NotasParams } from '../types'
import axios from 'axios'
import { useAuth } from '@/features/auth/hooks/useAuth'

// Interface SortConfig interna para evitar conflitos de tipo
interface SortConfig {
    field: keyof NotaFiscal | null;
    direction: 'asc' | 'desc';
}

// URL base da API
const API_URL = 'https://superia-trading.app.n8n.cloud/webhook/nfs-pendentes';

/**
 * Hook especializado para gerenciar o histórico de notas fiscais
 */
export function useHistoricoNotas(initialParams: NotasParams = {}) {
    // Estados básicos
    const [notas, setNotas] = useState<NotaFiscal[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(initialParams.page || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: null,
        direction: 'desc'
    });
    
    // Obter o token de autenticação
    const { getAuthToken } = useAuth();

    // Função para buscar notas da API
    const fetchNotasFromAPI = useCallback(async (params: NotasParams) => {
        try {
            // Obter o token de autenticação
            const token = getAuthToken();
            
            // Configurar headers com o token
            const headers = {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            };
            
            // Construir a URL com os parâmetros
            let url = API_URL;
            
            // Adicionar parâmetro de status
            const status = params.status || 'pendente';
            url = `${url}?status=${status}`;
            
            // Adicionar outros parâmetros se existirem
            if (params.fornecedor) {
                url = `${url}&fornecedor="${params.fornecedor}"`;
            }
            
            if (params.sort) {
                url = `${url}&sort=${params.sort}&order=${params.order || 'asc'}`;
            }
            
            if (params.page) {
                const limit = params.limit || 8;
                const offset = (params.page - 1) * limit;
                url = `${url}&limit=${limit}&offset=${offset}`;
            }
            
            // Fazer a chamada à API com os headers de autenticação
            const response = await axios.get(url, { headers });
            
            // Processar a resposta para o formato esperado
            let responseData = response.data;
            
            // Se a resposta for um array direto, adaptar para o formato esperado
            if (Array.isArray(responseData)) {
                responseData = {
                    notas: responseData,
                    totalItems: responseData.length,
                    totalPages: 1,
                    page: 1
                };
            }
            
            return responseData;
        } catch (error) {
            console.error('Erro ao buscar notas fiscais:', error);
            throw new Error('Falha ao buscar notas fiscais da API');
        }
    }, [getAuthToken]);

    // Função para filtrar notas com base nos parâmetros
    const filterNotas = useCallback(async (params: NotasParams) => {
        // Definir o estado de carregamento antes de iniciar a requisição
        setLoading(true);
        setError(null);
        
        try {
            // Buscar dados da API
            const data = await fetchNotasFromAPI(params);
            
            // Verificar se os dados estão no formato esperado
            const notasData = data.notas || data;
            
            // Atualizar estados com os dados da API
            if (Array.isArray(notasData)) {
                setNotas(notasData);
                setPage(params.page || 1);
                setTotalPages(data.totalPages || Math.ceil((data.totalItems || notasData.length) / (params.limit || 8)));
            } else {
                console.warn('Formato de resposta inesperado:', notasData);
                setNotas([]);
                setPage(params.page || 1);
                setTotalPages(1);
            }
        } catch (err) {
            console.error('Erro ao buscar notas fiscais:', err);
            setError('Erro ao buscar notas fiscais');
            setNotas([]);
        } finally {
            // Garantir que o estado de carregamento seja atualizado apenas quando todas as operações terminarem
            setLoading(false);
        }
    }, [fetchNotasFromAPI]);

    // Efeito para carregar as notas iniciais
    useEffect(() => {
        filterNotas({
            status: 'pendente',
            limit: initialParams.limit || 8
        });
    }, [filterNotas, initialParams.limit]);
    
    // Função de busca específica para o histórico
    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        
        filterNotas({
            status: 'pendente',
            fornecedor: term.trim() ? term : undefined,
            page: 1,
            limit: initialParams.limit || 8
        });
    }, [filterNotas, initialParams.limit]);
    
    // Função para lidar com mudança de página
    const handlePageChange = useCallback((newPage: number) => {
        filterNotas({
            status: 'pendente',
            page: newPage,
            fornecedor: searchTerm || undefined,
            limit: initialParams.limit || 8
        });
    }, [filterNotas, searchTerm, initialParams.limit]);
    
    // Função para ordenar resultados
    const handleSort = useCallback((field: keyof NotaFiscal) => {
        const direction = 
            sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        
        setSortConfig({ field: field as keyof NotaFiscal | null, direction });
        
        filterNotas({
            status: 'pendente',
            sort: field as string,
            order: direction,
            page: 1,
            limit: initialParams.limit || 8,
            fornecedor: searchTerm || undefined
        });
    }, [filterNotas, sortConfig, searchTerm, initialParams.limit]);
    
    // Função para obter o PDF de uma nota
    const getNotaPDF = useCallback(async (id: string) => {
        try {
            // Obter o token de autenticação
            const token = getAuthToken();
            
            // Verificar se temos o caminho do PDF
            const nota = notas?.find(n => n.id === id);
            if (nota && nota.pdf_path) {
                const response = await axios.get(`${API_URL}/pdf/${id}`, {
                    responseType: 'blob',
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                    }
                });
                
                // Criar URL para download
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `nota-fiscal-${id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else {
                alert('PDF não disponível para esta nota fiscal');
            }
        } catch (error) {
            console.error('Erro ao baixar PDF:', error);
            alert('Erro ao baixar o PDF da nota fiscal');
        }
    }, [getAuthToken, notas]);
    
    // Função para obter o XML de uma nota
    const getNotaXML = useCallback(async (id: string) => {
        try {
            // Obter o token de autenticação
            const token = getAuthToken();
            
            // Verificar se temos o caminho do XML
            const nota = notas?.find(n => n.id === id);
            if (nota && nota.xml_path) {
                const response = await axios.get(`${API_URL}/xml/${id}`, {
                    responseType: 'blob',
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                    }
                });
                
                // Criar URL para download
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `nota-fiscal-${id}.xml`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else {
                alert('XML não disponível para esta nota fiscal');
            }
        } catch (error) {
            console.error('Erro ao baixar XML:', error);
            alert('Erro ao baixar o XML da nota fiscal');
        }
    }, [getAuthToken, notas]);
    
    // Função para buscar uma nota específica pelo ID
    const getNotaById = useCallback(async (id: string) => {
        try {
            // Obter o token de autenticação
            const token = getAuthToken();
            
            const response = await axios.get(`${API_URL}/${id}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar detalhes da nota:', error);
            return null;
        }
    }, [getAuthToken]);
    
    return {
        notas,
        loading,
        error,
        page,
        totalPages,
        searchTerm,
        sorting: sortConfig,
        fetchNotas: filterNotas,
        handleSearch,
        handlePageChange,
        handleSort,
        getNotaPDF,
        getNotaXML,
        getNotaById,
        setLoading,
    }
} 