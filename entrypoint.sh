#!/bin/bash

# Restaura a sessão do Instagram a partir de variável de ambiente (nunca via git,
# já que o repositório é público). Configure INSTA_SESSION_JSON no painel da
# Easypanel com o conteúdo gerado por login_bootstrap.py.
if [ -n "$INSTA_SESSION_JSON" ]; then
    echo "Restaurando instagram_session.json a partir de INSTA_SESSION_JSON..."
    echo "$INSTA_SESSION_JSON" > instagram_session.json
fi

# Inicia o Nginx em background
echo "Iniciando Nginx..."
nginx -g "daemon on;"

# Inicia o script de raspagem do Instagram em foreground
echo "Iniciando Instagram Scraper..."
python3 playwright_extractor.py
