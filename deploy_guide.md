# Guia de Deploy: Instagram Scraper "Sempre Online"

Para que seu site fique sempre atualizado sem depender do seu computador, você precisa rodar o script em um servidor (VPS).

## 1. Onde Hospedar?
Recomendo uma VPS barata (ex: **DigitalOcean**, **Hetzner**, **AWS LightSail** ou **Google Cloud Free Tier**).
- **SO Recomendado**: Ubuntu 22.04 LTS.

## 2. Preparação do Servidor
No seu servidor Ubuntu, instale as dependências:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv -y

# Instala o Playwright e navegadores
pip install playwright
playwright install chromium
playwright install-deps chromium
```

## 3. Como Manter Rodando 24/7 (PM2)
O PM2 é um gerenciador de processos que reinicia o script se ele cair ou se o servidor reiniciar.
```bash
sudo apt install nodejs npm -y
sudo npm install -g pm2

# Iniciar o script
pm2 start playwright_extractor.py --interpreter python3

# Salvar para iniciar no boot do sistema
pm2 save
pm2 startup
```

## 4. Atualização Automatizada do Site
Se o seu site está no **GitHub Pages**:
Você precisará adicionar um comando no final do seu script Python para fazer o `git commit` e `git push` automaticamente sempre que o JSON mudar.

**Dica**: Adicione isso no final da função `main()` do `playwright_extractor.py`:
```python
os.system("git add src/data/instagram_final_filtrado.json")
os.system('git commit -m "Auto-update: Instagram feed"')
os.system("git push")
```

## 5. Cuidados com o Instagram
> [!IMPORTANT]
> O Instagram costuma bloquear IPs de data centers. 
> 1. Você precisará copiar o arquivo `instagram_session.json` do seu computador para o servidor para manter o login.
> 2. Se for bloqueado, você pode precisar usar um **Proxy Residencial**.
