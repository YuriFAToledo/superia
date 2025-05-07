import { Button } from "@/components/ui/button"
import { NotaFiscal } from "./types"

type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "link"
type ButtonSize = "default" | "sm" | "lg" | "icon"

interface ActionButtonProps {
    label: string
    onClick: (nota: NotaFiscal) => void
    variant?: ButtonVariant
    disabled?: boolean
    className?: string
    size?: ButtonSize
    nota: NotaFiscal
}

function ActionButton({
    label,
    onClick,
    variant = "default",
    disabled = false,
    className = "",
    size = "default",
    nota
}: ActionButtonProps) {
    return (
        <Button
            variant={variant}
            size={size}
            onClick={() => onClick(nota)}
            disabled={disabled}
            className={className}
        >
            {label}
        </Button>
    )
}

export interface NotaActionConfig {
    label: string
    onClick: (nota: NotaFiscal) => void
    variant?: ButtonVariant
    disabled?: boolean
    className?: string
}

interface NotaActionsProps {
    nota: NotaFiscal
    actions: {
        primaryAction?: NotaActionConfig,
        secondaryAction?: NotaActionConfig
    }
    className?: string
    size?: ButtonSize
}

export function NotaActions({ 
    nota, 
    actions, 
    className = "", 
    size = "default" 
}: NotaActionsProps) {
    const { primaryAction, secondaryAction } = actions
    
    if (!primaryAction && !secondaryAction) {
        return null;
    }
    
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {primaryAction && (
                <ActionButton
                    label={primaryAction.label}
                    onClick={primaryAction.onClick}
                    variant={primaryAction.variant || "outline"}
                    disabled={primaryAction.disabled}
                    className={primaryAction.className}
                    size={size}
                    nota={nota}
                />
            )}
            
            {secondaryAction && (
                <ActionButton
                    label={secondaryAction.label}
                    onClick={secondaryAction.onClick}
                    variant={secondaryAction.variant || "default"}
                    disabled={secondaryAction.disabled}
                    className={secondaryAction.className}
                    size={size}
                    nota={nota}
                />
            )}
        </div>
    )
}