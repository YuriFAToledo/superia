'use client'

import { FileText, FolderClock, Settings2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import NavItem from "../ui/nav-item"



const NavItems = [
    { label: 'Notas fiscais', href: '/notas', icon: FileText },
    { label: 'Histórico', href: '/historico', icon: FolderClock },
    { label: 'Configurações', href: '/configuracoes', icon: Settings2 },
]

export default function Sidebar() {
    const pathname = usePathname() || '/'

    return (
        <div className="h-screen w-[274px] border-r bg-white">
            <div className="flex h-full flex-col p-3.5">
                {/* Logo */}
                <div className="flex items-center justify-center mt-12">
                    <Link href="/notas">
                        <img src="/logo.svg" alt="Superia" className="w-36 h-7" />
                    </Link>
                </div>

                <Separator className="my-6 opacity-0" />

                {/* Menu de Navegação */}
                <nav className="flex-1 space-y-3 mt-10">
                    {NavItems.map((item) => (
                        <NavItem
                            key={item.href}
                            label={item.label}
                            href={item.href}
                            icon={item.icon}
                            isActive={pathname === item.href}
                        />
                    ))}
                </nav>
            </div>
        </div>
    )
}