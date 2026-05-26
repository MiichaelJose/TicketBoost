import React, { useState } from 'react'

interface Message {
  id: number
  text: string
}

interface MainScreenProps {
  onLogout: () => void
}

export default function MainScreen({ onLogout }: MainScreenProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isCollecting, setIsCollecting] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState('')
  const [status, setStatus] = useState('')

  const collectMessages = async () => {
    setIsCollecting(true)
    setStatus('Coletando mensagens...')

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      if (!tab?.id) {
        setStatus('Nenhuma aba ativa encontrada')
        setIsCollecting(false)
        return
      }

      const response = await chrome.tabs.sendMessage(tab.id, { action: 'collectMessages' })

      if (response?.success) {
        setMessages(response.messages || [])
        setStatus(`${response.messages?.length || 0} mensagens coletadas`)
        
        // Salva no storage
        chrome.storage.local.set({ collectedMessages: response.messages })
      } else {
        setStatus('Erro ao coletar mensagens')
      }
    } catch (error) {
      setStatus('Erro ao comunicar com a página')
    } finally {
      setIsCollecting(false)
    }
  }

  const sendToGemini = async () => {
    if (messages.length === 0) {
      setStatus('Nenhuma mensagem coletada')
      return
    }

    setIsSending(true)
    setStatus('Enviando para Gemini...')

    try {
      // Recupera a chave
      const auth = await chrome.storage.local.get(['geminiAuth'])
      const authData = auth.geminiAuth

      if (!authData) {
        setStatus('Autenticação não encontrada')
        setIsSending(false)
        return
      }

      let apiKey = ''
      if (authData.type === 'apikey') {
        apiKey = authData.key
      } else {
        setStatus('OAuth ainda não suportado na tela principal')
        setIsSending(false)
        return
      }

      // Monta o prompt
      const conversationText = messages
        .map((msg, i) => `[${i + 1}] ${msg.text}`)
        .join('\n\n')

      const prompt = `Analise a conversa abaixo e gere um resumo técnico estruturado.

Conversa:
${conversationText}`

      // Chama a API do Gemini
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      )

      const data = await response.json()

      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const summary = data.candidates[0].content.parts[0].text
        setResult(summary)
        setStatus('Resumo gerado com sucesso!')
        
        // Salva o resultado
        chrome.storage.local.set({ lastSummary: summary })
      } else {
        setStatus('Erro ao gerar resumo')
      }
    } catch (error) {
      setStatus('Erro na comunicação com a API')
    } finally {
      setIsSending(false)
    }
  }

  const copyResult = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setStatus('Copiado para a área de transferência!')
    setTimeout(() => setStatus(''), 2000)
  }

  const clearAll = () => {
    setMessages([])
    setResult('')
    setStatus('')
    chrome.storage.local.remove(['collectedMessages', 'lastSummary'])
  }

  return (
    <div className="w-[420px] min-h-[520px] bg-[#0A0A0B] text-white p-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Resumo IA</h1>
        <button 
          onClick={onLogout}
          className="text-sm text-white/60 hover:text-white"
        >
          Sair
        </button>
      </div>

      {/* Status */}
      {status && (
        <div className="mb-4 px-3 py-2 bg-white/5 rounded-lg text-sm text-white/80">
          {status}
        </div>
      )}

      {/* Botões de Ação */}
      <div className="space-y-3">
        <button
          onClick={collectMessages}
          disabled={isCollecting}
          className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 font-medium disabled:opacity-50"
        >
          {isCollecting ? 'Coletando...' : '📥 Coletar Mensagens'}
        </button>

        <button
          onClick={sendToGemini}
          disabled={isSending || messages.length === 0}
          className="w-full h-11 rounded-xl bg-white text-black font-medium disabled:opacity-50"
        >
          {isSending ? 'Enviando para Gemini...' : '🚀 Enviar para IA'}
        </button>
      </div>

      {/* Contador */}
      <div className="mt-4 text-center text-sm text-white/60">
        {messages.length} mensagens coletadas
      </div>

      {/* Resultado */}
      {result && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-white/80">Resumo Gerado</span>
            <button 
              onClick={copyResult}
              className="text-xs px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20"
            >
              Copiar
            </button>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm whitespace-pre-wrap max-h-[280px] overflow-y-auto">
            {result}
          </div>
        </div>
      )}

      {/* Botão Limpar */}
      {(messages.length > 0 || result) && (
        <button
          onClick={clearAll}
          className="mt-4 w-full text-sm text-white/50 hover:text-white/80"
        >
          Limpar tudo
        </button>
      )}
    </div>
  )
}
