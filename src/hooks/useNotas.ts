import { useState, useEffect, useCallback } from 'react';
import { notasService, NotasParams, PaginatedResponse } from '@/api/notas-service';
import { NotaFiscal } from '@/components/notas/types';

// Dados de exemplo mockados
export const mockNotas: NotaFiscal[] = [
    {
        id: "1",
        dataEmissao: "03/03/2025",
        fornecedor: "Empresa LTDA",
        numero: "NF-e nº 123456789",
        valor: "R$3.293,29",
        status: "pendente",
        motivo: "Api fora do ar"
    },
    {
        id: "2",
        dataEmissao: "02/03/2025",
        fornecedor: "Distribuidora XYZ",
        numero: "NF-e nº 987654321",
        valor: "R$1.567,80",
        status: "em_processamento",
        motivo: "-"
    },
    {
        id: "3",
        dataEmissao: "28/02/2025",
        fornecedor: "Indústria 123",
        numero: "NF-e nº 789123456",
        valor: "R$4.123,67",
        status: "pendente",
        motivo: "Cliente não localizado"
    },
    {
        id: "4",
        dataEmissao: "27/02/2025",
        fornecedor: "Atacado & Varejo",
        numero: "NF-e nº 321654987",
        valor: "R$1.234,56",
        status: "em_processamento",
        motivo: "-"
    },
    {
        id: "5",
        dataEmissao: "26/02/2025",
        fornecedor: "Comércio Local SA",
        numero: "NF-e nº 789456123",
        valor: "R$2.345,67",
        status: "pendente",
        motivo: "Documento inválido"
    },
    {
        id: "6",
        dataEmissao: "25/02/2025",
        fornecedor: "Suprimentos Gerais",
        numero: "NF-e nº 654789321",
        valor: "R$5.432,10",
        status: "em_processamento",
        motivo: "-"
    },
    {
        id: "7",
        dataEmissao: "24/02/2025",
        fornecedor: "Transportes Rápidos",
        numero: "NF-e nº 147258369",
        valor: "R$3.789,45",
        status: "pendente",
        motivo: "Endereço não encontrado"
    },
    {
        id: "8",
        dataEmissao: "23/02/2025",
        fornecedor: "Equipamentos Industriais",
        numero: "NF-e nº 963258741",
        valor: "R$7.890,12",
        status: "em_processamento",
        motivo: "-"
    },
    {
        id: "9",
        dataEmissao: "22/02/2025",
        fornecedor: "Materiais Pesados LTDA",
        numero: "NF-e nº 852741963",
        valor: "R$10.234,56",
        status: "pendente",
        motivo: "Dados incompletos"
    },
    {
        id: "10",
        dataEmissao: "21/02/2025",
        fornecedor: "Elétrica & Hidráulica SA",
        numero: "NF-e nº 369852147",
        valor: "R$2.987,65",
        status: "em_processamento",
        motivo: "-"
    },
    {
        id: "11",
        dataEmissao: "20/02/2025",
        fornecedor: "Ferramentas Profissionais",
        numero: "NF-e nº 741852963",
        valor: "R$6.543,21",
        status: "pendente",
        motivo: "Erro na validação"
    },
    {
        id: "12",
        dataEmissao: "19/02/2025",
        fornecedor: "Produtos Químicos LTDA",
        numero: "NF-e nº 159357486",
        valor: "R$8.765,43",
        status: "em_processamento",
        motivo: "-"
    }
];

// Dados mockados para o histórico de notas (status aprovado)
export const mockHistoricoNotas: NotaFiscal[] = [
    {
        id: "h1",
        dataEmissao: "15/02/2025",
        fornecedor: "Tech Solutions LTDA",
        numero: "NF-e nº 738291047",
        valor: "R$4.725,65",
        status: "aprovado",
        motivo: "-"
    },
    {
        id: "h2",
        dataEmissao: "14/02/2025",
        fornecedor: "Materiais Escolares SA",
        numero: "NF-e nº 647382910",
        valor: "R$1.875,32",
        status: "aprovado",
        motivo: "-"
    },
    {
        id: "h3",
        dataEmissao: "13/02/2025",
        fornecedor: "Distribuidora XYZ",
        numero: "NF-e nº 563827194",
        valor: "R$3.254,18",
        status: "aprovado",
        motivo: "-"
    },
    {
        id: "h4",
        dataEmissao: "12/02/2025",
        fornecedor: "Comércio Central LTDA",
        numero: "NF-e nº 475638291",
        valor: "R$6.748,90",
        status: "aprovado",
        motivo: "-"
    },
    {
        id: "h5",
        dataEmissao: "11/02/2025",
        fornecedor: "Atacado Express",
        numero: "NF-e nº 384756291",
        valor: "R$2.154,67",
        status: "aprovado",
        motivo: "-"
    },
    {
        id: "h6",
        dataEmissao: "10/02/2025",
        fornecedor: "Suprimentos Gerais",
        numero: "NF-e nº 293847561",
        valor: "R$5.876,44",
        status: "aprovado",
        motivo: "-"
    },
    {
        id: "h7",
        dataEmissao: "09/02/2025",
        fornecedor: "Armarinhos & Cia",
        numero: "NF-e nº 182937465",
        valor: "R$987,23",
        status: "aprovado",
        motivo: "-"
    },
    {
        id: "h8",
        dataEmissao: "08/02/2025",
        fornecedor: "Fábrica Industrial SA",
        numero: "NF-e nº 091827364",
        valor: "R$12.345,78",
        status: "aprovado",
        motivo: "-"
    },
    {
        id: "h9",
        dataEmissao: "07/02/2025",
        fornecedor: "Elétrica & Hidráulica SA",
        numero: "NF-e nº 918273645",
        valor: "R$3.789,12",
        status: "aprovado",
        motivo: "-"
    },
    {
        id: "h10",
        dataEmissao: "06/02/2025",
        fornecedor: "Transportes Rápidos",
        numero: "NF-e nº 827364509",
        valor: "R$2.456,78",
        status: "aprovado",
        motivo: "-"
    }
];

