import { createBrowserSupabaseClient, supabaseAdmin } from "@/lib/supabase"
import { FormEvent, useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { toast } from "sonner"

export function useConfiguracoes() {
    const [email, setEmail] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newMemberName, setNewMemberName] = useState("")
    const [newMemberEmail, setNewMemberEmail] = useState("")
    const [newMemberRole, setNewMemberRole] = useState("user")
    const [loading, setLoading] = useState(false)
    const [loadingMembers, setLoadingMembers] = useState(false)
    const [members, setMembers] = useState<User[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)
    
    // Paginação
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [itemsPerPage] = useState(7)

    // Buscar membros ao carregar a página
    useEffect(() => {
        fetchMembers(currentPage)
        fetchCurrentUser()
    }, [currentPage])

    const fetchCurrentUser = async () => {
        try {
            const supabase = createBrowserSupabaseClient()
            const { data: { user }, error } = await supabase.auth.getUser()
            
            if (error) {
                throw error
            }
            
            if (user) {
                setCurrentUser(user)
                console.log(user.user_metadata)
                setEmail(user.email || "")
            }
        } catch (error) {
            console.error("Erro ao buscar usuário atual:", error)
        }
    }

    const fetchMembers = async (page: number = 1) => {
        try {
            setLoadingMembers(true)
            
            // Adicionar um delay artificial para melhorar a experiência de carregamento
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Supabase Auth Admin API não suporta paginação diretamente
            // Então vamos buscar todos os usuários e fazer a paginação manualmente
            const { data, error } = await supabaseAdmin.auth.admin.listUsers()
            
            if (error) {
                throw error
            }
            
            const allUsers = data.users || []
            
            // Calcular o número total de páginas
            const totalCount = allUsers.length
            const calculatedTotalPages = Math.ceil(totalCount / itemsPerPage)
            setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1)
            
            // Ajustar página atual se necessário
            let adjustedPage = page
            if (page > calculatedTotalPages && calculatedTotalPages > 0) {
                adjustedPage = calculatedTotalPages
                setCurrentPage(adjustedPage)
            }
            
            // Paginar os resultados manualmente
            const startIndex = (adjustedPage - 1) * itemsPerPage
            const endIndex = startIndex + itemsPerPage
            const paginatedUsers = allUsers.slice(startIndex, endIndex)
            
            // Atualizar a lista de membros com os resultados paginados
            setMembers(paginatedUsers)
        } catch (error: any) {
            console.error("Erro ao buscar membros:", error)
            toast.error(error.message || "Erro ao buscar membros")
        } finally {
            setLoadingMembers(false)
        }
    }

    const handleAddMember = async (e: FormEvent) => {
        e.preventDefault()
        
        if (!newMemberName || !newMemberEmail) {
            toast.error("Por favor, preencha todos os campos obrigatórios.")
            return
        }

        // Verificar se o usuário atual é administrador
        if (!currentUser?.user_metadata?.role || currentUser.user_metadata.role !== "admin") {
            toast.error("Apenas administradores podem adicionar novos membros.")
            return
        }

        try {
            setLoading(true)
            const supabase = supabaseAdmin
            
            // Verificar se já existe um usuário com este email usando a API do Auth
            const { data: existingUsers } = await supabase.auth.admin.listUsers()
            const userExists = existingUsers?.users.some(user => user.email === newMemberEmail)
            
            if (userExists) {
                toast.error("Este email já está cadastrado")
                return
            }
            
            console.log('Enviando convite para:', newMemberEmail, 'com nome:', newMemberName)
            
            // Usar inviteUserByEmail com redirecionamento para página de criação de senha
            const redirectUrl = `${window.location.origin}/set-password`;
            
            // Validar e normalizar a role
            let role = newMemberRole || "";
            if (role !== "user" && role !== "admin") {
                role = "user"; // Valor padrão se não for uma role válida
            }
            
            const { data, error } = await supabase.auth.admin.inviteUserByEmail(
                newMemberEmail,
                {
                    redirectTo: redirectUrl,
                    data: {
                        display_name: newMemberName,
                        role: role,
                        email_verified: false
                    }
                }
            )
            
            if (error) {
                console.error('Erro ao enviar convite:', error)
                toast.error(error.message || "Erro ao enviar convite")
                return
            }
            
            console.log('Convite enviado com sucesso:', data)
            
            // Mostrar toast de sucesso e resetar formulário
            toast.success("Convite enviado com sucesso para o email " + newMemberEmail)
            
            // Resetar formulário e fechar o diálogo imediatamente
            setNewMemberName("")
            setNewMemberEmail("")
            setNewMemberRole("user")
            setIsDialogOpen(false)
            
            // Atualizar o email_verified conforme o status de confirmação do email
            if (data?.user?.id) {
                // Aguardar um curto período para garantir que o usuário foi criado
                const { data: userData } = await supabase.auth.admin.getUserById(data.user.id);
                if (userData?.user?.email_confirmed_at) {
                    await supabase.auth.admin.updateUserById(
                        data.user.id,
                        { 
                            user_metadata: { 
                                ...data.user.user_metadata,
                                email_verified: true 
                            } 
                        }
                    );
                }
            }
        
            toast.success("Convite enviado com sucesso para o email " + newMemberEmail)
            
            // Atualizar lista de membros
            fetchMembers(currentPage)
            
        } catch (error: any) {
            console.error("Erro ao adicionar membro:", error)
            toast.error(error.message || "Erro ao adicionar membro")
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveMember = async (id: string) => {
        if (!id) return
        
        // Verificar se o usuário atual é administrador
        if (!currentUser?.user_metadata?.role || currentUser.user_metadata.role !== "admin") {
            toast.error("Apenas administradores podem remover membros.")
            return
        }
        
        try {
            setLoading(true)
            const supabase = supabaseAdmin
            
            const { error } = await supabase.auth.admin.deleteUser(id)
            
            if (error) {
                toast.error(error.message || "Erro ao remover membro")
                return
            }
            
            // Atualizar lista de membros
            setMembers(prev => prev.filter(member => member.id !== id))
            
            toast.success("Membro removido com sucesso!")
            
            // Recarregar membros para manter consistência com a paginação
            fetchMembers(currentPage)
        } catch (error: any) {
            console.error("Erro ao remover membro:", error)
            toast.error(error.message || "Erro ao remover membro")
        } finally {
            setLoading(false)
        }
    }

    const handleEditMember = async (id: string, userData: { displayName: string, role?: string }) => {
        if (!id) return false;
        
        // Verificar se o usuário atual é administrador
        if (!currentUser?.user_metadata?.role || currentUser.user_metadata.role !== "admin") {
            toast.error("Apenas administradores podem editar membros.")
            return false;
        }
        
        try {
            setLoading(true);
            const supabase = supabaseAdmin;
            
            // Obter metadados existentes do usuário
            const { data: existingUsers } = await supabase.auth.admin.listUsers();
            const user = existingUsers?.users.find(user => user.id === id);
            
            if (!user) {
                toast.error("Usuário não encontrado");
                return false;
            }
            
            // Preparar dados para atualização mantendo os metadados existentes
            const userMetadata: Record<string, any> = { 
                ...user.user_metadata,
                display_name: userData.displayName 
            };
            
            // Validar e normalizar a role
            let role = userData.role || user.user_metadata?.role || "";
            if (role !== "user" && role !== "admin") {
                role = "user"; // Valor padrão se não for uma role válida
            }
            userMetadata.role = role;
            
            // Atualizar metadados do usuário
            const { error } = await supabase.auth.admin.updateUserById(
                id,
                { 
                    user_metadata: userMetadata
                }
            );
            
            if (error) {
                toast.error(error.message || "Erro ao atualizar usuário");
                return false;
            }
            
            // Mostrar alerta de sucesso
            toast.success("Usuário atualizado com sucesso!");
            
            // Atualizar lista de membros
            await fetchMembers(currentPage);
            
            return true;
        } catch (error: any) {
            console.error("Erro ao atualizar usuário:", error);
            toast.error(error.message || "Erro ao atualizar usuário");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleResendInviteOrResetPassword = async (email: string) => {
        if (!email) return;
        
        // Verificar se o usuário atual é administrador
        if (!currentUser?.user_metadata?.role || currentUser.user_metadata.role !== "admin") {
            toast.error("Apenas administradores podem enviar convites ou redefinir senhas.")
            return;
        }
        
        try {
            setLoading(true);
            const supabase = supabaseAdmin;
            
            // Verificar se o usuário já confirmou o email
            const { data: existingUsers } = await supabase.auth.admin.listUsers();
            const user = existingUsers?.users.find(user => user.email === email);
            
            if (!user) {
                toast.error("Usuário não encontrado");
                return;
            }
            
            // Se o usuário já confirmou o email, enviar reset de senha
            // Caso contrário, reenviar convite
            if (user.email_confirmed_at) {
                // Enviar reset de senha
                const redirectUrl = `${window.location.origin}/reset-password`;
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: redirectUrl
                });
                
                if (error) {
                    toast.error(error.message || "Erro ao enviar email de redefinição de senha");
                    return;
                }
                
                toast.success("Email para redefinição de senha enviado com sucesso!");
                
                // Atualizar o email_verified para true se confirmado
                if (user.id) {
                    await supabase.auth.admin.updateUserById(
                        user.id,
                        { 
                            user_metadata: { 
                                ...user.user_metadata,
                                email_verified: true 
                            } 
                        }
                    );
                }
            } else {
                // Reenviar convite
                const redirectUrl = `${window.location.origin}/set-password`;
                const { error } = await supabase.auth.admin.inviteUserByEmail(
                    email,
                    {
                        redirectTo: redirectUrl,
                        data: {
                            display_name: user.user_metadata?.display_name || "",
                            role: user.user_metadata?.role || "user",
                            email_verified: false
                        }
                    }
                );
                
                if (error) {
                    toast.error(error.message || "Erro ao reenviar convite");
                    return;
                }
                
                toast.success("Convite reenviado com sucesso!");
            }
        } catch (error: any) {
            console.error("Erro ao reenviar convite/reset de senha:", error);
            toast.error(error.message || "Erro ao processar solicitação");
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
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
    }
} 