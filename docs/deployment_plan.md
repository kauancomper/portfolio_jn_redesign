# Plano de Implantação: Portfólio com Atualização Automática

Este plano descreve como configurar o projeto para rodar no Easypanel (Docker) na sua VPS Ubuntu, garantindo que o site seja servido pelo Nginx e o script Python de atualização do Instagram rode em segundo plano.

## Docker e Orquestração

O projeto utiliza uma estratégia de container único que roda tanto o servidor web (Nginx) quanto o robô de atualização (Python/Playwright).

### Arquivos de Configuração Criados:

1.  **Dockerfile**: Constrói a imagem com Python, Nginx e navegadores Playwright.
2.  **nginx.conf**: Configura o servidor para entregar o site na porta 80.
3.  **requirements.txt**: Dependências do script Python.
4.  **entrypoint.sh**: Script que sobe o Nginx e inicia o loop do Scraper.

## Configuração no Easypanel

1.  **Criar Novo Aplicativo**: No Easypanel, vá em "Projects" -> Seu Projeto -> "Create" -> "App" -> "Custom".
2.  **Repositório Git**: Conecte o repositório onde este código está salvo.
3.  **Build Method**: Selecione "Dockerfile".
4.  **Volumes**: 
    - Recomenda-se criar um volume para persistir o JSON: `/app/src/data` montado em um volume do Easypanel.
5.  **Variáveis de Ambiente**: Nenhuma obrigatória, a menos que queira customizar o `INTERVALO_MINUTOS` no script.

## Importante: Sessão do Instagram
O arquivo `instagram_session.json` contém seus cookies de login. **Ele deve estar presente no container** para evitar que o Instagram peça login manual (o que falharia em um servidor sem tela). Garanta que ele seja enviado junto com o código ou montado via volume.
