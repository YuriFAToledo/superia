'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SelectTrigger } from "@radix-ui/react-select"
import { TextSearch, FileClock, Search, ChevronDown, Plus, Circle } from "lucide-react"
import { useState } from "react"

export default function NotasFiscais() {
    const [email, setEmail] = useState("")

    return (
        <div className="w-full h-screen flex flex-col pt-20 pl-6 pr-16 gap-6">
            <h1 className="text-2xl font-semibold text-black">
                Configuração
            </h1>
            <div className="flex mt-1 gap-4 w-full">
                <div className="flex items-start justify-between gap-2 w-3/4">
                    <h2 className="text-xl font-medium text-dark-gray">
                        Membros
                    </h2>
                    <Button className="bg-primary text-white rounded-4xl !px-10">
                        <Plus size={18} />
                        Adicionar membro
                    </Button>
                </div>
                <div >
                    <Card className="w-96 shadow-none">
                        <CardContent className="p-8 flex flex-col items-center">
                            <div className="flex flex-col gap-4 w-full">
                                <Avatar className="w-[100px] h-[100px] bg-[#D9D9D9]" />

                                <div className="flex flex-col gap-1">
                                    <h2 className="font-semibold text-indigo-900 text-xl">
                                        {"{Nome do usuário}"}
                                    </h2>
                                    <p className="font-medium text-indigo-900 text-sm">
                                        Administrador
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 w-full mt-2">
                                    <div className="flex flex-col items-start justify-between text-sm mb-1">
                                        <span className="text-campos font-light text-sm">{"carol@superia.com"}</span>
                                        <button className="text-green-500 text-xs font-medium">
                                            Editar email
                                        </button>
                                        <Separator className="mt-1" />
                                    </div>

                                    <div className="flex flex-col items-start justify-between text-sm">
                                        <span className="text-campos font-light text-sm">Última alteração de senha há 3 anos</span>
                                        <button className="text-green-500 text-xs font-medium">
                                            Alterar senha
                                        </button>
                                        <Separator className="mt-1" />
                                    </div>

                                    <Button className="w-full mt-4 bg-secondary text-white rounded-3xl hover:opacity-90 hover:bg-secondary">
                                        Fazer logout
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}