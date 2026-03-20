import os
import asyncio
import json
import re
import random
from datetime import datetime, timezone, timedelta
from playwright.async_api import async_playwright

try:
    import playwright_stealth
except ImportError:
    playwright_stealth = None

# =====================================================================
# CONFIGURAÇÕES GERAIS E FILTROS
# =====================================================================
ANOS_LIMITE = 3
LIMITE_MAX_POSTS = 30
INTERVALO_MINUTOS = 360 # (6 horas)
HEADLESS = True 

INSTA_USER = os.getenv("INSTA_USER", "jordaonunes")
INSTA_PASS = os.getenv("INSTA_PASS", "")
PROXY_SERVER = os.getenv("PROXY_SERVER", "")

NATURE_KEYWORDS = [
    "natureza", "pássaro", "animal", "flor", "fauna", "flora", "wildlife", "inseto", "réptil", 
    "rio", "amazônia", "paisagem", "parque", "árvore", "floresta", "mata", "céu", "nuvem", 
    "pôr do sol", "nascer do sol", "amazônico", "amazônica", "macaco", "onça", "jacaré", "cobra",
    "peixe", "bicho", "flutuante", "água", "selva", "bioma"
]

SOCIAL_KEYWORDS = [
    "círio", "nazare", "festejo", "junino", "junina", "quadrilha", "expoama", "exposição", "cultura", "tradição",
    "evento", "festa", "povo", "gente", "comunidade", "público", "manifestação", "religioso", "fé", "paraense",
    "urbano", "cidade", "ponte", "praça", "rua", "prédio", "arquitetura", "marabá", "avenida", "histórico",
    "skyline", "construção", "centro", "estrada", "beira-rio"
]

BLACKLIST = [
    "selfie", "rosto", "look", "moda", "estilo", "promoção", "sorteio", "maquiagem",
    "lookdodia", "ensaio pessoal", "minha foto", "eu no", "close de rosto", "retrato"
]

# =====================================================================
# LÓGICA DE FILTRAGEM
# =====================================================================
def detecta_pessoas_alt(alt_texts):
    padroes = [
        r"imagem pode conter: (\d+) pesso", r"imagem pode conter: rosto",
        r"pode ser uma imagem de (\d+) pesso", r"pode ser uma imagem de rosto",
        r"pessoa sorrindo", r"selfie", r"em pé", r"sentado"
    ]
    txt = " ".join(alt_texts).lower()
    return any(re.search(p, txt) for p in padroes)

def categorizar_post(caption, alt_texts):
    txt_all = f"{' '.join(alt_texts)} {caption}".lower()
    
    if detecta_pessoas_alt(alt_texts):
        if not any(k in txt_all for k in NATURE_KEYWORDS):
            return None

    for w in BLACKLIST:
        if w in txt_all: return None
            
    for k in SOCIAL_KEYWORDS:
        if k in txt_all: return "social"
            
    return "nature"

# =====================================================================
# CORE DO SCRAPER (VPS OPTIMIZED)
# =====================================================================
async def type_like_human(page, selector, text):
    await page.click(selector)
    await page.wait_for_timeout(random.randint(500, 1000))
    for char in text:
        await page.keyboard.press(char)
        await asyncio.sleep(random.uniform(0.05, 0.2))
    await page.wait_for_timeout(random.randint(500, 1000))

