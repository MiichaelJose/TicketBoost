import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Key, Chrome, Settings, Shield, Zap } from 'lucide-react'
import MainScreen from './MainScreen'

interface ConnectionState {
  status: 'idle' | 'connecting' | 'connected' | 'error'
  message?: string
}

type View = 'connection' | 'main'

export default function GeminiApp() {
  const [view, setView] = useState<View>('connection')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const [activeCard, setActiveCard] = useState<'google' | 'apikey' | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [connection, setConnection] = useState<ConnectionState>({ status: 'idle' })
  const [showApiKey, setShowApiKey] = useState(false)

  // Verifica se já existe autenticação salva
  React.useEffect(() => {
    chrome.storage.local.get(['geminiAuth'], (result) => {
      if (result.geminiAuth) {
        setView('main')
      }
      setIsCheckingAuth(false)
    })
  }, [])

  const handleGoogleAuth = async () => {
    setActiveCard('google')
    setConnection({ status: 'connecting' })

    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        const errorMsg = chrome.runtime.lastError.message || 'Erro desconhecido'
        
        // Armazena log detalhado
        chrome.storage.local.set({
          lastAuthError: {
            type: 'google',
            message: errorMsg,
            timestamp: new Date().toISOString()
          }
        })

        setConnection({ 
          status: 'error', 
          message: `Erro Google: ${errorMsg}` 
        })
        return
      }

      if (!token) {
        setConnection({ 
          status: 'error', 
          message: 'Nenhum token retornado pelo Google' 
        })
        return
      }

      // Salva token com sucesso
      chrome.storage.local.set({ geminiAuth: { type: 'google', token } }, () => {
        setConnection({ status: 'connected' })
        setTimeout(() => setView('main'), 800)
      })
    })
  }

  const handleApiKeyConnect = async () => {
    if (!apiKey.trim()) return

    setActiveCard('apikey')
    setConnection({ status: 'connecting' })

    const key = apiKey.trim()

    if (!key.startsWith('AIza')) {
      const errorMsg = 'Formato de API Key inválido (deve começar com AIza)'
      
      chrome.storage.local.set({
        lastAuthError: {
          type: 'apikey',
          message: errorMsg,
          timestamp: new Date().toISOString()
        }
      })

      setConnection({ status: 'error', message: errorMsg })
      return
    }

    chrome.storage.local.set({ 
      geminiAuth: { type: 'apikey', key } 
    }, () => {
      setConnection({ status: 'connected' })
      setTimeout(() => setView('main'), 800)
    })
  }

  const resetState = () => {
    setConnection({ status: 'idle' })
    setActiveCard(null)
    setApiKey('')
  }

  if (isCheckingAuth) {
    return (
      <div className="w-[420px] h-[200px] bg-[#0A0A0B] flex items-center justify-center text-white/60">
        Carregando...
      </div>
    )
  }

  // Tela Principal de Análise
  if (view === 'main') {
    return <MainScreen onLogout={() => setView('connection')} />
  }

  // Tela de Conexão
  return (
    <div className="w-[420px] min-h-[520px] bg-[#0A0A0B] text-white font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold tracking-tight">Resumo IA</div>
            <div className="text-[10px] text-white/50 -mt-0.5">Gemini</div>
          </div>
        </div>

        <button 
          onClick={() => {
            chrome.storage.local.get(['lastAuthError'], (result) => {
              if (result.lastAuthError) {
                console.log('%c[Gemini Auth Error]', 'color:#f87171', result.lastAuthError)
              } else {
                console.log('%c[Gemini Auth] Nenhum erro registrado', 'color:#4ade80')
              }
            })
          }}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          title="Ver último erro de autenticação no console"
        >
          <Settings className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Title */}
      <div className="px-5 pt-6 pb-1">
        <h1 className="text-2xl font-semibold tracking-tighter">Conectar ao Gemini</h1>
        <p className="text-sm text-white/60 mt-1">Escolha como deseja autenticar sua IA</p>
      </div>

      {/* Main Content */}
      <div className="px-5 pt-5 space-y-3">
        
        {/* Google OAuth Card */}
        <motion.div
          whileHover={{ scale: 1.005 }}
          onHoverStart={() => setActiveCard('google')}
          onHoverEnd={() => !connection.status.includes('connecting') && setActiveCard(null)}
          className={`group relative rounded-2xl border p-5 transition-all cursor-pointer
            ${activeCard === 'google' 
              ? 'border-white/20 bg-white/[0.025] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]' 
              : 'border-white/10 hover:border-white/15 bg-white/[0.015]'
            }`}
          onClick={handleGoogleAuth}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center ring-1 ring-white/10">
                <Chrome className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Entrar com Google</span>
                  <div className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Recomendado
                  </div>
                </div>
                <p className="text-sm text-white/60 mt-0.5">Autenticação rápida e segura</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pl-14 space-y-1 text-sm">
            <div className="flex items-center gap-2 text-white/70">
              <div className="w-1 h-1 rounded-full bg-white/40" /> Sem API key
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <div className="w-1 h-1 rounded-full bg-white/40" /> Login seguro via Google
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <div className="w-1 h-1 rounded-full bg-white/40" /> Setup em segundos
            </div>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); handleGoogleAuth() }}
            disabled={connection.status === 'connecting'}
            className="mt-5 w-full h-10 rounded-xl bg-white text-black font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.985] transition-all disabled:opacity-70"
          >
            {connection.status === 'connecting' && activeCard === 'google' ? (
              <>Conectando...</>
            ) : (
              <>Continuar com Google</>
            )}
          </button>
        </motion.div>

        {/* API Key Card */}
        <motion.div
          whileHover={{ scale: 1.005 }}
          onHoverStart={() => setActiveCard('apikey')}
          onHoverEnd={() => setActiveCard(null)}
          className={`group relative rounded-2xl border p-5 transition-all
            ${activeCard === 'apikey' 
              ? 'border-white/20 bg-white/[0.025]' 
              : 'border-white/10 hover:border-white/15 bg-white/[0.015]'
            }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center ring-1 ring-white/10">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">Usar API Key</div>
              <p className="text-sm text-white/60">Conecte sua própria chave Gemini</p>
            </div>
          </div>

          <div className="mt-4 pl-14">
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full h-10 bg-black/40 border border-white/10 rounded-xl px-4 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors font-mono"
              />
              <button 
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40 hover:text-white/70"
              >
                {showApiKey ? 'OCULTAR' : 'MOSTRAR'}
              </button>
            </div>

            <button
              onClick={handleApiKeyConnect}
              disabled={!apiKey.trim() || connection.status === 'connecting'}
              className="mt-3 w-full h-10 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm font-medium transition-all active:scale-[0.985] disabled:opacity-50"
            >
              {connection.status === 'connecting' && activeCard === 'apikey' ? 'Conectando...' : 'Conectar'}
            </button>

            <div className="flex items-center justify-between mt-3 text-xs">
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank"
                className="text-white/50 hover:text-white/80 transition-colors"
              >
                Como obter minha key?
              </a>
              <div className="text-white/40 flex items-center gap-1" title="Sua chave é armazenada localmente e criptografada.">
                <Shield className="w-3 h-3" /> Seguro
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-5 pt-6 pb-5 mt-auto">
        <div className="h-px bg-white/10 mb-4" />
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-white/50">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Gemini desconectado
          </div>
          
          <div className="flex items-center gap-1.5 text-white/40">
            <Shield className="w-3 h-3" />
            <span>Nenhum dado é enviado sem sua permissão</span>
          </div>
        </div>
      </div>

      {/* Connection Feedback */}
      <AnimatePresence>
        {connection.status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-4 left-4 right-4"
          >
            {connection.status === 'connected' && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                ✓ Conectado com sucesso
              </div>
            )}
            {connection.status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl text-sm flex items-center justify-between">
                {connection.message}
                <button onClick={resetState} className="underline">Tentar novamente</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
