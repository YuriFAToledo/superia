import { useCallback, useState, useEffect, useRef } from 'react'
import { NotaFiscal, NotasParams, NotaStatusEnum } from '../types'
import axios, { CancelTokenSource } from 'axios'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { toast } from 'sonner'
import { getStatusParam, isValidNotasData } from '../utils/notasUtils'

// Interface SortConfig interna para evitar conflitos de tipo
interface SortConfig {
    field: keyof NotaFiscal | null;
    direction: 'asc' | 'desc';
}

// URL base da API
const API_URL = 'https://superia-trading.app.n8n.cloud/webhook/nfs-pendentes';

// Número fixo de itens por página
const ITEMS_PER_PAGE = 7;

/**
 * Hook especializado para gerenciar notas fiscais
 */
export function useNotasFiscais(initialParams: NotasParams = {}) {
    // Estados básicos
    const [notas, setNotas] = useState<NotaFiscal[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(initialParams.page || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [counters, setCounters] = useState({ pendentes: 0, emProcessamento: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: null,
        direction: 'desc'
    });
    
    // Dados completos para paginação local
    const allNotasRef = useRef<NotaFiscal[]>([]);
    
    // Referência para o token de cancelamento da última requisição
    const cancelTokenRef = useRef<CancelTokenSource | null>(null);
    
    // Obter o token de autenticação
    const { getAuthToken } = useAuth();

    // Função para buscar contadores do dashboard
    const fetchCounters = useCallback(async () => {
        try {
            const token = getAuthToken();
            const headers = {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            };
            
            const response = await axios.get(`${API_URL}/counters`, { headers });
            const data = response.data;
            
            setCounters({
                pendentes: data.pendentes || 0,
                emProcessamento: data.emProcessamento || 0
            });
            
            return data;
        } catch (error) {
            return { pendentes: 0, emProcessamento: 0 };
        }
    }, [getAuthToken]);

    // Função para buscar notas da API
    const fetchNotasFromAPI = useCallback(async (params: NotasParams) => {
        try {
            // Cancelar requisição anterior se existir
            if (cancelTokenRef.current) {
                cancelTokenRef.current.cancel('Operação cancelada devido a nova requisição');
            }
            
            cancelTokenRef.current = axios.CancelToken.source();
            
            const token = getAuthToken();
            const headers = {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            };
            
            // Construir a URL com os parâmetros
            let url = API_URL;
            
            if (params.status) {
                const statusValue = params.status === NotaStatusEnum.PENDENTE ? 'pendente' : 
                                  params.status === NotaStatusEnum.EM_PROCESSAMENTO ? 'em_processamento' : 
                                  params.status;
                url = `${url}?status=${statusValue}`;
            }
            
            if (params.fornecedor) {
                url = `${url}${url.includes('?') ? '&' : '?'}fornecedor="${params.fornecedor}"`;
            }
            
            if (params.sort) {
                url = `${url}${url.includes('?') ? '&' : '?'}sort=${params.sort}&order=${params.order || 'asc'}`;
            }
            
            // Delay para debounce
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const response = await axios.get(url, { 
                headers,
                cancelToken: cancelTokenRef.current.token
            });
            
            const responseData = response.data;
            
            // Processar resposta
            if (Array.isArray(responseData)) {
                return isValidNotasData(responseData) ? responseData : [];
            }
            
            if (responseData.notas && Array.isArray(responseData.notas)) {
                return isValidNotasData(responseData.notas) ? responseData.notas : [];
            }
            
            return [];
        } catch (error) {
            if (axios.isCancel(error)) {
                return [];
            }
            throw new Error('Falha ao buscar notas fiscais da API');
        }
    }, [getAuthToken]);

    // Função para aplicar paginação nos dados
    const paginateData = useCallback((data: NotaFiscal[], currentPage: number) => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return data.slice(startIndex, endIndex);
    }, []);

    // Função para filtrar notas com base nos parâmetros
    const filterNotas = useCallback(async (params: NotasParams) => {
        setLoading(true);
        setError(null);
        
        try {
            const notasData = await fetchNotasFromAPI(params);
            
            if (Array.isArray(notasData) && isValidNotasData(notasData)) {
                // Guardar todos os dados
                allNotasRef.current = notasData;
                
                // Calcular total de páginas
                const totalPages = Math.ceil(notasData.length / ITEMS_PER_PAGE);
                setTotalPages(totalPages || 1);
                
                // Definir página atual
                const newPage = params.page || 1;
                const validPage = Math.min(Math.max(1, newPage), totalPages || 1);
                setPage(validPage);
                
                // Aplicar paginação
                const paginatedData = paginateData(notasData, validPage);
                setNotas(paginatedData);
            } else {
                // Dados vazios
                allNotasRef.current = [];
                setNotas([]);
                setPage(1);
                setTotalPages(1);
            }
            
            await fetchCounters();
        } catch (err) {
            setError('Erro ao buscar notas fiscais');
            allNotasRef.current = [];
            setNotas([]);
        } finally {
            setTimeout(() => setLoading(false), 700);
        }
    }, [fetchNotasFromAPI, fetchCounters, paginateData]);

    // Efeito para carregar as notas iniciais
    useEffect(() => {
        filterNotas({
            status: initialParams.status,
            limit: initialParams.limit || 7
        });
        
        return () => {
            if (cancelTokenRef.current) {
                cancelTokenRef.current.cancel('Componente desmontado');
            }
        };
    }, []);
    
    // Função para lidar com a mudança de filtro
    const handleFilterChange = useCallback((filter: string | null) => {
        setActiveFilter(filter);
        
        filterNotas({
            status: getStatusParam(filter),
            page: 1,
            fornecedor: searchTerm || undefined,
            limit: initialParams.limit || 7
        });
    }, [filterNotas, searchTerm, initialParams.limit]);
    
    // Função para lidar com a busca
    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        filterNotas({
            status: getStatusParam(activeFilter),
            page: 1,
            fornecedor: term || undefined,
            limit: initialParams.limit || 7
        });
    }, [filterNotas, activeFilter, initialParams.limit]);
    
    // Função para lidar com mudança de página
    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        const paginatedData = paginateData(allNotasRef.current, newPage);
        setNotas(paginatedData);
    }, [paginateData]);
    
    // Função para ordenar resultados
    const handleSort = useCallback((field: keyof NotaFiscal) => {
        const direction = 
            sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        
        setSortConfig({ field, direction });
        
        // Ordenar os dados localmente
        const sortedData = [...allNotasRef.current].sort((a, b) => {
            if (!a[field] || !b[field]) return 0;
            
            if (a[field] < b[field]) {
                return direction === 'asc' ? -1 : 1;
            }
            if (a[field] > b[field]) {
                return direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        
        // Atualizar dados completos ordenados
        allNotasRef.current = sortedData;
        
        // Aplicar paginação nos dados ordenados
        const paginatedData = paginateData(sortedData, 1);
        setNotas(paginatedData);
        setPage(1);
    }, [sortConfig, paginateData]);
    
    // Função para acessar o PDF de uma nota
    const handleAccessPDF = useCallback(async (nota: NotaFiscal) => {
        try {
            const token = getAuthToken();
            
                const response = await axios.get(`${API_URL}/pdf/${nota.id}`, {
                    responseType: 'blob',
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                    }
                });
                
                // Criar URL para download
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `nota-fiscal-${nota.id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
        } catch (error) {
            toast.error('Erro ao baixar o PDF da nota fiscal');
        }
    }, [getAuthToken]);
    
    // Função para reprocessar uma nota
    const handleCorrectNota = useCallback(async (nota: NotaFiscal, motivo: string) => {
        try {
            const token = getAuthToken();
            const headers = {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            };
            
            await axios.post(`${API_URL}/corrigir/${nota.id}`, 
                { motivo },
                { headers }
            );
            
            toast.success(`Nota fiscal ${nota.numero_nf} enviada para reprocessamento.`);
            
            // Recarregar as notas
            await filterNotas({
                status: getStatusParam(activeFilter),
                fornecedor: searchTerm || undefined,
            });
            
            return true;
        } catch (error) {
            toast.error(`Erro ao reprocessar a nota fiscal ${nota.numero_nf}.`);
            return false;
        }
    }, [getAuthToken, filterNotas, activeFilter, searchTerm]);
    
    return {
        notas,
        loading,
        error,
        page,
        totalPages,
        counters,
        searchTerm,
        activeFilter,
        sorting: sortConfig,
        filterNotas,
        handleFilterChange,
        handleSearch,
        handlePageChange,
        handleSort,
        handleAccessPDF,
        handleCorrectNota,
        setLoading,
    }
} 