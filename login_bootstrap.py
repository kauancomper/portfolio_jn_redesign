"""
Script avulso para gerar uma sessão válida do Instagram a partir de um IP residencial
(seu computador), já que a VPS está sendo bloqueada por ser IP de datacenter.

Como usar:
    python login_bootstrap.py

Um navegador vai abrir. Faça login manualmente (usuário, senha, 2FA, checkpoint,
o que o Instagram pedir). Quando a Home carregar, volte aqui no terminal e
pressione ENTER. Isso salva instagram_session.json na pasta do projeto.

Depois é só copiar esse instagram_session.json para a VPS (mesma pasta do
playwright_extractor.py) e reiniciar o container.
"""
import asyncio
import json
from playwright.async_api import async_playwright

SESSION_FILE = "instagram_session.json"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, args=["--start-maximized"])
        context = await browser.new_context(
            no_viewport=True,
            locale="pt-BR",
            timezone_id="America/Belem",
        )
        page = await context.new_page()
        await page.goto("https://www.instagram.com/accounts/login/")

        print("\n>>> Faça login manualmente na janela do navegador que abriu.")
        print(">>> Resolva qualquer verificação (2FA, checkpoint, 'foi você?') se o Instagram pedir.")
        input(">>> Depois que a Home do Instagram carregar, volte aqui e pressione ENTER... ")

        context_after = page.context
        state = await context_after.storage_state(path=SESSION_FILE)
        print(f"\n✅ Sessão salva em {SESSION_FILE}.")

        print("\n" + "=" * 70)
        print("Cole o valor abaixo na variável de ambiente INSTA_SESSION_JSON")
        print("no painel da Easypanel (App > Environment) e reinicie o container:")
        print("=" * 70)
        print(json.dumps(state, ensure_ascii=False))
        print("=" * 70)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
