import { FormEvent, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { memberService } from "../services/memberService";
import { MemberAddData, MemberUpdateData } from "../types";

/**
 * Hook para gerenciar a página de configurações
 */
export function useConfiguracoes() {
  // Estado do usuário e email
  const [email, setEmail] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Estado do formulário de adição de membros
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("user");
  
  // Estado de loading
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  // Estado dos membros
  const [members, setMembers] = useState<User[]>([]);
  
  // Estado de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(7);

  /**
   * Busca os dados iniciais ao carregar a página
   */
  useEffect(() => {
    fetchMembers(currentPage);
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  /**
   * Busca o usuário atual
   */
  const fetchCurrentUser = async () => {
    try {
      const user = await memberService.getCurrentUser();
      
      if (user) {
        setCurrentUser(user);
        setEmail(user.email || "");
      }
    } catch (error) {
      console.error("Erro ao buscar usuário atual:", error);
    }
  };

  /**
   * Busca membros com paginação
   */
  const fetchMembers = async (page: number = 1) => {
    try {
      setLoadingMembers(true);
      
      // Adicionar um delay artificial para melhorar a experiência de carregamento
      // Em testes, este atraso pode ser evitado
      if (process.env.NODE_ENV !== 'test') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const { users, totalPages: calculatedTotalPages } = await memberService.getMembers(page, itemsPerPage);
      
      // Ajustar página atual se necessário
      let adjustedPage = page;
      if (page > calculatedTotalPages && calculatedTotalPages > 0) {
        adjustedPage = calculatedTotalPages;
        setCurrentPage(adjustedPage);
      }
      
      // Atualizar a lista de membros com os resultados paginados
      setMembers(users);
      setTotalPages(calculatedTotalPages);
    } catch (error: unknown) {
      console.error("Erro ao buscar membros:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao buscar membros");
    } finally {
      setLoadingMembers(false);
    }
  };

  /**
   * Adiciona um novo membro
   */
  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!newMemberName || !newMemberEmail) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Verificar se o usuário atual é administrador
    if (!currentUser?.user_metadata?.role || currentUser.user_metadata.role !== "admin") {
      toast.error("Apenas administradores podem adicionar novos membros.");
      return;
    }

    try {
      setLoading(true);
      
      const memberData: MemberAddData = {
        name: newMemberName,
        email: newMemberEmail,
        role: newMemberRole
      };
      
      await memberService.addMember(memberData, window.location.origin);
      
      // Mostrar toast de sucesso e resetar formulário
      toast.success("Convite enviado com sucesso para o email " + newMemberEmail);
      
      // Resetar formulário e fechar o diálogo imediatamente
      setNewMemberName("");
      setNewMemberEmail("");
      setNewMemberRole("user");
      setIsDialogOpen(false);
      
      // Atualizar lista de membros
      await fetchMembers(currentPage);
    } catch (error: unknown) {
      console.error("Erro ao adicionar membro:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao adicionar membro");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove um membro
   */
  const handleRemoveMember = async (id: string) => {
    if (!id) return;
    
    // Verificar se o usuário atual é administrador
    if (!currentUser?.user_metadata?.role || currentUser.user_metadata.role !== "admin") {
      toast.error("Apenas administradores podem remover membros.");
      return;
    }
    
    try {
      setLoading(true);
      
      await memberService.removeMember(id);
      
      // Atualizar lista de membros localmente
      setMembers(prev => prev.filter(member => member.id !== id));
      
      toast.success("Membro removido com sucesso!");
      
      // Recarregar membros para manter consistência com a paginação
      await fetchMembers(currentPage);
    } catch (error: unknown) {
      console.error("Erro ao remover membro:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao remover membro");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Edita um membro existente
   */
  const handleEditMember = async (id: string, userData: MemberUpdateData): Promise<boolean> => {
    if (!id) return false;
    
    // Verificar se o usuário atual é administrador
    if (!currentUser?.user_metadata?.role || currentUser.user_metadata.role !== "admin") {
      toast.error("Apenas administradores podem editar membros.");
      return false;
    }
    
    try {
      setLoading(true);
      
      const success = await memberService.editMember(id, userData);
      
      if (success) {
        // Mostrar alerta de sucesso
        toast.success("Usuário atualizado com sucesso!");
        
        // Atualizar lista de membros
        await fetchMembers(currentPage);
        
        return true;
      }
      
      return false;
    } catch (error: unknown) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar usuário");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reenvia convite ou reseta senha de um membro
   */
  const handleResendInviteOrResetPassword = async (email: string) => {
    if (!email) return;
    
    // Verificar se o usuário atual é administrador
    if (!currentUser?.user_metadata?.role || currentUser.user_metadata.role !== "admin") {
      toast.error("Apenas administradores podem enviar convites ou redefinir senhas.");
      return;
    }
    
    try {
      setLoading(true);
      
      await memberService.resendInviteOrResetPassword(email, window.location.origin);
      
      // Encontrar o usuário na lista atual de membros para determinar a mensagem
      const user = members.find(u => u.email === email);
      
      if (user?.email_confirmed_at) {
        toast.success("Email para redefinição de senha enviado com sucesso!");
      } else {
        toast.success("Convite reenviado com sucesso!");
      }
      
      // Atualizar a lista de membros
      await fetchMembers(currentPage);
    } catch (error: unknown) {
      console.error("Erro ao reenviar convite/reset de senha:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao processar solicitação");
    } finally {
      setLoading(false);
    }
  };

  return {
    // Estado do usuário e email
    email,
    currentUser,
    
    // Estado do formulário
    isDialogOpen,
    setIsDialogOpen,
    newMemberName,
    setNewMemberName,
    newMemberEmail,
    setNewMemberEmail,
    newMemberRole,
    setNewMemberRole,
    
    // Estado de loading
    loading,
    loadingMembers,
    
    // Estado dos membros
    members,
    
    // Estado de paginação
    currentPage,
    setCurrentPage,
    totalPages,
    
    // Handlers
    handleAddMember,
    handleRemoveMember,
    handleEditMember,
    handleResendInviteOrResetPassword
  };
} 