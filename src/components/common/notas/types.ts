export type NotaStatus = "pendente" | "em_processamento"
export type NotaStatusHistory = "aprovado" | "reprovado"

export type StatusConfig = {
    [K in NotaStatus | NotaStatusHistory]: {
        label: string
        class: "bg-pendente" | "bg-processando" | "bg-recusado" | "bg-aprovado"
    }
}

export type NotaFiscal = {
    id: string
    dataEmissao: string
    fornecedor: string
    numero: string
    valor: string
    status: NotaStatus | NotaStatusHistory
    motivo: string
}

export type ButtonAction = {
    label: string
    onClick: (nota: NotaFiscal) => void
    variant?: "default" | "outline" | "secondary" | "ghost" | "link"
    disabled?: boolean
    className?: string
}

export const statusConfig: StatusConfig = {
    pendente: { label: "Pendente", class: "bg-pendente" },
    em_processamento: { label: "Em processamento", class: "bg-processando" },
    aprovado: { label: "Aprovado", class: "bg-aprovado" },
    reprovado: { label: "Recusado", class: "bg-recusado" }
}