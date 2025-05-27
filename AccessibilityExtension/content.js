(async function () {
    const results = await axe.run(); // Espera o axe.run() rodar — isso verifica o site procurando problemas de acessibilidade.
    chrome.runtime.sendMessage({ type: "accessibilityResults", results }); // Envia os resultados para a extensão, para que possam ser exibidos para o usuário.
})();
/*
axe.run() vem da biblioteca axe-core, que é especialista em identificar problemas como:
    •   Falta de legenda em imagens
    •   Textos com pouco contraste
    •   Falta de rótulos em formulários
    •   Navegação ruim para quem usa teclado
*/