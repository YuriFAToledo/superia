import { useCallback, useState, useEffect } from 'react';
import { useNotasFiscais } from './useNotasFiscais';
import { NotasParams, NotaStatusEnum } from '../types';

/**
 * Interface que estende NotasParams para incluir parâmetros adicionais do filtro
 */
interface NotasFiltersParams extends NotasParams {
    initialFilter?: NotaStatusEnum | null;
    initialSearchTerm?: string;
    limit?: number;
}

/**
 * Hook especializado para gerenciar os filtros de notas fiscais
 * Reutiliza o hook useNotasFiscais adicionando funcionalidades específicas para os filtros
 */
export function useNotasFilters(initialParams: NotasFiltersParams = {}) {
    // Estados para filtros
    const [activeFilter, setActiveFilter] = useState<NotaStatusEnum | null>(
        initialParams.initialFilter || null
    );
    const [searchTerm, setSearchTerm] = useState(
        initialParams.initialSearchTerm || ''
    );
    
    // Integração com o hook base
    const notasHook = useNotasFiscais({
        ...initialParams,
        limit: initialParams.limit || 7, // 7 itens por página para notas
        status: activeFilter || undefined, // Passar o filtro inicial para o hook base
    });
    
    // Função para alterar o filtro (Todas, Pendentes, Em Processamento)
    const handleFilterChange = useCallback((filter: NotaStatusEnum | null) => {
        setActiveFilter(filter);
        
        // Ativar loading enquanto busca
        notasHook.setLoading(true);
        
        // Determinar o valor do status para a URL
        let statusParam = undefined;
        if (filter === NotaStatusEnum.PENDENTE) {
            statusParam = NotaStatusEnum.PENDENTE;
        } else if (filter === NotaStatusEnum.EM_PROCESSAMENTO) {
            statusParam = NotaStatusEnum.EM_PROCESSAMENTO;
        }
        
        // A chamada ao filterNotas já tem um atraso interno de 300ms
        notasHook.filterNotas({
            status: statusParam,
            page: 1,
            fornecedor: searchTerm || undefined,
        });
    }, [notasHook, searchTerm]);
    
    // Função para realizar busca por termo
    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        
        // Ativar loading enquanto busca
        notasHook.setLoading(true);
        
        // Determinar o status correto para a URL
        let statusParam = undefined;
        if (activeFilter === NotaStatusEnum.PENDENTE) {
            statusParam = NotaStatusEnum.PENDENTE;
        } else if (activeFilter === NotaStatusEnum.EM_PROCESSAMENTO) {
            statusParam = NotaStatusEnum.EM_PROCESSAMENTO;
        }
        
        // A chamada ao filterNotas já tem um atraso interno de 300ms
        notasHook.filterNotas({
            status: statusParam,
            page: 1,
            fornecedor: term || undefined,
        });
    }, [notasHook, activeFilter]);
    
    // Carregar dados com o filtro e busca iniciais quando o componente montar
    useEffect(() => {
        // Determinar o valor do status para a URL
        let statusParam = undefined;
        if (activeFilter === NotaStatusEnum.PENDENTE) {
            statusParam = NotaStatusEnum.PENDENTE;
        } else if (activeFilter === NotaStatusEnum.EM_PROCESSAMENTO) {
            statusParam = NotaStatusEnum.EM_PROCESSAMENTO;
        }
        
        notasHook.filterNotas({
            status: statusParam,
            page: 1,
            fornecedor: searchTerm || undefined,
        });
    }, []);
    
    return {
        ...notasHook,
        activeFilter,
        searchTerm,
        handleFilterChange,
        handleSearch,
    };
} 