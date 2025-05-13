'use client'
import { useState, ReactNode, useEffect, forwardRef, useImperativeHandle } from "react"
import { NotaFiscal, NotaStatus } from "./types"
import { BaseNotasTable, SortConfig } from "./base-table"
import { NotaActionConfig } from "./nota-actions"
import { NotasPagination } from "./notas-pagination"
import { useNotasFilters } from "@/hooks/useNotasFilters"

// Dados de exemplo
const mockNotas: NotaFiscal[] = [
    {
        id: "1",
        dataEmissao: "03/03/2025",
        fornecedor: "Empresa LTDA",
        numero: "NF-e nº 123456789",
        valor: "R$ 3.293,29",
        status: "pendente",
        motivo: "Api fora do ar"
    },
    {
        id: "2",
        dataEmissao: "02/03/2025",
        fornecedor: "Distribuidora XYZ",
        numero: "NF-e nº 987654321",
        valor: "R$ 1.567,80",
        status: "em_processamento",
        motivo: "-"
    },
    {
        id: "3",
        dataEmissao: "28/02/2025",
        fornecedor: "Indústria 123",
        numero: "NF-e nº 789123456",
        valor: "R$ 4.123,67",
        status: "pendente",
        motivo: "Cliente não localizado"
    },
    {
        id: "4",
        dataEmissao: "27/02/2025",
        fornecedor: "Atacado & Varejo",
        numero: "NF-e nº 321654987",
        valor: "R$ 1.234,56",
        status: "em_processamento",
        motivo: "-"
    },
    {
        id: "5",
        dataEmissao: "26/02/2025",
        fornecedor: "Comércio Local SA",
        numero: "NF-e nº 789456123",
        valor: "R$ 2.345,67",
        status: "pendente",
        motivo: "Documento inválido"
    },
    {
        id: "6",
        dataEmissao: "25/02/2025",
        fornecedor: "Suprimentos Gerais",
        numero: "NF-e nº 654789321",
        valor: "R$ 5.432,10",
        status: "em_processamento",
        motivo: "-"
    },
    {
        id: "7",
        dataEmissao: "24/02/2025",
        fornecedor: "Transportes Rápidos",
        numero: "NF-e nº 147258369",
        valor: "R$ 3.789,45",
        status: "pendente",
        motivo: "Endereço não encontrado"
    },
    {
        id: "8",
        dataEmissao: "23/02/2025",
        fornecedor: "Equipamentos Industriais",
        numero: "NF-e nº 963258741",
        valor: "R$ 7.890,12",
        status: "em_processamento",
        motivo: "-"
    },
    {
        id: "9",
        dataEmissao: "22/02/2025",
        fornecedor: "Materiais Pesados LTDA",
        numero: "NF-e nº 852741963",
        valor: "R$ 10.234,56",
        status: "pendente",
        motivo: "Dados incompletos"
    },
    {
        id: "10",
        dataEmissao: "21/02/2025",
        fornecedor: "Elétrica & Hidráulica SA",
        numero: "NF-e nº 369852147",
        valor: "R$ 2.987,65",
        status: "em_processamento",
        motivo: "-"
    },
    {
        id: "11",
        dataEmissao: "20/02/2025",
        fornecedor: "Ferramentas Profissionais",
        numero: "NF-e nº 741852963",
        valor: "R$ 6.543,21",
        status: "pendente",
        motivo: "Erro na validação"
    },
    {
        id: "12",
        dataEmissao: "19/02/2025",
        fornecedor: "Produtos Químicos LTDA",
        numero: "NF-e nº 159357486",
        valor: "R$ 8.765,43",
        status: "em_processamento",
        motivo: "-"
    },
    {
        id: "13",
        dataEmissao: "18/02/2025",
        fornecedor: "Alimentos Orgânicos",
        numero: "NF-e nº 258369147",
        valor: "R$ 3.214,76",
        status: "pendente",
        motivo: "Produto não entregue"
    },
    {
        id: "14",
        dataEmissao: "17/02/2025",
        fornecedor: "Tecnologia Avançada",
        numero: "NF-e nº 753951468",
        valor: "R$ 12.345,67",
        status: "em_processamento",
        motivo: "-"
    },
    {
        id: "15",
        dataEmissao: "16/02/2025",
        fornecedor: "Serviços Digitais SA",
        numero: "NF-e nº 654123789",
        valor: "R$ 4.321,09",
        status: "pendente",
        motivo: "Sistema indisponível"
    }
]

interface UseTableSortingProps {
    initialSorting: SortConfig;
    initialData: NotaFiscal[];
}

