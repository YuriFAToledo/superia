import { createBrowserSupabaseClient, supabaseAdmin } from "@/shared/lib/supabase";
import { User } from "@supabase/supabase-js";
import { MemberAddData, MemberUpdateData } from "../types";

/**
 * Serviço para gerenciar operações relacionadas a membros
 */
export const memberService = {
  /**
   * Busca o usuário atual
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      return user;
    } catch (error) {
      console.error("Erro ao buscar usuário atual:", error);
      return null;
    }
  },

  /**
   * Busca a lista de membros com paginação
   */
  getMembers: async (page: number, itemsPerPage: number): Promise<{
    users: User[],
    totalPages: number
  }> => {
    try {
      // Supabase Auth Admin API não suporta paginação diretamente
      // Então vamos buscar todos os usuários e fazer a paginação manualmente
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      
      if (error) {
        throw error;
      }
      
      const allUsers = data.users || [];
      
      // Calcular o número total de páginas
      const totalCount = allUsers.length;
      const totalPages = Math.ceil(totalCount / itemsPerPage);
      
      // Paginar os resultados manualmente
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedUsers = allUsers.slice(startIndex, endIndex);
      
      return {
        users: paginatedUsers,
        totalPages: totalPages > 0 ? totalPages : 1
      };
    } catch (error) {
      console.error("Erro ao buscar membros:", error);
      throw error;
    }
  },

  /**
   * Adiciona um novo membro ao sistema
   */
  addMember: async (memberData: MemberAddData, origin: string): Promise<User> => {
    try {
      const supabase = supabaseAdmin;
      
      // Verificar se já existe um usuário com este email
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const userExists = existingUsers?.users.some(user => user.email === memberData.email);
      
      if (userExists) {
        throw new Error("Este email já está cadastrado");
      }
      
      // Usar inviteUserByEmail com redirecionamento para página de criação de senha
      const redirectUrl = `${origin}/set-password`;
      
      // Validar e normalizar a role
      let role = memberData.role || "";
      if (role !== "user" && role !== "admin") {
        role = "user"; // Valor padrão se não for uma role válida
      }
      
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(
        memberData.email,
        {
          redirectTo: redirectUrl,
          data: {
            display_name: memberData.name,
            role: role,
            email_verified: false
          }
        }
      );
      
      if (error) {
        throw error;
      }
      
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
      
      return data.user;
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
      throw error;
    }
  },

  /**
   * Remove um membro do sistema
   */
  removeMember: async (id: string): Promise<void> => {
    try {
      const supabase = supabaseAdmin;
      
      const { error } = await supabase.auth.admin.deleteUser(id);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      throw error;
    }
  },

  /**
   * Edita um membro existente
   */
  editMember: async (id: string, userData: MemberUpdateData): Promise<boolean> => {
    try {
      const supabase = supabaseAdmin;
      
      // Obter metadados existentes do usuário
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const user = existingUsers?.users.find(user => user.id === id);
      
      if (!user) {
        throw new Error("Usuário não encontrado");
      }
      
      // Preparar dados para atualização mantendo os metadados existentes
      const userMetadata: Record<string, unknown> = { 
        ...user.user_metadata,
        display_name: userData.displayName 
      };
      
      // Validar e normalizar a role
      if (userData.role) {
        let role = userData.role || user.user_metadata?.role || "";
        if (role !== "user" && role !== "admin") {
          role = "user"; // Valor padrão se não for uma role válida
        }
        userMetadata.role = role;
      }
      
      // Atualizar metadados do usuário
      const { error } = await supabase.auth.admin.updateUserById(
        id,
        { 
          user_metadata: userMetadata
        }
      );
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  },

  /**
   * Reenvia convite ou reseta senha de um membro
   */
  resendInviteOrResetPassword: async (email: string, origin: string): Promise<void> => {
    try {
      const supabase = supabaseAdmin;
      
      // Verificar se o usuário já confirmou o email
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const user = existingUsers?.users.find(user => user.email === email);
      
      if (!user) {
        throw new Error("Usuário não encontrado");
      }
      
      // Se o usuário já confirmou o email, enviar reset de senha
      // Caso contrário, reenviar convite
      if (user.email_confirmed_at) {
        // Enviar reset de senha
        const redirectUrl = `${origin}/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl
        });
        
        if (error) {
          throw error;
        }
        
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
        const redirectUrl = `${origin}/set-password`;
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
          throw error;
        }
      }
    } catch (error) {
      console.error("Erro ao reenviar convite/reset de senha:", error);
      throw error;
    }
  }
}; 