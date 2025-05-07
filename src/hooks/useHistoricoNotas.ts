import { useNotas, setUseMockData } from './useNotas'
import { NotasParams } from '@/api/notas-service'
import { useCallback, useState, useEffect } from 'react'

/**
 * Hook especializado para gerenciar o histórico de notas fiscais
 * Reutiliza o hook useNotas com parâmetros específicos para o histórico
 */
export function useHistoricoNotas(initialParams: NotasParams = {}) {
    // Estado para termo de busca
    const [searchTerm, setSearchTerm] = useState('')
    
    // Garantir que estamos usando dados mockados para desenvolvimento
    setUseMockData(true);
    
    // Consumir o hook base com parâmetros para histórico
    const notasHook = useNotas({
        ...initialParams,
        status: 'aprovado',
        limit: initialParams.limit || 8, // 8 itens por página para o histórico
    })
    
    // Efeito para forçar a busca inicial com status aprovado
    useEffect(() => {
        notasHook.fetchNotas({
            status: 'aprovado',
            limit: initialParams.limit || 8
        });
    }, []);
    
    // Função de busca específica para o histórico
    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term)
        
        // Se o termo estiver vazio, apenas reseta os filtros
        if (!term.trim()) {
            notasHook.fetchNotas({
                status: 'aprovado',
                page: 1,
            })
            return
        }
        
        // Caso contrário, busca por fornecedor
        notasHook.fetchNotas({
            status: 'aprovado',
            fornecedor: term,
            page: 1, // Volta para primeira página ao buscar
        })
    }, [notasHook])
    
    // Função para lidar com mudança de página
    const handlePageChange = useCallback((page: number) => {
        // Ativar loading
        notasHook.setLoading(true);
        
        // Simular atraso para demonstrar loading
        setTimeout(() => {
            notasHook.fetchNotas({
                status: 'aprovado',
                page,
                fornecedor: searchTerm || undefined,
            });
        }, 800);
    }, [notasHook, searchTerm])
    
    // Função para ordenar resultados
    const handleSort = useCallback((field: string) => {
        notasHook.fetchNotas({
            status: 'aprovado',
            sort: field,
            page: 1
        });
    }, [notasHook])
    
    return {
        ...notasHook,
        searchTerm,
        handleSearch,
        handlePageChange,
        handleSort,
    }
}