// Estado global para controlar o modo mockado
// Começamos com true (usando mock) e podemos mudar com setUseMockData
let USE_MOCK_DATA = true;

export const setUseMockData = (useMock: boolean) => {
    USE_MOCK_DATA = useMock;
};

export const getUseMockData = () => USE_MOCK_DATA;

// Interface para o retorno do hook
interface UseNotasReturn {
    notas: NotaFiscal[];
    loading: boolean;
    error: Error | null;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    fetchNotas: (params?: NotasParams) => Promise<void>;
    resetNotas: () => void;
    sorting: {
        field: keyof NotaFiscal | null;
        direction: 'asc' | 'desc';
    };
    setSorting: (field: keyof NotaFiscal, direction?: 'asc' | 'desc') => void;
    getNotaPDF: (id: string) => Promise<void>;
    getNotaXML: (id: string) => Promise<void>;
    useMockData: boolean;
    setUseMockData: (useMock: boolean) => void;
    setLoading: (state: boolean) => void;
}

// Simula uma resposta paginada da API com os dados mockados
const getMockPaginatedResponse = (params: NotasParams): PaginatedResponse<NotaFiscal> => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    console.log('getMockPaginatedResponse - Parâmetros recebidos:', params);
    
    // Determinar se estamos na visualização de histórico
    const isHistorico = params.status === 'aprovado' || window.location.pathname.includes('/historico');
    
    // Escolher a lista de dados correta
    let sourceData = isHistorico ? mockHistoricoNotas : mockNotas;
    
    console.log('Usando dados de:', isHistorico ? 'histórico' : 'notas normais');
    
    // Filtragem
    let filteredData = [...sourceData];
    
    // Log do total antes da filtragem
    console.log('Total de notas antes da filtragem:', filteredData.length);
    
    if (params.fornecedor) {
        filteredData = filteredData.filter(
            nota => nota.fornecedor.toLowerCase().includes(params.fornecedor!.toLowerCase())
        );
        console.log('Após filtro por fornecedor:', filteredData.length);
    }
    
    if (params.status) {
        filteredData = filteredData.filter(nota => nota.status === params.status);
        console.log('Após filtro por status:', filteredData.length, 'Status:', params.status);
    }
    
    // Ordenação
    if (params.sort) {
        const direction = params.order === 'asc' ? 1 : -1;
        filteredData.sort((a, b) => {
            if (a[params.sort as keyof NotaFiscal] < b[params.sort as keyof NotaFiscal]) return -1 * direction;
            if (a[params.sort as keyof NotaFiscal] > b[params.sort as keyof NotaFiscal]) return 1 * direction;
            return 0;
        });
    }
    
    // Paginação
    const paginatedItems = filteredData.slice(start, end);
    
    return {
        items: paginatedItems,
        total: filteredData.length,
        page,
        limit,
        totalPages: Math.ceil(filteredData.length / limit)
    };
};

/**
 * Hook para gerenciar notas fiscais com integração à API
 */