async def efetuar_login_vps(page, context, session_file):
    print("[LOGIN] Iniciando fluxo de login ultra-defensivo para VPS...")
    
    # Navega para a home devagar
    await page.goto("https://www.instagram.com/", wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(3000)
    
    # Verifica se já está logado
    if await page.query_selector('svg[aria-label="Página inicial"], svg[aria-label="Home"]'):
        print("[LOGIN] Sessão já ativa na Home.")
        return True

    # Força ir para a página de contas
    await page.goto("https://www.instagram.com/accounts/login/", wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(5000) # Espera renderização pesada do React
    
    # 1. Bypass de Cookies (EU/UK/VPS regions)
    try:
        btns = await page.query_selector_all('button')
        for b in btns:
            txt = await b.inner_text()
            if "cookie" in txt.lower() or "permitir" in txt.lower() or "allow" in txt.lower():
                await b.click(force=True)
                await page.wait_for_timeout(2000)
    except: pass

    # 2. Busca o campo de usuário com seletores flexíveis
    username_field = None
    seletores_user = ['input[name="username"]', 'input[type="text"]', 'input[aria-label*="user"]']
    
    for sel in seletores_user:
        try:
            username_field = await page.wait_for_selector(sel, timeout=10000)
            if username_field: break
        except: continue
        
    if not username_field:
        title = await page.title()
        url = page.url
        print(f"❌ [LOGIN ERRO FATA] Campo de usuário não apareceu! Site pode estar bloqueando a VPS.")
        print(f"   -> URL Atual: {url}")
        print(f"   -> Título da Página: {title}")
        return False

    print("[LOGIN] Inserindo credenciais como humano...")
    await type_like_human(page, 'input[name="username"]', INSTA_USER)
    
    # Busca campo de senha
    try:
        await type_like_human(page, 'input[name="password"]', INSTA_PASS)
        await page.keyboard.press("Enter")
    except Exception as e:
        print(f"❌ [LOGIN ERRO] Falha ao inserir senha: {e}")
        return False

    print("[LOGIN] Submetido. Aguardando resposta do Instagram...")
    
    # Espera até 40s pelo login devido a proxies lentos
    for _ in range(8):
        await page.wait_for_timeout(5000)
        
        # Lida com botões chatos que travam a tela
        try:
            ignore_btns = await page.query_selector_all('button')
            for b in ignore_btns:
                txt = (await b.inner_text()).lower()
                if "agora não" in txt or "not now" in txt or "cancelar" in txt:
                    await b.click(force=True)
                    await page.wait_for_timeout(2000)
        except: pass
        
        if await page.query_selector('svg[aria-label="Página inicial"], svg[aria-label="Home"]'):
            await context.storage_state(path=session_file)
            print("[LOGIN] Sucesso Absoluto! Sessão guardada.")
            return True
            
        if "challenge" in page.url or "checkpoint" in page.url:
            print("🚨 [BLOQUEIO] Instagram exigiu verificação de segurança (Captcha/SMS). A VPS foi flaggada.")
            return False

    print("⚠️ [LOGIN] Timeout. O login pode ter falhado ou a rede está extremamente lenta.")
    return False

async def extrair_perfil(username):
    print(f"\n[INFO] Iniciando raspagem do zero: @{username}")
    
    async with async_playwright() as p:
        args = ["--disable-blink-features=AutomationControlled", "--window-size=1920,1080"]
        proxy = {"server": PROXY_SERVER} if PROXY_SERVER else None
        
        browser = await p.chromium.launch(headless=HEADLESS, args=args, proxy=proxy)
        session_file = "instagram_session.json"
        
        if os.path.exists(session_file):
            context = await browser.new_context(storage_state=session_file, proxy=proxy, viewport={'width': 1920, 'height': 1080})
        else:
            context = await browser.new_context(proxy=proxy, viewport={'width': 1920, 'height': 1080})

        page = await context.new_page()
        if playwright_stealth:
            try:
                from playwright_stealth import stealth
                await stealth(page)
            except: pass

        # Fluxo de Login
        logado = await efetuar_login_vps(page, context, session_file)
        if not logado:
            print("Encerrando execução por falha no acesso.")
            await browser.close()
            return

        # Fluxo de Extração
        print(f"[INFO] Acessando /@{username}/")
        await page.goto(f"https://www.instagram.com/{username}/", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(5000)

        postagens = []
        processados = set()
        limite_ts = datetime.now().timestamp() - (ANOS_LIMITE * 365 * 24 * 60 * 60)
        parou = False

        while not parou:
            posts = await page.query_selector_all('a[href*="/p/"]') # Apenas fotos, ignora Reels
            novos = False

            for post in posts:
                if len(processados) >= LIMITE_MAX_POSTS:
                    parou = True; break
                    
                href = await post.get_attribute("href")
                match = re.search(r'/p/([^/]+)', href)
                if not match: continue
                
                code = match.group(1)
                if code in processados: continue
                
                processados.add(code)
                novos = True

                try:
                    await post.scroll_into_view_if_needed()
                    await page.wait_for_timeout(500)
                    await post.click(force=True)
                    
                    await page.wait_for_selector('role=dialog', timeout=15000)
                    await page.wait_for_timeout(3000) # Deixa renderizar a foto

                    # Pega Data
                    time_el = await page.query_selector('role=dialog >> time')
                    dt_str = await time_el.get_attribute('datetime')
                    dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
                    
                    if dt.timestamp() < limite_ts:
                        parou = True; break

                    # Pega Legenda Seguro
                    legenda = ""
                    try:
                        h1_el = await page.query_selector('role=dialog >> h1')
                        if h1_el:
                            legenda = await h1_el.inner_text()
                    except: pass

                    # Pega Fotos Carrossel
                    urls, alts = [], []
                    for _ in range(10):
                        imgs = await page.query_selector_all('role=dialog >> img')
                        for img in imgs:
                            src = await img.get_attribute('src') or ""
                            alt = await img.get_attribute('alt') or ""
                            srcset = await img.get_attribute('srcset')
                            
                            alt_l = alt.lower()
                            # Só aceita imagens que possuem srcset (garantia de ser a foto principal do post) ou que sejam bem grandes
                            if not srcset and "p1080x1080" not in src: continue
                            
                            # Ignora explicitamente avatares e tracking pixels
                            if "foto de perfil" in alt_l or "profile pic" in alt_l: continue
                            if "/s150x150/" in src or "/s44x44/" in src or "/s32x32/" in src or "/150x150/" in src: continue
                            if "logging_page" in src or "tracking" in src: continue
                            
                            if src and "cdninstagram" in src and src not in urls:
                                urls.append(src)
                                if alt: alts.append(alt)
                        
                        btn_next = await page.query_selector('button[aria-label="Avançar"], button[aria-label="Next"]')
                        if btn_next:
                            await btn_next.click(force=True)
                            await page.wait_for_timeout(1000)
                        else: break

                    await page.keyboard.press("Escape")
                    await page.wait_for_timeout(1000)

                    cat = categorizar_post(legenda, alts)
                    if cat:
                        postagens.append({
                            "id": code,
                            "url": urls[0] if len(urls) == 1 else urls,
                            "permalink": f"https://www.instagram.com/p/{code}/",
                            "caption": legenda,
                            "cat": cat,
                            "timestamp": dt.strftime("%Y-%m-%dT%H:%M:%S+0000")
                        })
                        print(f"✅ {len(postagens)}/{LIMITE_MAX_POSTS} | {cat.upper()} | {code}")
                    else:
                        print(f"⚠️ Pulo no post {code}: Identificado como Selfie ou Fora do Tema")

                except Exception as e:
                    print(f"⚠️ Pulo no post {code}: {e}")
                    await page.keyboard.press("Escape")

            if not novos and not parou:
                await page.evaluate("window.scrollBy(0, 1000)")
                await page.wait_for_timeout(3000)

        await browser.close()
        
        path = "src/data/instagram_final_filtrado.json"
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(postagens, f, indent=4, ensure_ascii=False)
        print(f"💾 Arquivo JSON salvo com sucesso!")

async def main():
    while True:
        try:
            print(f"\n==========================================")
            print(f"⚡ INICIANDO CICLO: {datetime.now().strftime('%H:%M:%S')}")
            print(f"==========================================")
            await extrair_perfil("jordaonunes")
            
            proxima = datetime.now() + timedelta(minutes=INTERVALO_MINUTOS)
            print(f"\n✅ Ciclo concluído com sucesso!")
            print(f"⏳ Próxima varredura programada para: {proxima.strftime('%H:%M:%S do dia %d/%m')}\n")
            
            await asyncio.sleep(INTERVALO_MINUTOS * 60)
        except Exception as e:
            print(f"🔥 ERRO CRÍTICO NO LOOP: {e}")
            await asyncio.sleep(300)

if __name__ == "__main__":
    asyncio.run(main())
