import { useCallback, useState } from 'react';
import { useNotasFiscais } from './useNotasFiscais';
import { NotasParams } from '../types';

/**
 * Interface que estende NotasParams para incluir parâmetros adicionais do filtro
 */
interface NotasFiltersParams extends NotasParams {
    initialFilter?: string | null;
    initialSearchTerm?: string;
    limit?: number;
}

/**
 * Hook especializado para gerenciar os filtros de notas fiscais
 * Reutiliza o hook useNotasFiscais adicionando funcionalidades específicas para os filtros
 */
export function useNotasFilters(initialParams: NotasFiltersParams = {}) {
    // Estados para filtros
    const [activeFilter, setActiveFilter] = useState<string | null>(initialParams.initialFilter || null);
    const [searchTerm, setSearchTerm] = useState(initialParams.initialSearchTerm || '');
    
    // Integração com o hook base
    const notasHook = useNotasFiscais({
        ...initialParams,
        limit: initialParams.limit || 7, // 7 itens por página para notas
        status: activeFilter || undefined, // Passar o filtro inicial para o hook base
    });
    
    // Função para alterar o filtro (Todas, Pendentes, Em Processamento)
    const handleFilterChange = useCallback((filter: string | null) => {
        setActiveFilter(filter);
        
        // Ativar loading enquanto busca
        notasHook.setLoading(true);
        
        // Determinar o valor do status para a URL
        let statusParam = '';
        if (filter === 'pendente') {
            statusParam = 'pendente';
        } else if (filter === 'em_processamento') {
            statusParam = 'em_processamento';
        }
        
        // Simular atraso para UX de loading (remover em produção)
        setTimeout(() => {
            notasHook.filterNotas({
                status: statusParam,
                page: 1,
                fornecedor: searchTerm || undefined,
            });
        }, 300);
    }, [notasHook, searchTerm]);
    
    // Função para realizar busca por termo
    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        
        // Ativar loading enquanto busca
        notasHook.setLoading(true);
        
        // Determinar o status correto para a URL
        let statusParam = '';
        if (activeFilter === 'pendente') {
            statusParam = 'pendente';
        } else if (activeFilter === 'em_processamento') {
            statusParam = 'em_processamento';
        }
        
        // Simular atraso para UX de loading (remover em produção)
        setTimeout(() => {
            notasHook.filterNotas({
                status: statusParam,
                page: 1,
                fornecedor: term || undefined,
            });
        }, 300);
    }, [notasHook, activeFilter]);
    
    return {
        ...notasHook,
        activeFilter,
        searchTerm,
        handleFilterChange,
        handleSearch,
    };
} 