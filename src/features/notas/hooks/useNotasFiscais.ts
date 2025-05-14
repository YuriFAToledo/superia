import { useCallback, useState, useEffect, useRef } from 'react'
import { NotaFiscal, NotasParams, NotaStatusEnum } from '../types'
import axios, { CancelTokenSource } from 'axios'
import { useAuth } from '@/features/auth/hooks/useAuth'

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
    const [allNotas, setAllNotas] = useState<NotaFiscal[]>([]);
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
    
    // Referência para o token de cancelamento da última requisição
    const cancelTokenRef = useRef<CancelTokenSource | null>(null);
    
    // Obter o token de autenticação
    const { getAuthToken } = useAuth();

    // Função para buscar contadores do dashboard
    const fetchCounters = useCallback(async () => {
        try {
            // Obter o token de autenticação
            const token = getAuthToken();
            
            // Configurar headers com o token
            const headers = {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            };
            
            // Construir a URL para contadores
            const url = `${API_URL}/counters`;
            
            // Fazer a chamada à API com os headers de autenticação
            const response = await axios.get(url, { headers });
            
            // Atualizar os contadores
            const data = response.data;
            setCounters({
                pendentes: data.pendentes || 0,
                emProcessamento: data.emProcessamento || 0
            });
            
            return data;
        } catch (error) {
            console.error('Erro ao buscar contadores:', error);
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
            
            // Criar novo token de cancelamento
            cancelTokenRef.current = axios.CancelToken.source();
            
            // Obter o token de autenticação
            const token = getAuthToken();
            
            // Configurar headers com o token
            const headers = {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            };
            
            // Construir a URL com os parâmetros
            let url = API_URL;
            
            // Adicionar parâmetro de status se existir
            if (params.status) {
                if (params.status === NotaStatusEnum.PENDENTE) {
                    url = `${url}?status=pendente`;
                } else if (params.status === NotaStatusEnum.EM_PROCESSAMENTO) {
                    url = `${url}?status=em_processamento`;
                } else {
                    url = `${url}?status=${params.status}`;
                }
            } else {
                url = `${url}`;
            }
            
            // Adicionar outros parâmetros se existirem
            if (params.fornecedor) {
                url = `${url}${url.includes('?') ? '&' : '?'}fornecedor="${params.fornecedor}"`;
            }
            
            if (params.sort) {
                url = `${url}${url.includes('?') ? '&' : '?'}sort=${params.sort}&order=${params.order || 'asc'}`;
            }
            
            // Simular um delay para dar tempo de cancelar se o usuário trocar de filtro rapidamente
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Fazer a chamada à API com os headers de autenticação e token de cancelamento
            const response = await axios.get(url, { 
                headers,
                cancelToken: cancelTokenRef.current.token
            });
            
            // Processar a resposta para o formato esperado
            const responseData = response.data;
            
            // Se a resposta for um array direto
            if (Array.isArray(responseData)) {
                // Verificar se é um array com um objeto vazio (caso de nenhum resultado)
                if (responseData.length === 1 && Object.keys(responseData[0]).length === 0) {
                    console.log('Array com objeto vazio detectado, retornando array vazio');
                    return [];
                }
                return responseData;
            }
            
            // Se a resposta tiver um campo notas, usar esse campo
            if (responseData.notas && Array.isArray(responseData.notas)) {
                // Verificar se é um array com um objeto vazio (caso de nenhum resultado)
                if (responseData.notas.length === 1 && Object.keys(responseData.notas[0]).length === 0) {
                    console.log('Array com objeto vazio detectado em notas, retornando array vazio');
                    return [];
                }
                return responseData.notas;
            }
            
            console.warn('Formato de resposta inesperado:', responseData);
            return [];
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Requisição cancelada:', error.message);
                return [];
            }
            console.error('Erro ao buscar notas fiscais:', error);
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
        // Definir o estado de carregamento antes de iniciar a requisição
        setLoading(true);
        setError(null);
        
        try {
            // Buscar todos os dados da API
            const notasData = await fetchNotasFromAPI(params);
            
            console.log('Dados recebidos da API:', notasData);
            
            // Verificar se os dados estão no formato esperado
            if (Array.isArray(notasData)) {
                // Tratar caso de array vazio ou com objeto vazio
                if (notasData.length === 0 || (notasData.length === 1 && Object.keys(notasData[0]).length === 0)) {
                    console.log('Array vazio ou com objeto vazio - exibindo lista vazia');
                    setAllNotas([]);
                    setNotas([]);
                    setPage(1);
                    setTotalPages(1);
                } else {
                    // Guardar todos os dados
                    setAllNotas(notasData);
                    
                    // Calcular total de páginas
                    const total = notasData.length;
                    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
                    setTotalPages(totalPages || 1);
                    
                    // Definir página atual (garantir que esteja dentro dos limites)
                    const newPage = params.page || 1;
                    const validPage = Math.min(Math.max(1, newPage), totalPages || 1);
                    setPage(validPage);
                    
                    // Aplicar paginação e atualizar estado
                    const paginatedData = paginateData(notasData, validPage);
                    setNotas(paginatedData);
                }
            } else {
                console.warn('Formato de resposta inesperado:', notasData);
                setAllNotas([]);
                setNotas([]);
                setPage(1);
                setTotalPages(1);
            }
            
            // Atualizar os contadores
            await fetchCounters();
        } catch (err) {
            console.error('Erro ao buscar notas fiscais:', err);
            setError('Erro ao buscar notas fiscais');
            setAllNotas([]);
            setNotas([]);
        } finally {
            // Garantir que o estado de carregamento seja atualizado apenas quando todas as operações terminarem
            setTimeout(() => {
                setLoading(false);
            }, 700);
        }
    }, [fetchNotasFromAPI, fetchCounters, paginateData]);

    // Efeito para carregar as notas iniciais
    useEffect(() => {
        // Determinar o status inicial
        let initialStatus = initialParams.status;
        
        filterNotas({
            status: initialStatus,
            limit: initialParams.limit || 7
        });
        
        // Limpar token de cancelamento ao desmontar
        return () => {
            if (cancelTokenRef.current) {
                cancelTokenRef.current.cancel('Componente desmontado');
            }
        };
    }, [filterNotas, initialParams.limit, initialParams.status]);
    
    // Função para lidar com a mudança de filtro
    const handleFilterChange = useCallback((filter: string | null) => {
        setActiveFilter(filter);
        
        // Determinar o valor do status para a URL
        let statusParam: NotaStatusEnum | undefined = undefined;
        if (filter === 'pendente') {
            statusParam = NotaStatusEnum.PENDENTE;
        } else if (filter === 'em_processamento') {
            statusParam = NotaStatusEnum.EM_PROCESSAMENTO;
        }
        
        filterNotas({
            status: statusParam,
            page: 1,
            fornecedor: searchTerm || undefined,
            limit: initialParams.limit || 7
        });
    }, [filterNotas, searchTerm, initialParams.limit]);
    
    // Função para lidar com a busca
    const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        // Determinar o status correto para a URL
        let statusParam: NotaStatusEnum | undefined = undefined;
        if (activeFilter === 'pendente') {
            statusParam = NotaStatusEnum.PENDENTE;
        } else if (activeFilter === 'em_processamento') {
            statusParam = NotaStatusEnum.EM_PROCESSAMENTO;
        }
        
        filterNotas({
            status: statusParam,
            page: 1,
            fornecedor: term || undefined,
            limit: initialParams.limit || 7
        });
    }, [filterNotas, activeFilter, initialParams.limit]);
    
    // Função para lidar com mudança de página
    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        
        // Aplicar paginação nos dados existentes
        const paginatedData = paginateData(allNotas, newPage);
        setNotas(paginatedData);
    }, [allNotas, paginateData]);
    
    // Função para ordenar resultados
    const handleSort = useCallback((field: keyof NotaFiscal) => {
        const direction = 
            sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        
        setSortConfig({ field, direction });
        
        // Ordenar os dados localmente
        const sortedData = [...allNotas].sort((a, b) => {
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
        setAllNotas(sortedData);
        
        // Aplicar paginação nos dados ordenados
        const paginatedData = paginateData(sortedData, 1);
        setNotas(paginatedData);
        setPage(1);
    }, [allNotas, sortConfig, paginateData]);
    
    // Função para acessar o PDF de uma nota
    const handleAccessPDF = useCallback(async (nota: NotaFiscal) => {
        try {
            // Obter o token de autenticação
            const token = getAuthToken();
            
            // Verificar se temos o caminho do PDF
            if (nota && nota.pdf_path) {
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
            } else {
                alert('PDF não disponível para esta nota fiscal');
            }
        } catch (error) {
            console.error('Erro ao baixar PDF:', error);
            alert('Erro ao baixar o PDF da nota fiscal');
        }
    }, [getAuthToken]);
    
    // Função para corrigir uma nota
    const handleCorrectNota = useCallback(async (nota: NotaFiscal, motivo: string) => {
        try {
            // Obter o token de autenticação
            const token = getAuthToken();
            
            // Configurar headers com o token
            const headers = {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            };
            
            // Enviar requisição para corrigir a nota
            await axios.post(`${API_URL}/corrigir/${nota.id}`, 
                { motivo },
                { headers }
            );
            
            // Determinar o status correto para a URL
            let statusParam: NotaStatusEnum | undefined = undefined;
            if (activeFilter === 'pendente') {
                statusParam = NotaStatusEnum.PENDENTE;
            } else if (activeFilter === 'em_processamento') {
                statusParam = NotaStatusEnum.EM_PROCESSAMENTO;
            }
            
            // Recarregar as notas para refletir as mudanças
            await filterNotas({
                status: statusParam,
                fornecedor: searchTerm || undefined,
            });
            
            return true;
        } catch (error) {
            console.error('Erro ao corrigir nota fiscal:', error);
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