# Documentação do Projeto: Portfólio Jordão Nunes

Este projeto consiste em um portfólio web moderno que exibe fotografias categorizadas, integrando-se automaticamente com o Instagram para manter o conteúdo sempre atualizado.

## Estrutura do Projeto

- `index.html`: Página principal do portfólio.
- `src/`: Conteúdo dinâmico e estilos.
  - `css/`: Folhas de estilo (Vanilla CSS).
  - `js/`: Lógica JavaScript para a galeria e interações.
  - `data/`: Contém o arquivo `instagram_final_filtrado.json` que alimenta o site.
  - `assets/`: Imagens estáticas e ícones.
- `playwright_extractor.py`: Script Python responsável por realizar a raspagem de dados do Instagram.

## Funcionalidades Principais

1.  **Galeria Dinâmica**: Filtra fotos por categorias (Natureza, Social, etc.).
2.  **Atualização Automática**: O script Python monitora o perfil do Instagram e atualiza o banco de dados JSON local.
3.  **Filtragem Inteligente**: O scraper analisa legendas e Alt-Texts para categorizar as fotos automaticamente.

## Como Executar Localmente

### Site (Front-end)
Basta abrir o `index.html` em qualquer navegador ou usar uma extensão "Live Server".

### Scraper (Back-end)
1. Instale as dependências: `pip install -r requirements.txt`
2. Instale os navegadores do Playwright: `playwright install chromium`
3. Execute o script: `python playwright_extractor.py`

## Fluxo de Atualização no Servidor (VPS + Easypanel)

O projeto está configurado para rodar via Docker. O container executa:
1. **Nginx**: Servindo os arquivos estáticos na porta 80.
2. **Scraper**: Rodando em loop infinito, verificando novas fotos a cada hora (ajustável no script).

## Configuração no Easypanel (Automação Total)

Para que o scraper rode 100% sozinho, vá na aba **Environment** do seu App no Easypanel e adicione:

- `INSTA_USER`: Seu usuário do Instagram.
- `INSTA_PASS`: Sua senha do Instagram.
- `PROXY_SERVER`: (Opcional) Seu link de proxy, se tiver um (ex: `http://user:pass@host:port`).

### Como evitar bloqueios:
1.  **Modo Stealth**: O script já usa técnicas para esconder que é um robô.
2.  **Digitação Humana**: O login simula a velocidade de uma pessoa digitando.
3.  **Sessão Persistente**: O script tenta usar os cookies salvos antes de tentar um login novo.

---
Desenvolvido por Kauan Comper para Jordão Nunes.
