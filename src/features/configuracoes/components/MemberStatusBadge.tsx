import { User } from "@supabase/supabase-js";

interface MemberStatusBadgeProps {
  member: User;
}

export function MemberStatusBadge({ member }: MemberStatusBadgeProps) {
  const isConfirmed = Boolean(member.email_confirmed_at);

  return (
    <span className={isConfirmed ? "text-green-500" : "text-yellow-500"}>
      {isConfirmed ? "Ativo" : "Pendente"}
    </span>
  );
} 