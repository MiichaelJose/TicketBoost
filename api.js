// api.js - Módulo de integração com Gemini API

const API = {
  // Configuração da API
  config: {
    model: 'gemini-2.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    timeout: 30000, // 30 segundos
    maxRetries: 3,
    apiKey: null // Será carregada do storage
  },

  // Carrega a API key do storage
  async loadApiKey() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['geminiApiKey'], (result) => {
        this.config.apiKey = result.geminiApiKey || null;
        resolve(this.config.apiKey);
      });
    });
  },

  // Salva a API key
  async saveApiKey(key) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ geminiApiKey: key }, () => {
        this.config.apiKey = key;
        resolve(true);
      });
    });
  },

  // Função principal para enviar para Gemini com retry e timeout
  async sendToGemini(prompt) {
    if (!this.config.apiKey) {
      await this.loadApiKey();
    }

    if (!this.config.apiKey) {
      throw new Error('API Key do Gemini não configurada. Configure nas opções da extensão.');
    }

    const url = `${this.config.endpoint}/${this.config.model}:generateContent?key=${this.config.apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    };

    let lastError = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        console.log(`[API] Tentativa ${attempt}/${this.config.maxRetries}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          if (response.status === 429) {
            throw new Error('Limite de requisições atingido. Tente novamente em alguns minutos.');
          }
          
          if (response.status === 400 && errorData.error?.message?.includes('token')) {
            throw new Error('Texto muito longo. Reduza a quantidade de mensagens coletadas.');
          }

          throw new Error(errorData.error?.message || `Erro HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
          throw new Error('Resposta inválida da API Gemini');
        }

        const resultText = data.candidates[0].content.parts[0].text;
        console.log('[API] Resposta recebida com sucesso');
        
        return resultText;

      } catch (error) {
        lastError = error;
        console.error(`[API] Erro na tentativa ${attempt}:`, error.message);

        if (error.name === 'AbortError') {
          lastError = new Error('Tempo limite excedido. Verifique sua conexão.');
        }

        // Não retry em erros de autenticação ou limite
        if (error.message.includes('API Key') || 
            error.message.includes('Limite de requisições')) {
          break;
        }

        // Aguarda antes de retry (backoff simples)
        if (attempt < this.config.maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
        }
      }
    }

    throw lastError || new Error('Falha ao comunicar com a API Gemini após múltiplas tentativas.');
  },

  // Função para validar a API key
  async validateApiKey(key) {
    const testUrl = `${this.config.endpoint}/${this.config.model}:generateContent?key=${key}`;
    
    try {
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Teste de conexão' }] }]
        })
      });

      return response.ok;
    } catch {
      return false;
    }
  }
};