export function useNotas(initialParams: NotasParams = {}): UseNotasReturn {
    // Estado local para controlar se estamos usando dados mockados
    const [useMockData, setUseMockDataState] = useState(USE_MOCK_DATA);
    
    // Estado para armazenar as notas
    const [notas, setNotas] = useState<NotaFiscal[]>([]);
    // Estado para controlar carregamento
    const [loading, setLoading] = useState(false);
    // Estado para armazenar erros
    const [error, setError] = useState<Error | null>(null);
    // Estado para metadata da paginação
    const [pagination, setPagination] = useState({
        page: initialParams.page || 1,
        limit: initialParams.limit || 10,
        total: 0,
        totalPages: 0,
    });
    // Estado para ordenação
    const [sorting, setSortingState] = useState<{
        field: keyof NotaFiscal | null;
        direction: 'asc' | 'desc';
    }>({
        field: initialParams.sort as keyof NotaFiscal || null,
        direction: (initialParams.order || 'desc') as 'asc' | 'desc',
    });

    // Função para alterar o modo mockado
    const toggleMockData = useCallback((useMock: boolean) => {
        setUseMockData(useMock);
        setUseMockDataState(useMock);
        // Após mudar o modo, refazer a busca com os parâmetros atuais
        fetchNotas({
            page: pagination.page,
            limit: pagination.limit,
            sort: sorting.field as string,
            order: sorting.direction
        });
    }, [pagination.page, pagination.limit, sorting]);

    // Função para buscar notas fiscais
    const fetchNotas = useCallback(async (params: NotasParams = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            // Forçar o modo de mock para desenvolvimento
            const forceMockMode = true;
            
            // Verificar se estamos usando dados mockados
            if (forceMockMode || useMockData) {
                // Simular um atraso de rede para melhor UX
                await new Promise(resolve => setTimeout(resolve, 500));
                
                console.log('Buscando notas com mock data:', params);
                
                // Usar nossos dados mockados
                const response = getMockPaginatedResponse({
                    ...params,
                    page: params.page || pagination.page,
                    limit: params.limit || pagination.limit,
                    sort: params.sort || (sorting.field as string) || undefined,
                    order: params.order || sorting.direction,
                });
                
                // Atualizar estados
                setNotas(response.items);
                setPagination({
                    page: response.page,
                    limit: response.limit,
                    total: response.total,
                    totalPages: response.totalPages,
                });
            } else {
                // Modo API real
                // Determinar se vamos usar o endpoint normal ou histórico
                const isHistorico = params.status === 'aprovado' || window.location.pathname.includes('/historico');
                
                // Preparar parâmetros de consulta
                const queryParams: NotasParams = {
                    ...params,
                    page: params.page || pagination.page,
                    limit: params.limit || pagination.limit,
                    sort: params.sort || (sorting.field as string) || undefined,
                    order: params.order || sorting.direction,
                };
                
                // Fazer a chamada da API apropriada
                const response = isHistorico
                    ? await notasService.getHistoricoNotas(queryParams)
                    : await notasService.getNotas(queryParams);
                
                // Atualizar estados
                setNotas(response.items);
                setPagination({
                    page: response.page,
                    limit: response.limit,
                    total: response.total,
                    totalPages: response.totalPages,
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar notas fiscais'));
            console.error('Erro ao buscar notas fiscais:', err);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, sorting, useMockData]);

    // Função para resetar estado
    const resetNotas = useCallback(() => {
        setNotas([]);
        setError(null);
        setPagination({
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
        });
        setSortingState({
            field: null,
            direction: 'desc',
        });
    }, []);

    // Função para definir ordenação
    const setSorting = useCallback((field: keyof NotaFiscal, direction?: 'asc' | 'desc') => {
        const newDirection = direction || 
            (sorting.field === field && sorting.direction === 'asc' ? 'desc' : 'asc');
        
        setSortingState({
            field,
            direction: newDirection,
        });
        
        // Refazer busca com nova ordenação
        fetchNotas({
            sort: field as string,
            order: newDirection,
            page: 1, // Voltar para primeira página ao mudar ordenação
        });
    }, [sorting, fetchNotas]);

    // Função para baixar PDF
    const getNotaPDF = useCallback(async (id: string) => {
        try {
            if (useMockData) {
                // Simulação para modo mockado - apenas mostra uma mensagem
                console.log('Modo mock: Abrindo PDF para nota', id);
                alert('Modo mockado: O PDF seria aberto em uma nova aba.');
                return;
            }
            
            const pdfBlob = await notasService.getNotaPDF(id);
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            // Abrir PDF em nova aba
            window.open(pdfUrl, '_blank');
        } catch (err) {
            console.error('Erro ao baixar PDF:', err);
            alert('Não foi possível baixar o PDF. Tente novamente mais tarde.');
        }
    }, [useMockData]);

    // Função para baixar XML
    const getNotaXML = useCallback(async (id: string) => {
        try {
            if (useMockData) {
                // Simulação para modo mockado - apenas mostra uma mensagem
                console.log('Modo mock: Baixando XML para nota', id);
                alert('Modo mockado: O arquivo XML seria baixado.');
                return;
            }
            
            const xmlBlob = await notasService.getNotaXML(id);
            
            // Criar link para download e simular clique
            const url = URL.createObjectURL(xmlBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `nota-${id}.xml`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Erro ao baixar XML:', err);
            alert('Não foi possível exportar o XML. Tente novamente mais tarde.');
        }
    }, [useMockData]);

    // Carregar notas na montagem do componente
    useEffect(() => {
        fetchNotas(initialParams);
    }, []);

    return {
        notas,
        loading,
        error,
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
        fetchNotas,
        resetNotas,
        sorting,
        setSorting,
        getNotaPDF,
        getNotaXML,
        useMockData,
        setUseMockData: toggleMockData,
        setLoading
    };
} 