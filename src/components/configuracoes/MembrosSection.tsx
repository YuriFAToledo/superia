import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import * as Dialog from '@radix-ui/react-dialog'
import { Edit, KeyRound, Plus, Trash2, X } from "lucide-react"
import { User } from "@supabase/supabase-js"
import { useState, useEffect } from "react"
import { NotasPagination } from "@/components/common/notas/notas-pagination"

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
    handleAddMember: (e: React.FormEvent) => void
    handleRemoveMember: (id: string) => void
    handleEditMember: (id: string, userData: { displayName: string }) => Promise<boolean>
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
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(7)

    const handleOpenEditDialog = (member: User) => {
        setEditMember(member)
        setEditName(member.user_metadata?.display_name || "")
        setEditEmail(member.email || "")
        setEditRole(member.role || "Administrador")
        setEditDialogOpen(true)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!editMember?.id) return
        
        setEditLoading(true)
        const success = await handleEditMember(editMember.id, {
            displayName: editName
        })
        
        setEditLoading(false)
        if (success) {
            setEditDialogOpen(false)
        }
    }

    const handleResetPassword = async () => {
        if (!editEmail) return
        setResetLoading(true)
        await handleResendInviteOrResetPassword(editEmail)
        setResetLoading(false)
        setEditDialogOpen(false)
    }

    // Calcular índices para paginação
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMembers = members.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(members.length / itemsPerPage);

    // Ajustar página atual se ela estiver fora dos limites válidos
    useEffect(() => {
        if (members.length > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [members.length, currentPage, totalPages]);

    return (
        <div className="flex flex-col items-start gap-4 w-3/4">
            <div className="flex items-center justify-between w-full">
                <h2 className="text-xl font-medium text-dark-gray">
                    Membros
                </h2>
                <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <Dialog.Trigger asChild>
                        <Button className="bg-primary text-white rounded-full px-10">
                            <Plus size={18} className="mr-2" />
                            Adicionar membro
                        </Button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg">
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
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg">
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

            <div className="w-full flex flex-col rounded-lg overflow-hidden mt-4 bg-white shadow-sm h-full">
                <div className="overflow-auto flex-grow">
                    <Table className="relative">
                        <TableHeader className="sticky top-0 bg-gray-50 z-10">
                            <TableRow className="border-b">
                                <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Função</TableHead>
                                <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingMembers ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4">Carregando...</TableCell>
                                </TableRow>
                            ) : currentMembers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4">Nenhum membro encontrado</TableCell>
                                </TableRow>
                            ) : (
                                currentMembers.map((member: User, index: number) => (
                                    <TableRow key={member.id || index} className="hover:bg-gray-50 border-b">
                                        <TableCell className="px-6 py-4 whitespace-nowrap">{member.user_metadata?.display_name}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap">{member.email}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap">{member.role}</TableCell>
                                        <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button 
                                                    className="text-primary hover:text-primary/80 p-1 rounded-full hover:bg-gray-100"
                                                    onClick={() => handleOpenEditDialog(member)}
                                                    title="Editar"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-gray-100"
                                                    onClick={() => member.id && handleRemoveMember(member.id)}
                                                    disabled={loading}
                                                    title="Remover"
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
        </div>
    )
} 