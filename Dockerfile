# Use uma imagem base do Python
FROM python:3.11-slim

# Evita que o Python gere arquivos .pyc e permite logs em tempo real
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV INSTA_USER="jordaonunes"
ENV INSTA_PASS=""
ENV PROXY_SERVER=""

# Instala o Nginx e dependências do sistema para o Playwright
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Configura o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências e instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Instala o Playwright e o navegador Chromium com dependências
RUN playwright install --with-deps chromium

# Copia o restante dos arquivos do projeto
COPY . .

# Corrige permissões para o Nginx ler os arquivos perfeitamente
RUN chmod -R 755 /app

# Remove a configuração padrão do Nginx e adiciona a nossa
RUN rm /etc/nginx/sites-enabled/default
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Garante que o script de entrada seja executável
RUN chmod +x entrypoint.sh

# Expõe a porta 80 para o Easypanel
EXPOSE 80

# Define o script de entrada
ENTRYPOINT ["./entrypoint.sh"]
