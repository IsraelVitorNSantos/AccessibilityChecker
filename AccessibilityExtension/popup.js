document.getElementById('runCheck').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["content.js"]
        });
    });
});

function calcularNota(violations) {
  let penalidade = 0;
  violations.forEach(v => {
    switch (v.impact) {
      case "critical":
        penalidade += 1.0;      // Erros críticos = penalidade total (1.0 ponto cada)
        break;
      case "serious":
        penalidade += 0.5;      // Erros sérios = 0.5 ponto cada
        break;
      case "moderate":
        penalidade += 0.25;     // Erros moderados = 0.25 ponto cada
        break;
      case "minor":
        penalidade += 0.1;      // Erros leves = 0.1 ponto cada (opcional)
        break;
    }
  });
  const nota = Math.max(0, (10 - penalidade).toFixed(1));      // A nota mínima é 0, máxima é 10
  return nota;
}


chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "accessibilityResults") {
        const violations = message.results.violations;

        const nota = calcularNota(violations);

        // Gera o HTML do relatório em português
        const reportContent = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Relatório de Acessibilidade</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                    h1, h2 { color: #333; }
                    h3 { color: #555; margin-top: 15px; }
                    p, li { color: #666; }
                    ul { margin-top: 10px; }
                    a { color: #007BFF; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <h1>Relatório de Acessibilidade</h1>

                <h2>Nota de Acessibilidade: <strong>${nota}/10</strong></h2>

                ${
                    violations.length === 0
                        ? "<p>Parabéns! Nenhum problema de acessibilidade foi encontrado.</p>"
                        : `
                            <h2>Problemas Identificados:</h2>
                            ${violations.map(violation => `
                                <div>
                                    <h3>${violation.id} - ${violation.help}</h3>
                                    <p><strong>Descrição:</strong> ${translateDescription(violation.id, violation.description)}</p>
                                    <p><strong>Impacto:</strong> ${translateImpact(violation.impact)}</p>
                                    <p><strong>Sugestão de Melhoria:</strong> Consulte 
                                        <a href="${violation.helpUrl}" target="_blank">este guia</a> 
                                        para obter mais informações sobre o problema.</p>
                                    <ul>
                                        ${violation.nodes.map(node => `
                                            <li><strong>Elemento afetado:</strong> ${node.target.join(", ")}</li>
                                        `).join("")}
                                    </ul>
                                </div>
                            `).join("")}
                        `
                }
            </body>
            </html>
        `;

        // Abre uma nova aba com o relatório
        const blob = new Blob([reportContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        chrome.tabs.create({ url });
    }
});

// Função para traduzir os impactos
function translateImpact(impact) {
    switch (impact) {
        case "critical":
            return "Crítico";
        case "serious":
            return "Sério";
        case "moderate":
            return "Moderado";
        case "minor":
            return "Leve";
        default:
            return "Desconhecido";
    }
}

// Função para traduzir descrições conhecidas
function translateDescription(id, defaultDescription) {
    const descriptions = {
        "image-alt": "Imagens devem ter texto alternativo para serem compreendidas por leitores de tela.",
        "color-contrast": "O contraste entre o texto e o plano de fundo deve ser suficiente para garantir a legibilidade.",
        "label": "Os campos de formulário devem ter rótulos para facilitar sua identificação.",
        "aria-roles": "Os elementos devem usar funções ARIA válidas para descrever seu propósito.",
        "tabindex": "Evite usar valores `tabindex` maiores que 0, pois eles podem dificultar a navegação com teclado."
        // Adicione mais traduções conforme necessário.
    };

    return descriptions[id] || defaultDescription; // Use a descrição padrão se não houver tradução.
}
