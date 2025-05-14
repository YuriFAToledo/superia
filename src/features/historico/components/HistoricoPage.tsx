'use client'

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/shared/components/ui/select"
import { Search, ChevronDown } from "lucide-react"
import { HistoricoTable } from "@/features/historico/components/HistoricoTable"
import { useHistoricoNotas } from "@/features/historico/hooks/useHistoricoNotas"
import { Pagination } from "@/shared/components/common/pagination"
import { NotaFiscal } from "../types"
import { useEffect } from "react"

/**
 * Componente principal da página de notas fiscais
 */
export function HistoricoPage() {
  // Utilizar o hook para gerenciar o estado
  const {
    notas,
    loading,
    error,
    searchTerm,
    page,
    totalPages,
    handleSearch: hookHandleSearch,
    handlePageChange,
    handleSort,
    getNotaPDF,
    sorting,
    fetchNotas
  } = useHistoricoNotas({ limit: 9 });

  // Adaptador para o evento de input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    hookHandleSearch(e.target.value);
  };

  // Adaptador para acessar PDF
  const handleAccessPDF = (nota: NotaFiscal) => {
    if (nota.id) {
      getNotaPDF(nota.id);
    }
  };

  // Efeito para monitorar erros e recarregar se necessário
  useEffect(() => {
    if (error) {
      console.error("Erro ao carregar notas:", error);
      // Se quiser implementar um retry automático:
      // const timer = setTimeout(() => {
      //   fetchNotas({ limit: 9, status: 'pendente' });
      // }, 3000);
      // return () => clearTimeout(timer);
    }
  }, [error, fetchNotas]);

  return (
    <div className="w-full flex flex-col h-screen pt-12 pl-6 pr-16 pb-10 gap-6 overflow-hidden">
      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        <div className="flex flex-col gap-2 flex-1 overflow-hidden rounded-lg">
          <h2 className="text-xl font-medium text-secondary mx-4 mt-4">
            Notas fiscais
          </h2>
          <div className="flex items-center justify-between px-4 pb-4">
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
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-5 rounded-lg">
              <span className="text-[#B7B7B7] text-sm font-medium">Ordenar por:</span>
              <Select defaultValue="mais_recente" disabled={loading}>
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

          <div className="flex-1 overflow-auto h-full flex flex-col scrollbar-hide bg-white rounded-lg">
            <div className="flex-1">
              <HistoricoTable
                notas={notas}
                loading={loading}
                onAccessPDF={handleAccessPDF}
                onSort={handleSort}
                sorting={sorting}
              />
            </div>

            {!loading && notas && notas.length > 0 && totalPages > 1 && (
              <div className="mt-2 mb-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-4 text-red-500">
                Ocorreu um erro ao carregar as notas fiscais. 
                <Button 
                  variant="link" 
                  className="text-primary ml-2"
                  onClick={() => fetchNotas({ limit: 9, status: 'pendente' })}
                >
                  Tentar novamente
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 