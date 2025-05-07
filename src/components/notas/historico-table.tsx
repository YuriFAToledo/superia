'use client'
import { NotaFiscal, NotaStatusHistory } from "./types"
import { BaseNotasTable, SortConfig } from "./base-table"
import { NotasPagination } from "./notas-pagination"
import { NotaActionConfig } from "./nota-actions"
import { ReactNode } from "react"
import { useHistoricoNotas } from "@/hooks/useHistoricoNotas"

interface ActionHandlersProps {
    getNotaPDF: (id: string) => void;
    getNotaXML: (id: string) => void;
}

function useActionHandlers({ getNotaPDF, getNotaXML }: ActionHandlersProps) {
    // Handler para acessar PDF
    const handleAccessPDF = (nota: NotaFiscal) => {
        getNotaPDF(nota.id);
    };

    // Handler para exportar XML
    const handleExportXML = (nota: NotaFiscal) => {
        getNotaXML(nota.id);
    };

    return {
        handleAccessPDF,
        handleExportXML
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

interface TableActionsCreatorProps {
    handleAccessPDF: (nota: NotaFiscal) => void;
}

function useTableActions({ handleAccessPDF }: TableActionsCreatorProps) {
    // Configurar ação primária
    const primaryAction: NotaActionConfig = {
        label: "Ver PDF",
        onClick: handleAccessPDF,
        variant: "outline",
        className: "text-secondary border-secondary hover:bg-secondary hover:text-white"
    };
    
    return {
        primaryAction
    };
}

export function HistoricoTable() {
    // Usar o hook de histórico de notas
    const {
        notas,
        loading,
        error,
        page,
        totalPages,
        handlePageChange,
        sorting,
        handleSort,
        getNotaPDF,
        getNotaXML
    } = useHistoricoNotas();

    // Log para debug
    console.log('HistoricoTable - Notas recebidas:', notas.length);

    // Usar os hooks customizados
    const { handleAccessPDF, handleExportXML } = useActionHandlers({ 
        getNotaPDF, 
        getNotaXML 
    });
    
    const renderPagination = usePaginationRenderer({
        loading,
        error,
        page,
        totalPages,
        onPageChange: handlePageChange
    });
    
    const { primaryAction } = useTableActions({
        handleAccessPDF
    });

    // Handler para ordenação
    const onSort = (key: keyof NotaFiscal) => {
        console.log('Ordenando por:', key);
        handleSort(key as string);
    };

    return (
        <BaseNotasTable
            notas={notas}
            loading={loading}
            error={error}
            sorting={sorting}
            onSort={onSort}
            primaryAction={primaryAction}
            renderPagination={renderPagination}
        />
    );
}