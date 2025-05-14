import { NotaFiscal, NotasParams, PaginatedResponse } from "../types";

// Número fixo de itens por página
const FIXED_ITEMS_PER_PAGE = 7;

// Dados de exemplo para mock
const mockNotas: NotaFiscal[] = [
    {
        id: "1",
        data_emissao: "03/03/2025",
        cnpj_prestador: "Empresa LTDA",
        numero_nf: 123456789,
        valor_total: 3293.29,
        status: "pendente",
        motivos_pendencia: {
            motivo: "Api fora do ar"
        }
    },
    {
        id: "2",
        data_emissao: "02/03/2025",
        cnpj_prestador: "Distribuidora XYZ",
        numero_nf: 987654321,
        valor_total: 1567.80,
        status: "em_processamento",
        motivos_pendencia: {
            motivo: "-"
        }
    },
    {
        id: "3",
        data_emissao: "28/02/2025",
        cnpj_prestador: "Indústria 123",
        numero_nf: 789123456,
        valor_total: 4123.67,
        status: "pendente",
        motivos_pendencia: {
            motivo: "Cliente não localizado"
        }
    },
    {
        id: "4",
        data_emissao: "27/02/2025",
        cnpj_prestador: "Atacado & Varejo",
        numero_nf: 321654987,
        valor_total: 1234.56,
        status: "em_processamento",
        motivos_pendencia: {
            motivo: "-"
        }
    },
    {
        id: "5",
        data_emissao: "26/02/2025",
        cnpj_prestador: "Comércio Local SA",
        numero_nf: 789456123,
        valor_total: 2345.67,
        status: "pendente",
        motivos_pendencia: {
            motivo: "Documento inválido"
        }
    },
    {
        id: "6",
        data_emissao: "25/02/2025",
        cnpj_prestador: "Suprimentos Gerais",
        numero_nf: 654789321,
        valor_total: 5432.10,
        status: "em_processamento",
        motivos_pendencia: {
            motivo: "-"
        }
    },
    {
        id: "7",
        data_emissao: "24/02/2025",
        cnpj_prestador: "Transportes Rápidos",
        numero_nf: 147258369,
        valor_total: 3789.45,
        status: "pendente",
        motivos_pendencia: {
            motivo: "Endereço não encontrado"
        }
    },
    {
        id: "8",
        data_emissao: "23/02/2025",
        cnpj_prestador: "Equipamentos Industriais",
        numero_nf: 963258741,
        valor_total: 7890.12,
        status: "em_processamento",
        motivos_pendencia: {
            motivo: "-"
        }
    },
    {
        id: "9",
        data_emissao: "22/02/2025",
        cnpj_prestador: "Materiais Pesados LTDA",
        numero_nf: 852741963,
        valor_total: 10234.56,
        status: "pendente",
        motivos_pendencia: {
            motivo: "Dados incompletos"
        }
    },
    {
        id: "10",
        data_emissao: "21/02/2025",
        cnpj_prestador: "Elétrica & Hidráulica SA",
        numero_nf: 369852147,
        valor_total: 2987.65,
        status: "em_processamento",
        motivos_pendencia: {
            motivo: "-"
        }
    },
    {
        id: "11",
        data_emissao: "20/02/2025",
        cnpj_prestador: "Ferramentas Profissionais",
        numero_nf: 741852963,
        valor_total: 6543.21,
        status: "pendente",
        motivos_pendencia: {
            motivo: "Erro na validação"
        }
    },
    {
        id: "12",
        data_emissao: "19/02/2025",
        cnpj_prestador: "Produtos Químicos LTDA",
        numero_nf: 159357486,
        valor_total: 8765.43,
        status: "em_processamento",
        motivos_pendencia: {
            motivo: "-"
        }
    },
    {
        id: "13",
        data_emissao: "18/02/2025",
        cnpj_prestador: "Alimentos Orgânicos",
        numero_nf: 258369147,
        valor_total: 3214.76,
        status: "pendente",
        motivos_pendencia: {
            motivo: "Produto não entregue"
        }
    },
    {
        id: "14",
        data_emissao: "17/02/2025",
        cnpj_prestador: "Tecnologia Avançada",
        numero_nf: 753951468,
        valor_total: 12345.67,
        status: "em_processamento",
        motivos_pendencia: {
            motivo: "-"
        }
    },
    {
        id: "15",
        data_emissao: "16/02/2025",
        cnpj_prestador: "Serviços Digitais SA",
        numero_nf: 654123789,
        valor_total: 4321.09,
        status: "pendente",
        motivos_pendencia: {
            motivo: "Sistema indisponível"
        }
    }
];

