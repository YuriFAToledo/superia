import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationLinkProps {
    page: number;
    isActive: boolean;
    onClick: (page: number) => void;
}

function PageLink({ page, isActive, onClick }: PaginationLinkProps) {
    return (
        <PaginationItem key={page}>
            <PaginationLink 
                isActive={isActive}
                onClick={() => onClick(page)}
            >
                {page}
            </PaginationLink>
        </PaginationItem>
    )
}

interface PaginationEllipsisItemProps {
    keyId: string;
}

function PaginationEllipsisItem({ keyId }: PaginationEllipsisItemProps) {
    return (
        <PaginationItem key={keyId}>
            <PaginationEllipsis />
        </PaginationItem>
    )
}

interface PaginationNavigationButtonProps {
    direction: 'prev' | 'next';
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

function PaginationNavigationButton({ 
    direction, 
    currentPage, 
    totalPages, 
    onPageChange 
}: PaginationNavigationButtonProps) {
    if (direction === 'prev') {
        const isDisabled = currentPage === 1;
        return (
            <PaginationItem>
                <PaginationPrevious 
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    className={isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                />
            </PaginationItem>
        );
    } else {
        const isDisabled = currentPage === totalPages;
        return (
            <PaginationItem>
                <PaginationNext 
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    className={isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                />
            </PaginationItem>
        );
    }
}

interface NotasPaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    loading?: boolean;
}

export function NotasPagination({ page, totalPages, onPageChange, loading = false }: NotasPaginationProps) {
    const renderPaginationLinks = () => {
        const pages = [];
        
        // Caso simples: menos de 6 páginas
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <PageLink 
                        key={i}
                        page={i} 
                        isActive={page === i} 
                        onClick={onPageChange} 
                    />
                )
            }
            return pages;
        }
        
        // Renderização complexa com ellipsis
        // Sempre mostrar primeira página
        pages.push(
            <PageLink 
                key={1}
                page={1} 
                isActive={page === 1} 
                onClick={onPageChange} 
            />
        );
        
        // Ellipsis antes da página atual, se necessário
        if (page > 3) {
            pages.push(<PaginationEllipsisItem key="ellipsis-1" keyId="ellipsis-1" />);
        }
        
        // Páginas ao redor da atual
        const startPage = Math.max(2, page - 1);
        const endPage = Math.min(totalPages - 1, page + 1);
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <PageLink 
                    key={i}
                    page={i} 
                    isActive={page === i} 
                    onClick={onPageChange} 
                />
            );
        }
        
        // Ellipsis após a página atual, se necessário
        if (page < totalPages - 2) {
            pages.push(<PaginationEllipsisItem key="ellipsis-2" keyId="ellipsis-2" />);
        }
        
        // Sempre mostrar última página
        if (totalPages > 1) {
            pages.push(
                <PageLink 
                    key={totalPages}
                    page={totalPages} 
                    isActive={page === totalPages} 
                    onClick={onPageChange} 
                />
            );
        }
        
        return pages;
    };

    // Se estiver carregando, não renderiza a paginação
    if (loading || totalPages <= 0) {
        return null;
    }

    return (
        <div className="py-4 bg-white border-t border-gray-100 relative">
            <Pagination>
                <PaginationContent>
                    <PaginationNavigationButton 
                        direction="prev" 
                        currentPage={page} 
                        totalPages={totalPages} 
                        onPageChange={onPageChange} 
                    />
                    
                    {renderPaginationLinks()}
                    
                    <PaginationNavigationButton 
                        direction="next" 
                        currentPage={page} 
                        totalPages={totalPages} 
                        onPageChange={onPageChange} 
                    />
                </PaginationContent>
            </Pagination>
        </div>
    )
} 