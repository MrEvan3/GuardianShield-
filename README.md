<div align="center">

# 🛡️ GuardianShield™

**IA Industrial Contra-Fraude para Chromium**

[![Versão](https://img.shields.io/badge/versão-1.0.0-6366f1?style=flat-square)](https://github.com/MrEvan3/guardian-shield/releases)
[![Manifest](https://img.shields.io/badge/Manifest-V3-22c55e?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/)
[![Licença](https://img.shields.io/badge/licença-EULA-f59e0b?style=flat-square)](#licença)
[![Idioma](https://img.shields.io/badge/idioma-pt--BR-blue?style=flat-square)](/_locales/pt_BR)

> Unifica **10 motores de segurança** e **Gemini AI 2.5** para desmascarar sites falsos, bloquear phishing e blindar transações em tempo real.

</div>

---

## ✨ O que faz

| Módulo | Descrição |
|---|---|
| 🔍 **Google Safe Browsing** | Consulta oficial Google com fallback Transparency Report |
| 🎣 **PhishTank** | Base comunitária de phishing verificado |
| ☣️ **URLHaus** | Banco de malware da Abuse.ch |
| 🗓️ **WHOIS / RDAP** | Detecta domínios criados recentemente (< 6 meses = suspeito) |
| 🌍 **Geolocalização de IP** | Identifica países de alto risco, datacenter, proxy e TOR |
| 🦠 **VirusTotal** | Varredura cloud com fallback gratuito |
| 🧠 **Gemini AI 2.5** | Análise semântica profunda via IA |
| 👁️ **pHash Visual** | Fingerprint visual da página — detecta clones visuais |
| 🔎 **Análise DOM** | Scripts ofuscados, iframes ocultos, formulários externos |
| 🧬 **Heurística Local** | Typosquatting, l33tspeak, TLDs suspeitos, padrões de URL |

---

## 🚀 Funcionalidades extras

- **Bloqueador de anúncios** com 1200+ regras `declarativeNetRequest`
- **Google SERP Shield** — badges de segurança nos resultados de busca
- **Clipboard Guard** — protege colagem de Pix/cartão em sites suspeitos
- **Anti-Cryptojacking** — bloqueia mineradores no navegador
- **WebRTC Block** — oculta IP real
- **Removedor de rastreadores** de URL (UTM, fbclid, etc.)
- **Bloqueio de cookie popups** (GDPR Auto-Block)
- **Auto-Sandbox** — isola execução em sites de alto risco
- **Relatório CSV** — exportação de histórico de ameaças
- Suporte a **Chrome, Edge, Brave** (e Firefox com `gecko` settings)
- Interface em **Português do Brasil** (`_locales/pt_BR`)

---

## 📸 Screenshots

> Popup principal · Painel de controle · Heurísticas · Filtragem & AdBlock · Privacidade & Stealth
> <img width="363" height="601" alt="Captura de tela 2026-04-06 170200" src="https://github.com/user-attachments/assets/fcfad9a4-b3ec-4a66-8e61-fb5e70451f90" />
<img width="365" height="596" alt="Captura de tela 2026-04-06 170211" src="https://github.com/user-attachments/assets/6f3d3c9a-2552-4ea5-9ded-59bcd4ad29f8" />
<img width="353" height="589" alt="Captura de tela 2026-04-06 170228" src="https://github.com/user-attachments/assets/54dd7cbb-8356-4eb9-893a-42fd77bd7c14" />
<img width="355" height="599" alt="Captura de tela 2026-04-06 170236" src="https://github.com/user-attachments/assets/3e61b9cd-b01b-4a01-b3bd-300ac8b7835f" />
<img width="1057" height="877" alt="Captura de tela 2026-04-06 170305" src="https://github.com/user-attachments/assets/e5f21fdc-809d-4b25-a105-14647e4f8b5a" />
<img width="913" height="912" alt="Captura de tela 2026-04-06 170352" src="https://github.com/user-attachments/assets/05caa909-4800-4e97-aa02-49ef0046af14" />
<img width="917" height="891" alt="Captura de tela 2026-04-06 170402" src="https://github.com/user-attachments/assets/a730574e-78bd-4bcb-ae0c-819ff9e1cc35" />
<img width="1110" height="734" alt="Captura de tela 2026-04-06 190855" src="https://github.com/user-attachments/assets/381ce5dc-74e3-4550-a4fa-acadacd01b00" />
<img width="990" height="923" alt="Captura de tela 2026-04-06 170317" src="https://github.com/user-attachments/assets/89f175e8-95d5-4839-b814-6e220b4746b2" />
<img width="992" height="858" alt="Captura de tela 2026-04-06 170339" src="https://github.com/user-attachments/assets/5a2c5c41-4875-4e5e-8dd6-ef259a663278" />


---

## 📦 Instalação (modo desenvolvedor)

```bash
# 1. Clone o repositório
git clone https://github.com/MrEvan3/guardian-shield.git

# 2. Abra o Chrome e acesse
chrome://extensions

# 3. Ative "Modo do desenvolvedor" (canto superior direito)

# 4. Clique em "Carregar sem compactação"
#    Selecione a pasta guardian-shield/
```

---

## ⚙️ APIs configuráveis (todas gratuitas)

| API | Obrigatoriedade | Link |
|---|---|---|
| Google Safe Browsing | Opcional (tem fallback) | [console.cloud.google.com](https://console.cloud.google.com) |
| VirusTotal | Opcional (tem fallback) | [virustotal.com](https://www.virustotal.com/gui/join-us) |
| Gemini AI 2.5 | Opcional | [aistudio.google.com](https://aistudio.google.com) |
| URLScan.io | Recomendado | [urlscan.io](https://urlscan.io/user/signup) |
| URLDNA | Recomendado | [urldna.io](https://urldna.io) |
| OpenRouter | Opcional (redundância IA) | [openrouter.ai](https://openrouter.ai) |
| Groq | Opcional (velocidade) | [console.groq.com](https://console.groq.com) |

**Sem nenhuma chave:** PhishTank, URLHaus, WHOIS/RDAP, IP-API, DOM e heurísticas já funcionam 100% de graça.

---

## 🏗️ Estrutura

```
guardian-shield/
├── manifest.json          # MV3 — suporte Chrome + Firefox
├── service-worker.js      # Motor central (10 verificações paralelas)
├── content.js / .css      # Injeção de banners de alerta no DOM
├── google-serp.js / .css  # Badges nos resultados do Google
├── popup.html/js/css      # Interface do popup
├── options.html/js/css    # Painel de configurações completo
├── pHash.js               # Hash perceptual visual (fingerprint)
├── sandbox.html           # Isolamento de execução
├── report.html/js         # Relatórios e exportação CSV
├── heuristics.json        # Base de dados de heurísticas (editável)
├── rules.json             # Regras declarativeNetRequest (AdBlock)
├── icons/                 # Ícones 16/32/48/64/128px
└── _locales/pt_BR/        # Internacionalização
```

---

## 📄 Licença

© 2026 GuardianShield™. Licença EULA — uso pessoal e educacional permitido.

---

<div align="center">
Feito com 🛡️ por <a href="https://github.com/MrEvan3">MrEvan3</a>
</div>
