#!/bin/bash

# Inicia o Nginx em background
echo "Iniciando Nginx..."
nginx -g "daemon on;"

# Inicia o script de raspagem do Instagram em foreground
echo "Iniciando Instagram Scraper..."
python3 playwright_extractor.py
