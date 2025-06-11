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
        "accesskeys": "Garante que cada valor do atributo accesskey seja único",
        "aria-allowed-attr": "Garante que atributos ARIA sejam permitidos para a função de um elemento",
        "aria-allowed-role": "Garante que o atributo role tenha um valor apropriado para o elemento",
        "aria-command-name": "Garante que cada botão, link e item de menu ARIA tenha um nome acessível",
        "aria-conditional-attr": "Garante que os atributos ARIA sejam usados conforme necessário para uma função",
        "aria-deprecated-role": "Garante que atributos ARIA não sejam usados em funções onde estão obsoletos",
        "aria-hidden-body": "Garante que aria-hidden='true' não esteja presente no corpo do documento",
        "aria-hidden-focus": "Garante que elementos com aria-hidden='true' não sejam focalizáveis",
        "aria-input-field-name": "Garante que cada campo de entrada ARIA tenha um nome acessível",
        "aria-meter-name": "Garante que cada nó de medidor ARIA tenha um nome acessível",
        "aria-progressbar-name": "Garante que cada nó de barra de progresso ARIA tenha um nome acessível",
        "aria-prohibited-attr": "Garante que atributos ARIA não sejam proibidos para a função de um elemento",
        "aria-required-attr": "Garante que elementos com funções ARIA tenham todos os atributos ARIA necessários",
        "aria-required-children": "Garante que elementos com uma função ARIA que requerem funções filhas as contenham",
        "aria-required-parent": "Garante que elementos com uma função ARIA que requerem funções pais estejam contidos por elas",
        "aria-roledescription": "Garante que aria-roledescription seja usado apenas em elementos com uma função semântica",
        "aria-roles": "Garante que todos os elementos com um atributo role usem um valor válido",
        "aria-text": "Garante que os atributos 'aria-text' sejam usados corretamente",
        "aria-toggle-field-name": "Garante que cada campo de alternância ARIA tenha um nome acessível",
        "aria-tooltip-name": "Garante que cada dica de ferramenta ARIA tenha um nome acessível",
        "aria-treeitem-name": "Garante que cada nó de item de árvore ARIA tenha um nome acessível",
        "aria-valid-attr-value": "Garante que todos os atributos ARIA tenham valores válidos",
        "aria-valid-attr": "Garante que os atributos que começam com 'aria-' sejam atributos ARIA válidos",
        "audio-caption": "Garante que elementos &lt;audio&gt; tenham legendas",
        "autocomplete-valid": "Garante que o atributo autocomplete esteja correto e seja adequado para o campo do formulário",
        "avoid-inline-spacing": "Garante que o espaçamento de texto definido através de atributos de estilo possa ser ajustado com folhas de estilo personalizadas",
        "blink": "Garante que elementos &lt;blink&gt; não sejam usados",
        "button-name": "Garante que os botões tenham texto discernível",
        "bypass": "Garante que cada página tenha pelo menos um mecanismo para o usuário contornar a navegação e ir direto para o conteúdo",
        "color-contrast": "Garante que o contraste entre as cores de primeiro plano e de fundo atenda aos limites de taxa de contraste AA do WCAG 2",
        "color-contrast-enhanced": "Garante que o contraste entre as cores de primeiro plano e de fundo atenda aos limites de taxa de contraste AAA do WCAG 2",
        "css-orientation-lock": "Garante que o conteúdo não seja bloqueado para uma orientação de exibição específica e que o conteúdo seja operável em todas as orientações de exibição",
        "definition-list": "Garante que elementos &lt;dl&gt; sejam estruturados corretamente",
        "dlitem": "Garante que elementos &lt;dt&gt; e &lt;dd&gt; estejam contidos por um &lt;dl&gt;",
        "document-title": "Garante que cada documento HTML contenha um elemento &lt;title&gt; não vazio",
        "duplicate-id-active": "Garante que cada valor do atributo id de elementos ativos seja único",
        "duplicate-id-aria": "Garante que cada valor do atributo id usado em ARIA e em rótulos seja único",
        "duplicate-id": "Garante que cada valor do atributo id seja único",
        "empty-heading": "Garante que os cabeçalhos tenham texto discernível",
        "empty-table-header": "Garante que os cabeçalhos das tabelas tenham texto discernível",
        "focus-order-semantics": "Garante que os elementos na ordem de foco tenham uma função apropriada para conteúdo interativo",
        "form-field-multiple-labels": "Garante que os campos de formulário não tenham múltiplos elementos de rótulo",
        "frame-focusable-content": "Garante que elementos &lt;frame&gt; e &lt;iframe&gt; com conteúdo focalizável não tenham tabindex='-1'",
        "frame-title-unique": "Garante que os elementos &lt;iframe&gt; e &lt;frame&gt; contenham um atributo de título único",
        "frame-title": "Garante que os elementos &lt;iframe&gt; e &lt;frame&gt; tenham um nome acessível",
        "heading-order": "Garante que a ordem dos cabeçalhos seja semanticamente correta",
        "hidden-content": "Informa os usuários sobre conteúdo oculto que não é legível por leitores de tela",
        "html-has-lang": "Garante que cada documento HTML tenha um atributo lang",
        "html-lang-valid": "Garante que o atributo lang do elemento &lt;html&gt; tenha um valor válido",
        "html-xml-lang-mismatch": "Garante que os elementos HTML com atributos lang e xml:lang válidos concordem no idioma base da página",
        "image-alt": "Garante que elementos &lt;img&gt; tenham texto alternativo ou uma função 'none' ou 'presentation'",
        "image-redundant-alt": "Garante que o texto alternativo da imagem não seja repetido como texto",
        "input-button-name": "Garante que os botões de entrada tenham texto discernível",
        "input-image-alt": "Garante que elementos &lt;input type='image'&gt; tenham texto alternativo",
        "label-content-name-mismatch": "Garante que os elementos rotulados por meio de seu conteúdo tenham seu texto visível como parte de seu nome acessível",
        "label-in-name": "Garante que o nome acessível de um campo de formulário contenha o texto de todos os rótulos visíveis",
        "label": "Garante que cada elemento de formulário tenha um rótulo",
        "landmark-banner-is-top-level": "Garante que o marco de banner esteja no nível superior da página",
        "landmark-complementary-is-top-level": "Garante que o marco complementar ou 'aside' esteja no nível superior da página",
        "landmark-contentinfo-is-top-level": "Garante que o marco de informações de conteúdo esteja no nível superior da página",
        "landmark-main-is-top-level": "Garante que o marco principal esteja no nível superior da página",
        "landmark-no-duplicate-banner": "Garante que o documento tenha no máximo um marco de banner",
        "landmark-no-duplicate-contentinfo": "Garante que o documento tenha no máximo um marco de informações de conteúdo",
        "landmark-no-duplicate-main": "Garante que o documento tenha no máximo um marco principal",
        "landmark-one-main": "Garante que o documento tenha um marco principal",
        "landmark-unique": "Os marcos devem ter uma função ou combinação de função/rótulo/título (ou seja, nome acessível) única",
        "link-in-text-block": "Garante que os links sejam distintos do texto ao redor de uma forma que não dependa da cor",
        "link-name": "Garante que os links tenham texto discernível",
        "list": "Garante que as listas sejam estruturadas corretamente",
        "listitem": "Garante que elementos &lt;li&gt; sejam usados semanticamente",
        "marquee": "Garante que elementos &lt;marquee&gt; não sejam usados",
        "meta-refresh": "Garante que &lt;meta http-equiv='refresh'&gt; não seja usado",
        "meta-viewport": "Garante que &lt;meta name='viewport'&gt; não desative o dimensionamento e o zoom do texto",
        "nested-interactive": "Garante que os controles interativos não estejam aninhados",
        "no-autoplay": "Garante que elementos &lt;video&gt; ou &lt;audio&gt; não reproduzam áudio automaticamente por mais de 3 segundos sem um mecanismo de controle para parar ou silenciar",
        "object-alt": "Garante que elementos &lt;object&gt; tenham texto alternativo",
        "p-as-heading": "Garante que elementos &lt;p&gt; não sejam usados para estilizar cabeçalhos",
        "page-has-heading-one": "Garante que a página, ou pelo menos um de seus frames, contenha um cabeçalho de nível um",
        "presentation-role-conflict": "Sinaliza elementos cuja função é 'none' ou 'presentation' e que causam conflito de função",
        "region": "Garante que todo o conteúdo da página esteja contido por marcos",
        "role-img-alt": "Garante que elementos [role='img'] tenham texto alternativo",
        "scope-attr-valid": "Garante que o atributo scope seja usado corretamente nas tabelas",
        "scrollable-region-focusable": "Garante que os elementos que possuem conteúdo rolável sejam acessíveis pelo teclado",
        "select-name": "Garante que o elemento select tenha um nome acessível",
        "server-side-image-map": "Garante que mapas de imagem do lado do servidor não sejam usados",
        "skip-link": "Garante que todos os links de pular conteúdo tenham um alvo focalizável",
        "svg-img-alt": "Garante que elementos &lt;svg&gt; com uma função de imagem tenham um nome acessível",
        "tabindex": "Garantir que os valores do atributo tabindex não sejam maiores que 0",
        "table-duplicate-name": "Garante que as tabelas não tenham o mesmo resumo e legenda",
        "table-fake-caption": "Garante que as tabelas com legenda não usem funções de apresentação",
        "target-size": "Garante que o alvo de toque tenha um tamanho suficiente",
        "td-has-header": "Garante que todas as células em uma &lt;table&gt; que usam o atributo headers se refiram a células na mesma tabela",
        "td-headers-attr": "Garante que cada célula em uma tabela usando o atributo headers se refira apenas a outras células na mesma tabela",
        "th-has-data-cells": "Garante que cada elemento &lt;th&gt; em uma tabela de dados se refira a células de dados",
        "valid-lang": "Garante que a subtarefa de idioma exista e seja válida",
        "video-caption": "Garante que elementos &lt;video&gt; tenham legendas",
        "video-description": "Garante que elementos &lt;video&gt; tenham uma descrição de áudio"
    };

    return descriptions[id] || defaultDescription; // Use a descrição padrão se não houver tradução.
}
