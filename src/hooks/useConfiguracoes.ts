import { createBrowserSupabaseClient, supabaseAdmin } from "@/lib/supabase"
import { FormEvent, useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"

type AlertMessage = {
    message: string;
    type: 'success' | 'error';
};

export function useConfiguracoes() {
    const [email, setEmail] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newMemberName, setNewMemberName] = useState("")
    const [newMemberEmail, setNewMemberEmail] = useState("")
    const [newMemberRole, setNewMemberRole] = useState("Administrador")
    const [loading, setLoading] = useState(false)
    const [loadingMembers, setLoadingMembers] = useState(false)
    const [alert, setAlert] = useState<AlertMessage | null>(null)
    const [members, setMembers] = useState<User[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null)

    // Buscar membros ao carregar a página
    useEffect(() => {
        fetchMembers()
        fetchCurrentUser()
    }, [])

    // Limpar alerta após 3 segundos
    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => {
                setAlert(null)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [alert])

    // Função auxiliar para mostrar alertas
    const showAlert = (message: string, type: 'success' | 'error') => {
        setAlert({ message, type })
    }

    const fetchCurrentUser = async () => {
        try {
            const supabase = createBrowserSupabaseClient()
            const { data: { user }, error } = await supabase.auth.getUser()
            
            if (error) {
                throw error
            }
            
            if (user) {
                setCurrentUser(user)
                console.log(user.user_metadata.display_name)
                setEmail(user.email || "")
            }
        } catch (error) {
            console.error("Erro ao buscar usuário atual:", error)
        }
    }

    const fetchMembers = async () => {
        try {
            setLoadingMembers(true)
            
            const { data, error } = await supabaseAdmin.auth.admin.listUsers()
            
            if (error) {
                throw error
            }
            
            setMembers(data.users || [])
        } catch (error: any) {
            console.error("Erro ao buscar membros:", error)
            showAlert(error.message || "Erro ao buscar membros", "error")
        } finally {
            setLoadingMembers(false)
        }
    }

    const handleAddMember = async (e: FormEvent) => {
        e.preventDefault()
        
        if (!newMemberName || !newMemberEmail) {
            showAlert("Por favor, preencha todos os campos obrigatórios.", "error")
            return
        }

        try {
            setLoading(true)
            const supabase = supabaseAdmin
            
            // Verificar se já existe um usuário com este email usando a API do Auth
            const { data: existingUsers } = await supabase.auth.admin.listUsers()
            const userExists = existingUsers?.users.some(user => user.email === newMemberEmail)
            
            if (userExists) {
                showAlert("Este email já está cadastrado", "error")
                return
            }
            
            console.log('Enviando convite para:', newMemberEmail, 'com nome:', newMemberName)
            
            // Usar inviteUserByEmail com redirecionamento para página de criação de senha
            const redirectUrl = `${window.location.origin}/set-password`;
            const { data, error } = await supabase.auth.admin.inviteUserByEmail(
                newMemberEmail,
                {
                    redirectTo: redirectUrl,
                    data: {
                        display_name: newMemberName,
                        role: newMemberRole
                    }
                }
            )
            
            if (error) {
                console.error('Erro ao enviar convite:', error)
                showAlert(error.message || "Erro ao enviar convite", "error")
                return
            }
            
            console.log('Convite enviado com sucesso:', data)
            
            // Se precisar, salvar informações adicionais do usuário em outra tabela
            // await supabase
            //     .from('users_metadata')
            //     .insert([{ user_id: data.user.id, tenant_id: 'sua_organizacao' }])
            
            showAlert("Convite enviado com sucesso para o email " + newMemberEmail, "success")
            
            // Atualizar lista de membros
            fetchMembers()
            
            // Resetar formulário
            setNewMemberName("")
            setNewMemberEmail("")
            setNewMemberRole("Administrador")
            setIsDialogOpen(false)
            
        } catch (error: any) {
            console.error("Erro ao adicionar membro:", error)
            showAlert(error.message || "Erro ao adicionar membro", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveMember = async (id: string) => {
        if (!id) return
        
        if (!confirm("Tem certeza que deseja remover este membro?")) {
            return
        }
        
        try {
            setLoading(true)
            const supabase = supabaseAdmin
            
            const { error } = await supabase.auth.admin.deleteUser(id)
            
            if (error) {
                showAlert(error.message || "Erro ao remover membro", "error")
                return
            }
            
            // Atualizar lista de membros
            setMembers(prev => prev.filter(member => member.id !== id))
            
            showAlert("Membro removido com sucesso!", "success")
        } catch (error: any) {
            console.error("Erro ao remover membro:", error)
            showAlert(error.message || "Erro ao remover membro", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleEditMember = async (id: string, userData: { displayName: string }) => {
        if (!id) return false;
        
        try {
            setLoading(true);
            const supabase = supabaseAdmin;
            
            // Atualizar metadados do usuário
            const { error } = await supabase.auth.admin.updateUserById(
                id,
                { 
                    user_metadata: { display_name: userData.displayName }
                }
            );
            
            if (error) {
                showAlert(error.message || "Erro ao atualizar usuário", "error");
                return false;
            }
            
            // Atualizar lista de membros
            await fetchMembers();
            
            showAlert("Usuário atualizado com sucesso!", "success");
            return true;
        } catch (error: any) {
            console.error("Erro ao atualizar usuário:", error);
            showAlert(error.message || "Erro ao atualizar usuário", "error");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleResendInviteOrResetPassword = async (email: string) => {
        if (!email) return;
        
        try {
            setLoading(true);
            const supabase = supabaseAdmin;
            
            // Verificar se o usuário já confirmou o email
            const { data: existingUsers } = await supabase.auth.admin.listUsers();
            const user = existingUsers?.users.find(user => user.email === email);
            
            if (!user) {
                showAlert("Usuário não encontrado", "error");
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
                    showAlert(error.message || "Erro ao enviar email de redefinição de senha", "error");
                    return;
                }
                
                showAlert("Email para redefinição de senha enviado com sucesso!", "success");
            } else {
                // Reenviar convite
                const redirectUrl = `${window.location.origin}/set-password`;
                const { error } = await supabase.auth.admin.inviteUserByEmail(
                    email,
                    {
                        redirectTo: redirectUrl,
                        data: {
                            display_name: user.user_metadata?.display_name || "",
                            role: user.role || "Administrador"
                        }
                    }
                );
                
                if (error) {
                    showAlert(error.message || "Erro ao reenviar convite", "error");
                    return;
                }
                
                showAlert("Convite reenviado com sucesso!", "success");
            }
        } catch (error: any) {
            console.error("Erro ao reenviar convite/reset de senha:", error);
            showAlert(error.message || "Erro ao processar solicitação", "error");
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
        alert,
        members,
        currentUser,
        handleAddMember,
        handleRemoveMember,
        handleEditMember,
        handleResendInviteOrResetPassword
    }
} 