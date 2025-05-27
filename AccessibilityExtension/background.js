// Esse código não afeta o usuário diretamente, mas é bom para verificar se a instalação foi bem-sucedida.
chrome.runtime.onInstalled.addListener(() => {
    console.log("Accessibility Checker Installed!"); // Quando a extensão é instalada pela primeira vez, ela mostra essa mensagem no console do navegador (área de desenvolvedor).
});
