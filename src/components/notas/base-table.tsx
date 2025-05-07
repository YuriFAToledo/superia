'use client'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { NotaActions } from "./nota-actions"
import { NotaFiscal, statusConfig } from "./types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { ReactNode } from "react"
import { NotaActionConfig } from "./nota-actions"

type SortField = keyof NotaFiscal;

export interface SortConfig {
    field: SortField | null;
    direction: 'asc' | 'desc';
}

interface TableHeadSortableProps {
    field: SortField;
    label: string;
    currentSort: SortConfig;
    onSort: (key: SortField) => void;
    className?: string;
}

function TableHeadSortable({
    field,
    label,
    currentSort,
    onSort,
    className = "py-4 px-6 text-sm font-medium text-gray-600 cursor-pointer"
}: TableHeadSortableProps) {
    const getSortIndicator = (key: SortField, sorting: SortConfig) => {
        if (sorting.field === key) {
            return sorting.direction === 'asc' ? ' ↑' : ' ↓'
        }
        return ''
    }

    return (
        <TableHead 
            onClick={() => onSort(field)} 
            className={className}
        >
            {label}{getSortIndicator(field, currentSort)}
        </TableHead>
    )
}

interface LoadingStateProps {
    className?: string;
}

function LoadingState({ className = "flex justify-center items-center h-60" }: LoadingStateProps) {
    return (
        <div className={className}>
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
    )
}

interface ErrorStateProps {
    message?: string;
    className?: string;
}

function ErrorState({ 
    message = "Erro ao carregar dados. Por favor, tente novamente.", 
    className = "flex justify-center items-center h-60 text-red-500" 
}: ErrorStateProps) {
    return (
        <div className={className}>
            <p>{message}</p>
        </div>
    )
}

interface EmptyStateProps {
    message?: string;
    colSpan: number;
}

function EmptyState({ 
    message = "Nenhuma nota encontrada.", 
    colSpan 
}: EmptyStateProps) {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className="text-center py-10 text-gray-500">
                {message}
            </TableCell>
        </TableRow>
    )
}

interface NotaTableRowProps {
    nota: NotaFiscal;
    primaryAction?: NotaActionConfig;
    secondaryAction?: NotaActionConfig;
    actionsSize?: "default" | "sm" | "lg" | "icon";
}

function NotaTableRow({
    nota,
    primaryAction,
    secondaryAction,
    actionsSize = "default"
}: NotaTableRowProps) {
    return (
        <TableRow key={nota.id} className="border-b border-gray-100 hover:bg-gray-50">
            <TableCell className="py-4 px-6 text-sm">{nota.dataEmissao}</TableCell>
            <TableCell className="py-4 px-6 text-sm">{nota.fornecedor}</TableCell>
            <TableCell className="py-4 px-6 text-sm">{nota.numero}</TableCell>
            <TableCell className="py-4 px-6 text-sm">{nota.valor}</TableCell>
            <TableCell className="py-4 px-6">
                <Badge className={statusConfig[nota.status].class as any}>
                    {statusConfig[nota.status].label}
                </Badge>
            </TableCell>
            <TableCell className="py-4 px-6 text-sm">{nota.motivo}</TableCell>
            <TableCell className="py-4 px-6">
                <NotaActions 
                    nota={nota}
                    actions={{
                        primaryAction: primaryAction,
                        secondaryAction: secondaryAction
                    }}
                    size={actionsSize}
                />
            </TableCell>
        </TableRow>
    )
}

export interface BaseTableProps {
    notas: NotaFiscal[];
    loading: boolean;
    error: Error | null;
    sorting: SortConfig;
    onSort: (key: SortField) => void;
    primaryAction?: NotaActionConfig;
    secondaryAction?: NotaActionConfig;
    renderPagination?: () => ReactNode;
    maxHeight?: string;
    actionsSize?: "default" | "sm" | "lg" | "icon";
}

export function BaseNotasTable({
    notas,
    loading,
    error,
    sorting,
    onSort,
    primaryAction,
    secondaryAction,
    renderPagination,
    maxHeight = "calc(100vh-330px)",
    actionsSize = "default"
}: BaseTableProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="rounded-md border bg-white border-none flex-1 overflow-hidden flex flex-col">
                <ScrollArea className={`flex-1 h-[${maxHeight}]`}>
                    {loading ? (
                        <LoadingState />
                    ) : error ? (
                        <ErrorState />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-gray-100">
                                    <TableHeadSortable 
                                        field="dataEmissao" 
                                        label="Data de Emissão" 
                                        currentSort={sorting} 
                                        onSort={onSort} 
                                    />
                                    <TableHeadSortable 
                                        field="fornecedor" 
                                        label="Fornecedor" 
                                        currentSort={sorting} 
                                        onSort={onSort} 
                                    />
                                    <TableHeadSortable 
                                        field="numero" 
                                        label="Número da Nota" 
                                        currentSort={sorting} 
                                        onSort={onSort} 
                                    />
                                    <TableHeadSortable 
                                        field="valor" 
                                        label="Valor" 
                                        currentSort={sorting} 
                                        onSort={onSort} 
                                    />
                                    <TableHeadSortable 
                                        field="status" 
                                        label="Status" 
                                        currentSort={sorting} 
                                        onSort={onSort} 
                                    />
                                    <TableHeadSortable 
                                        field="status" 
                                        label="Motivo" 
                                        currentSort={sorting} 
                                        onSort={onSort} 
                                    />
                                    <TableHead className="py-4 px-6 text-sm font-medium text-gray-600">
                                        Ações
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notas.length === 0 ? (
                                    <EmptyState colSpan={7} />
                                ) : (
                                    notas.map((nota) => (
                                        <NotaTableRow 
                                            key={nota.id}
                                            nota={nota}
                                            primaryAction={primaryAction}
                                            secondaryAction={secondaryAction}
                                            actionsSize={actionsSize}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </ScrollArea>
                {renderPagination && renderPagination()}
            </div>
        </div>
    )
} 