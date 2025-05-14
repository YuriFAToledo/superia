import { NotaFiscal as BaseNotaFiscal, NotaStatus } from '@/features/notas/types';

/**
 * Exporte os tipos da feature de notas para uso na feature de histórico
 */
export type { NotaStatus, SortConfig, NotaActionConfig, NotasParams } from '@/features/notas/types';

/**
 * Define o histórico de status de uma nota fiscal
 */
export type NotaStatusHistory = {
    status: NotaStatus;
    data: string;
    usuario: string;
    motivo?: string;
};

/**
 * Define uma nota fiscal com histórico para uso na feature de histórico
 */
export interface NotaFiscal extends BaseNotaFiscal {
    historico?: NotaStatusHistory[];
    dataAprovacao?: string;
    usuarioAprovador?: string;
} 