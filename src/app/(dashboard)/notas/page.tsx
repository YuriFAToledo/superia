'use client'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { SelectTrigger } from "@radix-ui/react-select"
import { TextSearch, FileClock, Search, ChevronDown } from "lucide-react"
import { NotasTable } from "@/components/common/notas/notas-table"
import { useNotasPageState } from "@/hooks/useNotasPageState"

export default function NotasFiscais() {
    // Utilizando o hook personalizado para gerenciar o estado
    const {
        activeFilter,
        searchTerm,
        tableRef,
        handleFilterChange,
        handleSearch
    } = useNotasPageState();

    return (
        <div className="w-full flex flex-col h-screen pt-12 pl-6 pr-16 pb-10 gap-6 overflow-hidden">
            <div className="flex flex-col gap-3 flex-1 overflow-hidden">
                <h2 className="text-2xl font-semibold text-black">
                    Panorama geral
                </h2>
                <div className="flex gap-3">
                    <Card className="w-fit px-5 py-3.5 flex flex-row">
                        <div className="bg-primary p-3.5 rounded-lg">
                            <TextSearch size={22} />
                        </div>
                        <div className="pr-18">
                            <h3 className="text-secondary text-xl font-medium">
                                {24}
                            </h3>
                            <h3 className="text-dark-gray text-sm">
                                Notas pendentes
                            </h3>
                        </div>
                    </Card>
                    <Card className="w-fit px-5 py-3.5 flex flex-row">
                        <div className="bg-primary p-3.5 rounded-lg">
                            <FileClock size={22} />
                        </div>
                        <div className="pr-18">
                            <h3 className="text-secondary text-xl font-medium">
                                {49}
                            </h3>
                            <h3 className="text-dark-gray text-sm">
                                Notas em processamento
                            </h3>
                        </div>
                    </Card>
                </div>

                <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                    <h2 className="text-xl font-medium text-secondary">
                        Notas fiscais
                    </h2>
                    <div className="flex items-center justify-between" >
                        <div className="flex gap-7">
                            <div className="flex gap-5">
                                <Button 
                                    className={`text-sm font-normal rounded-3xl px-5 py-3.5 border border-secondary ${activeFilter === null ? 'bg-secondary text-white' : 'bg-transparent text-secondary'}`}
                                    onClick={() => handleFilterChange(null)}
                                >
                                    Todas
                                </Button>
                                <Button 
                                    className={`text-sm font-normal rounded-3xl px-5 py-3.5 border border-secondary ${activeFilter === 'pendente' ? 'bg-secondary text-white' : 'bg-transparent text-secondary'}`}
                                    onClick={() => handleFilterChange('pendente')}
                                >
                                    Somente pendentes
                                </Button>
                                <Button 
                                    className={`text-sm font-normal rounded-3xl px-5 py-3.5 border border-secondary ${activeFilter === 'em_processamento' ? 'bg-secondary text-white' : 'bg-transparent text-secondary'}`}
                                    onClick={() => handleFilterChange('em_processamento')}
                                >
                                    Somente em processamento
                                </Button>
                            </div>
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
                        </div>

                        <div className="flex items-center gap-5 rounded-lg">
                            <span className="text-[#B7B7B7] text-sm font-medium">Ordenar por:</span>
                            <Select defaultValue="mais_recente">
                                <SelectTrigger
                                    className="w-[180px] h-9 rounded-2xl bg-white flex items-center justify-between px-3 data-[placeholder]:text-[#B7B7B7] text-[#B7B7B7]"
                                >
                                    <SelectValue className="text-sm" />
                                    <ChevronDown size={18} className="text-[#B7B7B7]" />
                                </SelectTrigger>

                                <SelectContent
                                    className="w-[180px] bg-white rounded-lg shadow-lg border"
                                >
                                    {[
                                        "Data da nota",
                                        "Fornecedor",
                                        "Número de nota",
                                        "Valor",
                                        "Data de cadastro",
                                        "Status",
                                        "Mais recente"
                                    ].map((field) => (
                                        <SelectItem
                                            key={field}
                                            value={field.toLowerCase().replace(/\s+/g, "_")}
                                            className="text-[#B7B7B7] text-sm px-3 py-2 hover:bg-primary data-[highlighted]:text-secondary data-[state=checked]:text-secondary data-[state=checked]:font-semibold data-[state=checked]:bg-muted"
                                        >
                                            {field}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto h-full">
                        <NotasTable 
                            ref={tableRef}
                            initialFilter={activeFilter}
                            initialSearchTerm={searchTerm}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}