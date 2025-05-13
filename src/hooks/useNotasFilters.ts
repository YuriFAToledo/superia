import { useCallback, useState, useEffect } from 'react';
import { useNotas, setUseMockData } from './useNotas';
import { NotasParams } from '@/api/notas-service';
import { NotaFiscal } from '@/components/common/notas/types';

/**
 * Interface que estende NotasParams para incluir parâmetros adicionais do filtro
 */
interface NotasFiltersParams extends NotasParams {
    initialFilter?: string | null;
    initialSearchTerm?: string;
}

/**
 * Hook especializado para gerenciar os filtros de notas fiscais
 * Reutiliza o hook useNotas adicionando funcionalidades específicas para os filtros
 */
export function useNotasFilters(initialParams: NotasFiltersParams = {}) {
    // Estados para filtros
    const [activeFilter, setActiveFilter] = useState<string | null>(initialParams.initialFilter || null);
    const [searchTerm, setSearchTerm] = useState(initialParams.initialSearchTerm || '');
    
    // Garantir que estamos usando dados mockados
    setUseMockData(true);
    
    // Integração com o hook base
    const notasHook = useNotas({
        ...initialParams,
        limit: initialParams.limit || 7, // 7 itens por página para notas
        status: activeFilter || undefined, // Passar o filtro inicial para o hook base
    });
    
    // Função para alterar o filtro (Todas, Pendentes, Em Processamento)
    const handleFilterChange = useCallback((filter: string | null) => {
        setActiveFilter(filter);
        
        // Preparar os parâmetros de busca com base no filtro selecionado
        const params: NotasParams = {
            page: 1, // Voltar para primeira página ao mudar filtro
            fornecedor: searchTerm || undefined,
        };
        
        // Adicionar filtro de status se necessário
        if (filter === 'pendente') {
            params.status = 'pendente';
        } else if (filter === 'em_processamento') {
            params.status = 'em_processamento';
        }
        
        // Log para depuração
        console.log('Filtrando por:', filter, 'Parâmetros:', params);
        
        // Ativar loading enquanto busca
        notasHook.setLoading(true);
        
        // Simular atraso para UX de loading (remover em produção)
        setTimeout(() => {
            notasHook.fetchNotas(params);
        }, 800);
    }, [notasHook, searchTerm]);
    
    // Função para realizar busca por termo
    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        
        // Preparar parâmetros de busca
        const params: NotasParams = {
            page: 1, // Voltar para primeira página ao buscar
            fornecedor: term || undefined,
        };
        
        // Manter o filtro de status se estiver ativo
        if (activeFilter === 'pendente') {
            params.status = 'pendente';
        } else if (activeFilter === 'em_processamento') {
            params.status = 'em_processamento';
        }
        
        // Ativar loading enquanto busca
        notasHook.setLoading(true);
        
        // Simular atraso para UX de loading (remover em produção)
        setTimeout(() => {
            notasHook.fetchNotas(params);
        }, 800);
    }, [notasHook, activeFilter]);
    
    // Função para mudar de página mantendo os filtros
    const handlePageChange = useCallback((page: number) => {
        // Ativar loading
        notasHook.setLoading(true);
        
        // Preparar parâmetros de busca
        const params: NotasParams = {
            page,
            fornecedor: searchTerm || undefined,
        };
        
        // Manter o filtro de status se estiver ativo
        if (activeFilter === 'pendente') {
            params.status = 'pendente';
        } else if (activeFilter === 'em_processamento') {
            params.status = 'em_processamento';
        }
        
        // Simular atraso para UX de loading (remover em produção)
        setTimeout(() => {
            notasHook.fetchNotas(params);
        }, 800);
    }, [notasHook, activeFilter, searchTerm]);
    
    // Função para ordenar os resultados
    const handleSort = useCallback((field: keyof NotaFiscal) => {
        // Ativar loading enquanto ordena
        notasHook.setLoading(true);
        
        // Preparar parâmetros de busca mantendo filtros ativos
        const params: NotasParams = {
            page: 1, // Voltar para primeira página ao ordenar
            fornecedor: searchTerm || undefined,
            sort: field as string,
        };
        
        // Manter o filtro de status se estiver ativo
        if (activeFilter === 'pendente') {
            params.status = 'pendente';
        } else if (activeFilter === 'em_processamento') {
            params.status = 'em_processamento';
        }
        
        // Delegar para a função de ordenação do hook base
        notasHook.setSorting(field as keyof NotaFiscal);
    }, [notasHook, activeFilter, searchTerm]);
    
    // Carregar notas iniciais com base nos filtros
    useEffect(() => {
        // Configurar parâmetros iniciais
        const params: NotasParams = {
            ...initialParams,
            page: 1,
            fornecedor: searchTerm || undefined,
        };
        
        // Aplicar filtro inicial se especificado
        if (activeFilter === 'pendente') {
            params.status = 'pendente';
        } else if (activeFilter === 'em_processamento') {
            params.status = 'em_processamento';
        }
        
        // Buscar notas
        notasHook.fetchNotas(params);
    }, []);
    
    return {
        ...notasHook,
        activeFilter,
        searchTerm,
        handleFilterChange,
        handleSearch,
        handlePageChange,
        handleSort,
    };
} 