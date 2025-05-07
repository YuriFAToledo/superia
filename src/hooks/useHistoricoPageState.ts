import { useState } from "react";
import { useHistoricoNotas } from "./useHistoricoNotas";

/**
 * Hook para gerenciar o estado da página de histórico de notas fiscais
 * Centraliza a lógica de busca e gerenciamento de estado
 */
export function useHistoricoPageState() {
    // Estado para termo de busca
    const [inputSearchTerm, setInputSearchTerm] = useState("");
    
    // Consumir o hook de histórico
    const {
        searchTerm: hookSearchTerm,
        handleSearch: hookHandleSearch,
        fetchNotas,
        setUseMockData,
        ...historicoData
    } = useHistoricoNotas({
        limit: 8 // 8 itens por página para o histórico
    });
    
    // Função para lidar com a pesquisa no input
    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setInputSearchTerm(term);
        hookHandleSearch(term);
    };
    
    return {
        searchTerm: inputSearchTerm,
        handleSearch: handleSearchInput,
        fetchNotas,
        setUseMockData,
        ...historicoData
    };
} 