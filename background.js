// background.js - Service Worker para comunicação e lógica de fundo

console.log('[Background] Service Worker iniciado');

// Listener para mensagens
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Background] Mensagem recebida:', request);

  if (request.action === 'log') {
    console.log('[Background Log]', request.message);
    sendResponse({ success: true });
  }

  return true;
});

// Verifica se a extensão foi instalada/atualizada
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[Background] Extensão instalada pela primeira vez');
    
    // Abre página de configuração inicial (futuro)
    // chrome.tabs.create({ url: 'options.html' });
  }
});

// Mantém o service worker vivo (Manifest V3)
chrome.runtime.onConnect.addListener(() => {
  console.log('[Background] Conexão estabelecida');
});
