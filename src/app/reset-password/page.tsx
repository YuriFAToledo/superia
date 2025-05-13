'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function ResetPassword() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        // Extrair o token da URL (hash)
        // O token vem após o # na URL
        if (typeof window !== 'undefined') {
            // Esperar um momento para garantir que a URL esteja totalmente carregada
            setTimeout(() => {
                const hash = window.location.hash
                console.log('Hash da URL:', hash)
                
                if (hash) {
                    const urlParams = new URLSearchParams(hash.substring(1))
                    const token = urlParams.get('access_token')
                    
                    console.log('Token encontrado:', token ? 'Sim' : 'Não')
                    
                    if (token) {
                        setAccessToken(token)
                    } else {
                        setError('Link de redefinição de senha inválido ou expirado. Solicite um novo link.')
                    }
                } else {
                    setError('Nenhum token encontrado na URL. Verifique se o link está correto.')
                }
            }, 500)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            setError('As senhas não coincidem')
            return
        }
        
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            return
        }
        
        if (!accessToken) {
            setError('Token de acesso não encontrado')
            return
        }

        try {
            setLoading(true)
            setError(null)
            
            const supabase = createBrowserSupabaseClient()
            
            console.log('Configurando sessão e obtendo dados do usuário atual...')
            
            // Configurar a sessão com o token de acesso
            await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: '',
            })
            
            // Obter os dados do usuário atual
            const { data: { user }, error: getUserError } = await supabase.auth.getUser()
            
            if (getUserError || !user) {
                console.error('Erro ao obter usuário atual:', getUserError)
                throw new Error(getUserError?.message || 'Não foi possível identificar o usuário')
            }
            
            console.log('Usuário encontrado:', user.id)
            
            // Obter metadados atuais para preservar display_name
            const displayName = user.user_metadata?.display_name
            
            console.log('Nome de exibição atual:', displayName)
            
            // Atualizar a senha do usuário, preservando o display_name
            const { data: userData, error: updateError } = await supabase.auth.updateUser({
                password: password,
                data: {
                    display_name: displayName
                }
            })
            
            if (updateError) {
                console.error('Erro ao redefinir senha:', updateError)
                throw new Error(updateError.message)
            }
            
            console.log('Senha redefinida com sucesso!')
            
            // Sucesso - senha redefinida
            setSuccess(true)
            
            // Redirecionar para o dashboard após 3 segundos
            setTimeout(() => {
                console.log('Redirecionando para /notas...')
                // Usar uma abordagem mais direta para o redirecionamento
                window.location.href = '/notas'
            }, 3000)
            
        } catch (err: any) {
            console.error('Erro ao redefinir senha:', err)
            setError(err.message || 'Ocorreu um erro ao redefinir sua senha. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="mb-8">
                <Image
                    src="/logo.svg"
                    alt="Logo Superia"
                    width={160}
                    height={40}
                    priority
                />
            </div>
            
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Redefinir Senha</CardTitle>
                    <CardDescription className="text-center">
                        Crie uma nova senha para sua conta
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                            {error}
                        </div>
                    )}
                    
                    {success ? (
                        <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-center">
                            Senha redefinida com sucesso! Redirecionando para o dashboard...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-sm font-medium">
                                        Nova senha
                                    </label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="Digite sua nova senha"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                                        Confirmar senha
                                    </label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="Confirme sua nova senha"
                                    />
                                </div>
                                
                                <Button 
                                    type="submit" 
                                    className="w-full bg-primary text-white"
                                    disabled={loading || Boolean(error) && error !== 'As senhas não coincidem' && error !== 'A senha deve ter pelo menos 6 caracteres'}
                                >
                                    {loading ? "Processando..." : "Redefinir senha"}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
                
                <CardFooter className="flex justify-center text-sm text-gray-500">
                    Esqueceu sua senha? Entre em contato com o administrador.
                </CardFooter>
            </Card>
        </div>
    )
} 