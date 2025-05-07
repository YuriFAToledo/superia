'use client'
import { NotaFiscal, statusConfig } from "./types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface LoadingStateProps {
    className?: string;
}

function LoadingState({ className = "flex justify-center items-center h-60" }: LoadingStateProps) {
    return (
        <div className={className}>
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
    );
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
    );
}

interface EmptyStateProps {
    message?: string;
    className?: string;
}

function EmptyState({ 
    message = "Nenhuma nota encontrada.", 
    className = "flex justify-center items-center h-60 text-gray-500" 
}: EmptyStateProps) {
    return (
        <div className={className}>
            <p>{message}</p>
        </div>
    );
}

interface NotaCardInfoItemProps {
    label: string;
    value: string;
}

function NotaCardInfoItem({ label, value }: NotaCardInfoItemProps) {
    return (
        <div>
            <p className="text-gray-500">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}

interface NotaCardProps {
    nota: NotaFiscal;
    onAccessPDF: (nota: NotaFiscal) => void;
    onAction: (nota: NotaFiscal) => void;
    actionLabel: string;
}

function NotaCard({ nota, onAccessPDF, onAction, actionLabel }: NotaCardProps) {
    return (
        <Card key={nota.id} className="overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{nota.fornecedor}</CardTitle>
                    <Badge className={statusConfig[nota.status].class as any}>
                        {statusConfig[nota.status].label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <NotaCardInfoItem label="Número da Nota" value={nota.numero} />
                    <NotaCardInfoItem label="Valor" value={nota.valor} />
                    <NotaCardInfoItem label="Data da Nota" value={nota.dataEmissao} />
                    <NotaCardInfoItem label="Fornecedor" value={nota.fornecedor} />     
                </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-0">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onAccessPDF(nota)}
                >
                    Acessar PDF
                </Button>
                <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onAction(nota)}
                >
                    {actionLabel}
                </Button>
            </CardFooter>
        </Card>
    );
}

interface NotasGridProps {
    notas: NotaFiscal[];
    loading: boolean;
    error: Error | null;
    onAccessPDF: (nota: NotaFiscal) => void;
    onAction: (nota: NotaFiscal) => void;
    actionLabel: string;
}

export function NotasGrid({
    notas,
    loading,
    error,
    onAccessPDF,
    onAction,
    actionLabel
}: NotasGridProps) {
    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState />;
    }

    if (notas.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notas.map((nota) => (
                <NotaCard 
                    key={nota.id}
                    nota={nota}
                    onAccessPDF={onAccessPDF}
                    onAction={onAction}
                    actionLabel={actionLabel}
                />
            ))}
        </div>
    );
} 