'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectValue, SelectTrigger } from "@/components/ui/select"
import { Search, RefreshCw } from "lucide-react"
import { HistoricoTable } from "@/components/notas/historico-table"
import { TableHeader } from "@/components/notas/table-header"
import { useHistoricoPageState } from "@/hooks/useHistoricoPageState"

export default function historico() {
    // Usar o hook personalizado para histórico
    const {
        searchTerm,
        handleSearch,
        handleSort,
        setUseMockData,
        fetchNotas
    } = useHistoricoPageState();

    // Função para lidar com a ordenação
    const handleSelectChange = (value: string) => {
        // Mapear valores do select para campos da API
        const fieldMap: Record<string, string> = {
            'data_da_nota': 'dataEmissao',
            'fornecedor': 'fornecedor',
            'numero_de_nota': 'numero',
            'valor': 'valor',
            'data_de_cadastro': 'dataCadastro',
            'status': 'status',
            'mais_recente': 'dataCadastro' // ordenação padrão para "mais recente"
        };
        
        // Aplicar ordenação
        if (value in fieldMap) {
            handleSort(fieldMap[value]);
        }
    };
    
    // Função para forçar carregamento dos dados mock
    const handleReload = () => {
        console.log("Recarregando dados mock...");
        setUseMockData(true);
        fetchNotas({
            status: 'aprovado',
            page: 1
        });
    };

    // Renderizar ações de pesquisa e ordenação
    const renderActions = () => (
        <>
            <div className="relative">
                <Search
                    size={16}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                    type="text"
                    placeholder="Pesquisar por fornecedor"
                    className="pl-12 min-w-[275px] h-9 py-5 bg-white rounded-[17px] border border-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>
            
            <Select onValueChange={handleSelectChange} defaultValue="mais_recente">
                <SelectTrigger className="w-[200px] bg-white border-gray-200 h-9 py-5 rounded-[17px]">
                    <span className="flex items-center">
                        Ordenar por
                    </span>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Ordenar por</SelectLabel>
                        <SelectItem value="mais_recente">Mais recentes</SelectItem>
                        <SelectItem value="data_da_nota">Data da nota</SelectItem>
                        <SelectItem value="fornecedor">Fornecedor</SelectItem>
                        <SelectItem value="numero_de_nota">Número da nota</SelectItem>
                        <SelectItem value="valor">Valor</SelectItem>
                        <SelectItem value="data_de_cadastro">Data de cadastro</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            
            <Button 
                onClick={handleReload} 
                variant="outline" 
                size="icon"
                className="h-9 w-9 rounded-full"
                title="Recarregar dados"
            >
                <RefreshCw size={16} />
            </Button>
        </>
    );

    return (
        <div className="w-full flex flex-col h-screen pt-12 pl-6 pr-16 pb-10 gap-6 overflow-hidden">
            <TableHeader 
                title="Histórico" 
                actions={renderActions()}
                className="flex flex-col gap-7"
            />
            
            <div className="flex-1">
                <HistoricoTable />
            </div>
        </div>
    )
}