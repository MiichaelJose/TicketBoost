// storage.js - Módulo de armazenamento local

const Storage = {
  // Salva os dados coletados
  async saveData(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ collectedData: data }, () => {
        console.log('[Storage] Dados salvos:', data.length, 'mensagens');
        resolve(true);
      });
    });
  },

  // Recupera os dados coletados
  async getData() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['collectedData'], (result) => {
        resolve(result.collectedData || []);
      });
    });
  },

  // Limpa os dados
  async clearData() {
    return new Promise((resolve) => {
      chrome.storage.local.remove(['collectedData'], () => {
        console.log('[Storage] Dados limpos');
        resolve(true);
      });
    });
  },

  // Salva a última resposta da IA
  async saveResponse(response) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ lastResponse: response }, () => {
        resolve(true);
      });
    });
  },

  // Recupera a última resposta
  async getLastResponse() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['lastResponse'], (result) => {
        resolve(result.lastResponse || null);
      });
    });
  }
};