function useTableSorting({ initialSorting, initialData }: UseTableSortingProps) {
    const [data, setData] = useState<NotaFiscal[]>(initialData);
    const [sorting, setSorting] = useState<SortConfig>(initialSorting);

    const handleSort = (key: keyof NotaFiscal) => {
        const direction = sorting.field === key && sorting.direction === 'asc' ? 'desc' : 'asc';
        const newSorting: SortConfig = { field: key, direction };
        setSorting(newSorting);

        const sortedData = [...data].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        
        setData(sortedData);
    };

    return {
        data,
        setData,
        sorting,
        handleSort
    };
}

interface UseTableActionsProps {
    onPdfAccess: (nota: NotaFiscal) => void;
    onCorrect: (nota: NotaFiscal) => void;
}

function useTableActions({ onPdfAccess, onCorrect }: UseTableActionsProps) {
    const primaryAction: NotaActionConfig = {
        label: "Acessar PDF",
        onClick: onPdfAccess,
        variant: "outline"
    };

    const secondaryAction: NotaActionConfig = {
        label: "Corrigir",
        onClick: onCorrect,
        variant: "default"
    };

    return {
        primaryAction,
        secondaryAction
    };
}

interface PaginationRendererProps {
    loading: boolean;
    error: Error | null;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

function usePaginationRenderer({
    loading,
    error,
    page,
    totalPages,
    onPageChange
}: PaginationRendererProps): () => ReactNode {
    return () => {
        if (!error && totalPages > 0) {
            return (
                <NotasPagination 
                    page={page} 
                    totalPages={totalPages} 
                    onPageChange={onPageChange} 
                    loading={loading}
                />
            );
        }
        return null;
    };
}

interface NotasTableProps {
    initialFilter?: string | null;
    initialSearchTerm?: string;
}

export const NotasTable = forwardRef<
    {
        handleFilterChange: (filter: string | null) => void;
        handleSearch: (term: string) => void;
    },
    NotasTableProps
>(({ initialFilter = null, initialSearchTerm = "" }, ref) => {
    // Log de parâmetros iniciais para depuração
    console.log('NotasTable - Parâmetros iniciais:', { initialFilter, initialSearchTerm });
    
    // Usar o novo hook de filtros de notas
    const {
        notas,
        loading,
        error,
        page,
        totalPages,
        activeFilter,
        searchTerm,
        handleFilterChange,
        handleSearch: handleSearchTerm,
        handlePageChange,
        sorting,
        handleSort
    } = useNotasFilters({
        limit: 7, // 7 itens por página
        initialFilter, // Passar o filtro inicial
        initialSearchTerm, // Passar o termo de busca inicial
    });
    
    // Log após inicialização para depuração
    console.log('NotasTable - Estado após inicialização:', { 
        notas: notas.length, 
        activeFilter, 
        searchTerm 
    });
    
    // Expondo métodos via ref para o componente pai
    useImperativeHandle(ref, () => ({
        handleFilterChange: (filter: string | null) => {
            console.log('NotasTable - Filtro alterado via ref:', filter);
            handleFilterChange(filter);
        },
        handleSearch: (term: string) => {
            console.log('NotasTable - Busca alterada via ref:', term);
            handleSearchTerm(term);
        }
    }));
    
    // Efeito para atualizar quando props mudam
    useEffect(() => {
        console.log('NotasTable - Props mudaram:', { initialFilter, initialSearchTerm, activeFilter, searchTerm });
        
        if (initialFilter !== activeFilter) {
            console.log('NotasTable - Aplicando novo filtro:', initialFilter);
            handleFilterChange(initialFilter);
        }
        if (initialSearchTerm !== searchTerm) {
            console.log('NotasTable - Aplicando nova busca:', initialSearchTerm);
            handleSearchTerm(initialSearchTerm);
        }
    }, [initialFilter, initialSearchTerm, activeFilter, searchTerm, handleFilterChange, handleSearchTerm]);

    // Handlers para ações
    const handleAccessPDF = (nota: NotaFiscal) => {
        console.log('Accessing PDF for nota:', nota.numero);
    };

    const handleCorrect = (nota: NotaFiscal) => {
        console.log('Correcting nota:', nota.numero);
    };

    // Configurar ações
    const { 
        primaryAction, 
        secondaryAction 
    } = useTableActions({
        onPdfAccess: handleAccessPDF,
        onCorrect: handleCorrect
    });

    // Configurar paginação
    const renderPagination = usePaginationRenderer({
        loading,
        error,
        page,
        totalPages,
        onPageChange: handlePageChange
    });

    return (
        <BaseNotasTable
            notas={notas}
            loading={loading}
            error={error}
            sorting={sorting}
            onSort={handleSort}
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
            renderPagination={renderPagination}
        />
    );
});