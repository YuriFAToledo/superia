import { useState, useRef } from "react";

// Definindo o tipo para o ref da tabela de notas
interface NotasTableRef {
    handleFilterChange: (filter: string | null) => void;
    handleSearch: (term: string) => void;
}

/**
 * Hook para gerenciar o estado da página de notas fiscais
 * Centraliza a lógica de filtros, busca e refs
 */
export function useNotasPageState() {
    // Estados para filtros e busca
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Referência para a tabela de notas
    const tableRef = useRef<NotasTableRef>(null);
    
    // Função para lidar com a mudança de filtro
    const handleFilterChange = (filter: string | null) => {
        console.log('NotasFiscais - Mudando filtro para:', filter);
        setActiveFilter(filter);
        
        // Atualizar o filtro na tabela se o ref estiver disponível
        if (tableRef.current) {
            console.log('NotasFiscais - Propagando filtro para a tabela');
            tableRef.current.handleFilterChange(filter);
        } else {
            console.log('NotasFiscais - tableRef não está disponível');
        }
    };
    
    // Função para lidar com a pesquisa
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        console.log('NotasFiscais - Mudando busca para:', term);
        setSearchTerm(term);
        
        // Atualizar a pesquisa na tabela se o ref estiver disponível
        if (tableRef.current) {
            console.log('NotasFiscais - Propagando busca para a tabela');
            tableRef.current.handleSearch(term);
        } else {
            console.log('NotasFiscais - tableRef não está disponível');
        }
    };
    
    return {
        activeFilter,
        searchTerm,
        tableRef,
        handleFilterChange,
        handleSearch
    };
} 