'use client'

import Link from 'next/link'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function Navbar() {
  const { user, signOut, loading } = useAuth()
  
  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-xl font-bold">
                Superia
              </Link>
            </div>
            <nav className="ml-6 flex items-center space-x-4">
              <Link href="/" className="px-3 py-2 text-gray-700 hover:text-blue-600">
                Início
              </Link>
              {user && (
                <Link href="/" className="px-3 py-2 text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
          
          <div className="flex items-center">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">
                      {user.email}
                    </span>
                    <button
                      onClick={() => signOut()}
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
                    >
                      Sair
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link 
                      href="/" 
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
                    >
                      Entrar
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 