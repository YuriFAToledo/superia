import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import * as Dialog from '@radix-ui/react-dialog'
import { Edit, KeyRound, Plus, Trash2, X } from "lucide-react"
import { User } from "@supabase/supabase-js"
import { useState, useEffect } from "react"
import { NotasPagination } from "@/components/common/notas/notas-pagination"

// Diálogo de confirmação para exclusão
interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}

function DeleteConfirmDialog({ isOpen, onClose, onConfirm, loading }: DeleteConfirmDialogProps) {
    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[49]" />
                <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[400px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-[50]">
                    <Dialog.Title className="text-lg font-semibold mb-2 text-red-600">
                        Confirmar exclusão
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-gray-500 mb-4">
                        Tem certeza que deseja excluir este membro? Esta ação não pode ser desfeita.
                    </Dialog.Description>
                    
                    <div className="flex justify-end gap-2 mt-6">
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="border-gray-300"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="button" 
                            className="bg-red-600 hover:bg-red-700 text-white" 
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? "Excluindo..." : "Excluir"}
                        </Button>
                    </div>
                    
                    <Dialog.Close asChild>
                        <button 
                            className="absolute right-4 top-4 inline-flex h-6 w-6 appearance-none items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                            disabled={loading}
                        >
                            <X size={18} />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

interface MembersSectionProps {
    isDialogOpen: boolean
    setIsDialogOpen: (isOpen: boolean) => void
    newMemberName: string
    setNewMemberName: (name: string) => void
    newMemberEmail: string
    setNewMemberEmail: (email: string) => void
    newMemberRole: string
    setNewMemberRole: (role: string) => void
    loading: boolean
    loadingMembers: boolean
    members: User[]
    currentUser: User | null
    currentPage: number
    setCurrentPage: (page: number) => void
    totalPages: number
    handleAddMember: (e: React.FormEvent) => void
    handleRemoveMember: (id: string) => void
    handleEditMember: (id: string, userData: { displayName: string, role?: string }) => Promise<boolean>
    handleResendInviteOrResetPassword: (email: string) => Promise<void>
}

export function MembrosSection({
    isDialogOpen,
    setIsDialogOpen,
    newMemberName,
    setNewMemberName,
    newMemberEmail,
    setNewMemberEmail,
    newMemberRole,
    setNewMemberRole,
    loading,
    loadingMembers,
    members,
    currentUser,
    currentPage,
    setCurrentPage,
    totalPages,
    handleAddMember,
    handleRemoveMember,
    handleEditMember,
    handleResendInviteOrResetPassword
}: MembersSectionProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editMember, setEditMember] = useState<User | null>(null)
    const [editName, setEditName] = useState("")
    const [editEmail, setEditEmail] = useState("")
    const [editRole, setEditRole] = useState("")
    const [editLoading, setEditLoading] = useState(false)
    const [resetLoading, setResetLoading] = useState(false)
    
    // Estados para o diálogo de confirmação de exclusão
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [memberToDelete, setMemberToDelete] = useState<string | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    // Verificar se o usuário atual é administrador
    const isAdmin = currentUser?.user_metadata.role === "admin"

    const handleOpenEditDialog = (member: User) => {
        setEditMember(member)
        setEditName(member.user_metadata?.display_name || "")
        setEditEmail(member.email || "")
        
        // Validar e normalizar a role
        let role = member.user_metadata?.role || ""
        if (role !== "user" && role !== "admin") {
            role = "user" // Valor padrão se não for uma role válida
        }
        setEditRole(role)
        
        setEditDialogOpen(true)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!editMember?.id) return
        
        // Fechar o diálogo imediatamente para melhor experiência do usuário
        setEditDialogOpen(false)
        
        // Definir estado de carregamento
        setEditLoading(true)
        
        // Chamar a API para atualizar o membro
        await handleEditMember(editMember.id, {
            displayName: editName,
            role: editRole
        })
        
        // Resetar estado de carregamento
        setEditLoading(false)
    }

    const handleResetPassword = async () => {
        if (!editEmail) return
        
        // Fechar o diálogo imediatamente
        setEditDialogOpen(false)
        
        // Definir estado de carregamento
        setResetLoading(true)
        
        // Chamar a API
        await handleResendInviteOrResetPassword(editEmail)
        
        // Resetar estado de carregamento
        setResetLoading(false)
    }

    // Função para abrir o diálogo de confirmação de exclusão
    const openDeleteConfirmation = (id: string) => {
        setMemberToDelete(id)
        setDeleteDialogOpen(true)
    }
    
    // Função para confirmar a exclusão
    const confirmDelete = async () => {
        if (!memberToDelete) return
        
        setDeleteLoading(true)
        await handleRemoveMember(memberToDelete)
        setDeleteLoading(false)
        setDeleteDialogOpen(false)
        setMemberToDelete(null)
    }

    return (
        <div className="flex flex-col items-start gap-4 w-3/4">
            <div className="flex items-center justify-between w-full">
                <h2 className="text-xl font-medium text-dark-gray">
                    Membros
                </h2>
                <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <Dialog.Trigger asChild>
                        <Button 
                            className="bg-primary text-white rounded-full px-10" 
                            disabled={!isAdmin}
                            title={!isAdmin ? "Apenas administradores podem adicionar membros" : ""}
                        >
                            <Plus size={18} className="mr-2" />
                            Adicionar membro
                        </Button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[49]" />
                        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-[50]">
                            <Dialog.Title className="text-lg font-semibold mb-2">
                                Adicionar novo membro
                            </Dialog.Title>
                            <Dialog.Description className="text-sm text-gray-500 mb-4">
                                Preencha os dados abaixo para enviar um convite ao novo membro.
                            </Dialog.Description>
                            
                            <form onSubmit={handleAddMember}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <label htmlFor="name" className="text-right text-sm font-medium">
                                            Nome
                                        </label>
                                        <Input
                                            id="name"
                                            placeholder="Nome completo"
                                            className="col-span-3"
                                            value={newMemberName}
                                            onChange={(e) => setNewMemberName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <label htmlFor="email" className="text-right text-sm font-medium">
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="email@exemplo.com"
                                            className="col-span-3"
                                            value={newMemberEmail}
                                            onChange={(e) => setNewMemberEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    {isAdmin && (
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <label htmlFor="role" className="text-right text-sm font-medium">
                                                Função
                                            </label>
                                            <select
                                                id="role"
                                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={newMemberRole}
                                                onChange={(e) => setNewMemberRole(e.target.value)}
                                                required
                                            >
                                                <option value="user">Usuário</option>
                                                <option value="admin">Administrador</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Dialog.Close asChild>
                                        <Button type="button" variant="outline" className="border-gray-300">
                                            Cancelar
                                        </Button>
                                    </Dialog.Close>
                                    <Button type="submit" className="bg-primary text-white" disabled={loading}>
                                        {loading ? "Enviando..." : "Enviar convite"}
                                    </Button>
                                </div>
                            </form>
                            
                            <Dialog.Close asChild>
                                <button className="absolute right-4 top-4 inline-flex h-6 w-6 appearance-none items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
                                    <X size={18} />
                                </button>
                            </Dialog.Close>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>

            {/* Dialog para editar membro */}
            <Dialog.Root open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[49]" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-[50]">
                        <Dialog.Title className="text-lg font-semibold mb-2">
                            Editar membro
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-gray-500 mb-4">
                            Atualize as informações do membro abaixo.
                        </Dialog.Description>
                        
                        <form onSubmit={handleEditSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="edit-name" className="text-right text-sm font-medium">
                                        Nome
                                    </label>
                                    <Input
                                        id="edit-name"
                                        placeholder="Nome completo"
                                        className="col-span-3"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <label htmlFor="edit-email" className="text-right text-sm font-medium">
                                        Email
                                    </label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        placeholder="email@exemplo.com"
                                        className="col-span-3"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        required
                                        disabled
                                    />
                                </div>
                                {isAdmin && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <label htmlFor="edit-role" className="text-right text-sm font-medium">
                                            Função
                                        </label>
                                        <select
                                            id="edit-role"
                                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={editRole}
                                            onChange={(e) => setEditRole(e.target.value)}
                                            required
                                        >
                                            <option value="user">Usuário</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>
                                )}
                                <div className="flex justify-center mt-2">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="border-gray-300 flex items-center gap-2"
                                        onClick={handleResetPassword}
                                        disabled={resetLoading}
                                    >
                                        <KeyRound size={16} />
                                        {resetLoading 
                                            ? "Enviando..." 
                                            : editMember?.email_confirmed_at 
                                                ? "Enviar reset de senha" 
                                                : "Reenviar convite"
                                        }
                                    </Button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Dialog.Close asChild>
                                    <Button type="button" variant="outline" className="border-gray-300">
                                        Cancelar
                                    </Button>
                                </Dialog.Close>
                                <Button type="submit" className="bg-primary text-white" disabled={editLoading}>
                                    {editLoading ? "Salvando..." : "Salvar alterações"}
                                </Button>
                            </div>
                        </form>
                        
                        <Dialog.Close asChild>
                            <button className="absolute right-4 top-4 inline-flex h-6 w-6 appearance-none items-center justify-center rounded-full text-gray-500 hover:bg-gray-100">
                                <X size={18} />
                            </button>
                        </Dialog.Close>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            <div className="w-full flex flex-col rounded-lg overflow-hidden mt-4 bg-white shadow-sm h-full relative z-[1]">
                <div className="overflow-auto flex-grow">
                    <Table className="relative">
                        <TableHeader className="sticky top-0 bg-gray-50 z-[5]">
                            <TableRow className="border-b">
                                <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Função</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                                <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingMembers ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12">
                                        <div className="flex flex-col justify-center items-center">
                                            <div className="flex justify-center items-center space-x-4 mb-4">
                                                <div className="w-3 h-3 bg-primary rounded-full opacity-70 animate-[loader-pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
                                                <div className="w-3 h-3 bg-primary rounded-full opacity-70 animate-[loader-pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite_0.3s]"></div>
                                                <div className="w-3 h-3 bg-primary rounded-full opacity-70 animate-[loader-pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite_0.6s]"></div>
                                            </div>
                                            <span className="text-gray-500 font-medium">Carregando membros...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : members.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">Nenhum membro encontrado</TableCell>
                                </TableRow>
                            ) : (
                                members.map((member: User, index: number) => (
                                    <TableRow key={member.id || index} className="hover:bg-gray-50 border-b">
                                        <TableCell className="px-6 py-4 whitespace-nowrap">{member.user_metadata?.display_name}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap">{member.email}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap">
                                            {member.user_metadata?.role === "user" 
                                                ? "Usuário" 
                                                : member.user_metadata?.role === "admin"
                                                    ? "Administrador"
                                                    : "-"
                                            }
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap">
                                            {member.user_metadata?.email_verified ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Pendente
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button 
                                                    className="text-primary hover:text-primary/80 p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    onClick={() => handleOpenEditDialog(member)}
                                                    title={!isAdmin ? "Apenas administradores podem editar membros" : "Editar"}
                                                    disabled={!isAdmin}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    onClick={() => member.id && openDeleteConfirmation(member.id)}
                                                    disabled={loading || !isAdmin}
                                                    title={!isAdmin ? "Apenas administradores podem remover membros" : "Remover"}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                {members.length > 0 && (
                    <div className="mt-auto">
                        <NotasPagination 
                            page={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                            loading={loadingMembers}
                        />
                    </div>
                )}
            </div>

            {/* Diálogo de confirmação de exclusão */}
            <DeleteConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                loading={deleteLoading}
            />
        </div>
    )
} 