# AccessibilityChecker
Extensão para google Chrome que analisa o nível da acessibilidade de sites dando uma nota, além de sugerir melhorias.

Extensão Criada: Accessibility Checker

  Objetivo:
    Identificar e reportar problemas de acessibilidade em sites, ajudando desenvolvedores a corrigir elementos que dificultam ou impossibilitam a navegação por pessoas com deficiência.
  
  Descrição Geral:
  
    •	Desenvolvimento de extensões: Exige conhecimentos práticos em linguagens como JavaScript, HTML e CSS, além do uso de Interface de programação de aplicações (APIs - Application Programming Interface) específicas de navegadores.
    •	Integração com padrões de acessibilidade: A implementação pode envolver bibliotecas ou APIs que validem elementos de acessibilidade, como Aplicações para a Internet Ricas em Acessibilidade (Accessible Rich Internet Applications - ARIA).
    •	Desafios algorítmicos: Detectar problemas de acessibilidade (como contraste inadequado ou navegação ineficiente por teclado) demanda soluções que podem incluir processamento de Modelo de Objeto de Documentos (DOM) e análise de cores.
  
  Estrutura e Funcionalidades:
  
    /AccessibilityExtension/ (Pasta principal)
    |___ manifest.json	 (Configuração da extensão: define permissões, arquivos usados, nome da extensão, etc)
    |___ background.js	 (Executa tarefas de plano de fundo: recebe comandos da interface e pode repassar ou escutar mensagens)
    |___ content.js	 (Script injetado na página: utiliza a biblioteca axe-core para escanear problemas de acessibilidade)
    |___ popup.html	 (Interface exibida ao clicar na extensão. Possui um botão para iniciar a análise)
    |___ popup.js	 (Conecta o botão da interface à execução do content.js e mostra o relatório)
    |___ scripts		 (Pasta da biblioteca axe-core)
        |___ axe.min.js	 (Biblioteca de código aberto da Deque Systems que verifica automaticamente a conformidade com diretrizes de acessibilidade como WCAG 2.1)
    |___icon.png		 (Imagem para o ícone da extensão)

  Como Testar:  
  
    •	Baixe e extraia os arquivos do ZIP.
    •	Acesse chrome://extensions no Google Chrome.
    •	Ative o "Modo de Desenvolvedor".
    •	Clique em "Carregar sem compactação" e selecione a pasta extraída.

  Usando a Extensão:
  
    •	Navegue para um site.
    •	Clique no ícone da extensão e em "Analisar".
    •	Verifique o relatório na nova aba aberta.