// Todos os dados para simulação
const allMockNotas = [...mockNotas];

/**
 * Serviço para gerenciar operações relacionadas a notas fiscais
 */
export const notasService = {
    /**
     * Busca notas fiscais com paginação e filtros
     */
    getNotas: async (params: NotasParams = {}): Promise<PaginatedResponse<NotaFiscal>> => {
        try {
            // Simulação de delay para mostrar loading
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const page = params.page || 1;
            // Sempre utilizar o limite fixo de itens por página
            const limit = FIXED_ITEMS_PER_PAGE;
            
            // Filtrar por status se fornecido
            let filteredData = [...allMockNotas];
            
            if (params.status) {
                filteredData = filteredData.filter(nota => nota.status === params.status);
            }
            
            // Filtrar por fornecedor se fornecido
            if (params.fornecedor) {
                const searchTerm = params.fornecedor.toLowerCase();
                filteredData = filteredData.filter(nota => 
                    nota.cnpj_prestador.toLowerCase().includes(searchTerm)
                );
            }
            
            // Ordenar dados se especificado
            if (params.sort) {
                const key = params.sort as keyof NotaFiscal;
                const direction = params.order === 'desc' ? -1 : 1;
                
                filteredData.sort((a, b) => {
                    if (a[key] && b[key]) {
                        if (a[key] < b[key]) return -1 * direction;
                        if (a[key] > b[key]) return 1 * direction;
                        return 0;
                    }
                    return 0;
                });
            }
            
            // Calcular paginação
            const start = (page - 1) * limit;
            const end = start + limit;
            const paginatedData = filteredData.slice(start, end);
            
            return {
                data: paginatedData,
                total: filteredData.length,
                page,
                limit,
                totalPages: Math.ceil(filteredData.length / limit)
            };
        } catch (error) {
            console.error('Erro ao buscar notas:', error);
            throw error;
        }
    },
    
    /**
     * Busca contadores para o dashboard
     */
    getDashboardCounters: async (): Promise<{ pendentes: number, emProcessamento: number }> => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const pendentes = allMockNotas.filter(nota => nota.status === 'pendente').length;
            const emProcessamento = allMockNotas.filter(nota => nota.status === 'em_processamento').length;
            
            return { pendentes, emProcessamento };
        } catch (error) {
            console.error('Erro ao buscar contadores:', error);
            throw error;
        }
    },
    
    /**
     * Obtém uma nota fiscal específica pelo ID
     */
    getNotaById: async (id: string): Promise<NotaFiscal | null> => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const nota = allMockNotas.find(nota => nota.id === id);
            return nota || null;
        } catch (error) {
            console.error(`Erro ao buscar nota com ID ${id}:`, error);
            throw error;
        }
    },
    
    /**
     * Obtém o PDF de uma nota fiscal específica
     * (Simulação - em um caso real retornaria um blob ou URL)
     */
    getNotaPDF: async (id: string): Promise<{ url: string }> => {
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            return { url: `https://exemplo.com/notas/${id}/pdf` };
        } catch (error) {
            console.error(`Erro ao obter PDF da nota ${id}:`, error);
            throw error;
        }
    },
    
    /**
     * Corrige uma nota fiscal com status pendente
     */
    corrigirNota: async (id: string, motivo: string): Promise<boolean> => {
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Em um caso real, aqui teríamos uma chamada à API
            console.log(`Corrigindo nota ${id} - Motivo: ${motivo}`);
            
            return true;
        } catch (error) {
            console.error(`Erro ao corrigir nota ${id}:`, error);
            throw error;
        }
    }
}; 