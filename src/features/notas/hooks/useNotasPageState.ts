import { useState, useRef } from "react";
import { useNotasFiscais } from './useNotasFiscais';

// Definindo o tipo para o ref da tabela de notas
interface NotasTableRef {
    handleFilterChange: (filter: string | null) => void;
    handleSearch: (term: string) => void;
}

/**
 * Hook para gerenciar o estado da página de notas fiscais
 * Centraliza a lógica de filtros, busca e refs usando o hook useNotasFiscais
 */
export function useNotasPageState() {
    // Usar o hook especializado para notas fiscais
    const notasFiscais = useNotasFiscais();
    
    // Referência para a tabela de notas
    const tableRef = useRef<NotasTableRef>(null);
    
    // Função para lidar com a mudança de filtro
    const handleFilterChange = (filter: string | null) => {
        // Atualizar o filtro no hook principal
        notasFiscais.handleFilterChange(filter);
        
        // Atualizar o filtro na tabela se o ref estiver disponível
        if (tableRef.current) {
            tableRef.current.handleFilterChange(filter);
        }
    };
    
    // Função para lidar com a pesquisa
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Atualizar a pesquisa no hook principal
        notasFiscais.handleSearch(e);
        
        // Atualizar a pesquisa na tabela se o ref estiver disponível
        if (tableRef.current) {
            tableRef.current.handleSearch(e.target.value);
        }
    };
    
    return {
        ...notasFiscais,
        tableRef,
        handleFilterChange,
        handleSearch
    };
} 