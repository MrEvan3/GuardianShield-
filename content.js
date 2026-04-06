/* ═══════════════════════════════════════════════════════════════════
   GuardianShield™ — Content Script
   DOM Analysis, Clipboard Guard, Sandbox, Alert Overlay,
   Cookie Blocker, Push Blocker, Distraction Blocker, Social Blocker,
   Element Picker
   ═══════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── Padrões sensíveis para Clipboard Guard ───
  const SENSITIVE_PATTERNS = {
    cpf: /^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    cnpj: /^\d{14}$|^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    cartaoCredito: /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  };

  // ─── Estado ───
  let isSandboxed = false;
  let alertOverlay = null;
  let elementPickerActive = false;
  let pickerHighlight = null;
  let adblockConfig = null;

  // ═══════════════════════════════════════════════════
  // 🍪 Cookie Popup Blocker — Remove overlays de cookies
  // ═══════════════════════════════════════════════════
  const COOKIE_SELECTORS = [
    // IDs comuns
    '#cookie-consent', '#cookie-banner', '#cookie-notice', '#cookie-popup',
    '#cookieNotice', '#cookieConsent', '#cookieBanner', '#cookie-bar',
    '#cookie-law-info-bar', '#cookie_notice', '#gdpr-consent',
    '#gdpr-banner', '#gdpr-cookie-popup', '#consent-popup',
    '#cc-main', '#CybotCookiebotDialog', '#onetrust-consent-sdk',
    '#onetrust-banner-sdk', '#truste-consent-track',
    '#usercentrics-root', '#iubenda-cs-banner',
    // Classes comuns
    '.cookie-consent', '.cookie-banner', '.cookie-notice', '.cookie-popup',
    '.cookie-bar', '.cookie-dialog', '.cookie-overlay', '.cookie-modal',
    '.gdpr-banner', '.gdpr-popup', '.gdpr-notice', '.gdpr-consent',
    '.consent-banner', '.consent-popup', '.consent-modal',
    '.cc-window', '.cc-banner', '.cc-dialog', '.cc-revoke',
    '.cky-consent-container', '.osano-cm-window',
    // Seletores genéricos usados por CMPs
    '[class*="cookie-consent"]', '[class*="cookieConsent"]',
    '[class*="cookie-banner"]', '[class*="cookieBanner"]',
    '[id*="cookie-consent"]', '[id*="cookieConsent"]',
    '[aria-label*="cookie"]', '[aria-label*="Cookie"]',
    '[data-nosnippet="true"][class*="consent"]'
  ];

  function initCookieBlocker() {
    // Remover overlays existentes
    removeCookiePopups();

    // Observer para pegar popups que carregam dinamicamente
    const observer = new MutationObserver(debounceLight(removeCookiePopups, 500));
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });

    // Injetar CSS para esconder overlays comuns de cookies
    const style = document.createElement('style');
    style.id = 'gs-cookie-blocker-css';
    style.textContent = `
      ${COOKIE_SELECTORS.join(',\n      ')} {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        height: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
        position: absolute !important;
        z-index: -9999 !important;
      }
      /* Remover backdrop/overlay que bloqueia a página */
      .cmp-overlay, .cookie-overlay, .consent-overlay,
      [class*="cookie-overlay"], [class*="consent-overlay"],
      .cky-overlay { display: none !important; }
      /* Destravar scroll do body */
      html.cookie-consent-active, body.cookie-consent-active,
      html.no-scroll-cookie, body.no-scroll-cookie,
      html[style*="overflow: hidden"], body.cc-open {
        overflow: auto !important;
        position: static !important;
      }
    `;
    document.head?.appendChild(style);
  }

  function removeCookiePopups() {
    COOKIE_SELECTORS.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.setAttribute('aria-hidden', 'true');
        });
      } catch(e) {}
    });

    // Restaurar scroll do body
    document.body?.classList.remove('no-scroll', 'cookie-open', 'cc-open', 'modal-open');
    if (document.body) {
      document.body.style.overflow = '';
      document.body.style.position = '';
    }
    if (document.documentElement) {
      document.documentElement.style.overflow = '';
    }
  }

  // ═══════════════════════════════════════════════════
  // 🔔 Push Notification Blocker
  // ═══════════════════════════════════════════════════
  function initPushBlocker() {
    // Override silencioso do Notification.requestPermission
    if (window.Notification) {
      const originalRequestPermission = Notification.requestPermission;
      Notification.requestPermission = function(callback) {
        console.log('[GuardianShield] Bloqueou solicitação de notificação push');
        if (typeof callback === 'function') callback('denied');
        return Promise.resolve('denied');
      };
      // Fazer o permission parecer denied
      Object.defineProperty(Notification, 'permission', {
        get: () => 'denied',
        configurable: true
      });
    }

    // Bloquear PushManager
    if (window.PushManager) {
      PushManager.prototype.subscribe = function() {
        console.log('[GuardianShield] Bloqueou PushManager.subscribe');
        return Promise.reject(new DOMException('Push denied by GuardianShield', 'NotAllowedError'));
      };
    }
  }

  // ═══════════════════════════════════════════════════
  // 📦 Distraction Blocker — vídeos flutuantes, pop-ups
  // ═══════════════════════════════════════════════════
  const DISTRACTION_SELECTORS = [
    // Newsletter popups
    '[class*="newsletter-popup"]', '[class*="newsletter-modal"]',
    '[class*="subscribe-popup"]', '[class*="subscribe-modal"]',
    '[id*="newsletter-popup"]', '[id*="subscribe-popup"]',
    '[class*="exit-intent"]', '[class*="exitIntent"]',
    // Sticky videos
    '[class*="sticky-video"]', '[class*="floating-video"]',
    '[class*="pip-video"]', '[class*="video-float"]',
    'video[style*="position: fixed"]', 'video[style*="position:fixed"]',
    '[class*="stickyPlayer"]',
    // "Install our app" / "Join" popups
    '[class*="app-banner"]', '[class*="smart-banner"]',
    '[class*="app-install"]', '[id*="app-banner"]',
    // Paywall nags (não o conteúdo real)
    '[class*="paywall-overlay"]', '[class*="paywall-modal"]',
    // Chat widget popups (não o botão em si)
    '[class*="chat-proactive"]', '[class*="chat-invite"]',
    // Notification bell popups de sites
    '[class*="web-push-prompt"]', '[class*="push-notification-prompt"]',
    '[class*="onesignal-slidedown"]', '[id*="onesignal-slidedown"]'
  ];

  function initDistractionBlocker() {
    removeDistractions();
    const observer = new MutationObserver(debounceLight(removeDistractions, 800));
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function removeDistractions() {
    DISTRACTION_SELECTORS.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
        });
      } catch(e) {}
    });
  }

  // ═══════════════════════════════════════════════════
  // 📱 Social Widget Blocker
  // ═══════════════════════════════════════════════════
  const SOCIAL_SELECTORS = [
    // Facebook embeds
    '.fb-like', '.fb-share-button', '.fb-comments', '.fb-page',
    '.fb-follow', '.fb-send', '.fb-group',
    'iframe[src*="facebook.com/plugins"]',
    'iframe[src*="facebook.com/connect"]',
    // Twitter embeds
    '.twitter-share-button', '.twitter-follow-button',
    '.twitter-timeline', '.twitter-tweet',
    'iframe[src*="platform.twitter.com"]',
    // LinkedIn
    'iframe[src*="platform.linkedin.com"]',
    '[class*="linkedin-share"]',
    // Pinterest
    '[data-pin-do]', '.pin-it-button',
    'iframe[src*="pinterest.com"]',
    // Google+/YouTube social
    '.g-plusone', '.g-follow',
    // Generic social bars
    '[class*="social-share-bar"]', '[class*="share-buttons"]',
    '[class*="social-icons-bar"]', '[class*="floating-social"]',
    '[class*="sticky-social"]'
  ];

  function initSocialBlocker() {
    removeSocialWidgets();
    const observer = new MutationObserver(debounceLight(removeSocialWidgets, 800));
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function removeSocialWidgets() {
    SOCIAL_SELECTORS.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
        });
      } catch(e) {}
    });
  }

  // ═══════════════════════════════════════════════════
  // 🖱️ Element Picker — Selecionar e bloquear elemento
  // ═══════════════════════════════════════════════════
  function activateElementPicker() {
    if (elementPickerActive) return;
    elementPickerActive = true;

    // Criar overlay informativo
    const infoBar = document.createElement('div');
    infoBar.id = 'gs-picker-info';
    infoBar.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; z-index: 2147483647;
      background: linear-gradient(135deg, rgba(15,15,30,0.97), rgba(20,20,45,0.97));
      color: #e2e8f0; padding: 10px 20px;
      display: flex; align-items: center; justify-content: space-between;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.3);
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    `;

    const infoLeft = document.createElement('div');
    infoLeft.style.cssText = 'display:flex;align-items:center;gap:12px;';
    
    const iconSpan = document.createElement('span');
    iconSpan.style.fontSize = '20px';
    iconSpan.textContent = '🛡️'; // Usar emoji ou SVG via createElement

    const textDiv = document.createElement('div');
    const strong = document.createElement('strong');
    strong.style.color = '#00d4ff';
    strong.textContent = 'GuardianShield — Bloquear Elemento';
    const p = document.createElement('p');
    p.style.cssText = 'margin:2px 0 0;font-size:12px;opacity:0.7;';
    p.textContent = 'Clique em um elemento da página para bloqueá-lo. Pressione ESC para cancelar.';
    
    textDiv.append(strong, p);
    infoLeft.append(iconSpan, textDiv);

    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'gs-picker-cancel';
    cancelBtn.style.cssText = 'background:rgba(220,38,38,0.2);color:#f87171;border:1px solid rgba(220,38,38,0.4);padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;';
    cancelBtn.textContent = '✕ Cancelar';
    cancelBtn.onclick = cleanupPicker;

    infoBar.append(infoLeft, cancelBtn);
    document.body.appendChild(infoBar);

    // Highlight element
    pickerHighlight = document.createElement('div');
    pickerHighlight.id = 'gs-picker-highlight';
    pickerHighlight.style.cssText = `
      position: fixed; pointer-events: none; z-index: 2147483646;
      border: 2px solid #6366f1; background: rgba(99,102,241,0.15);
      border-radius: 4px; transition: all 0.1s ease;
      box-shadow: 0 0 12px rgba(99,102,241,0.3);
    `;
    document.body.appendChild(pickerHighlight);

    // Tooltip com seletor
    const tooltip = document.createElement('div');
    tooltip.id = 'gs-picker-tooltip';
    tooltip.style.cssText = `
      position: fixed; z-index: 2147483647; pointer-events: none;
      background: rgba(15,15,30,0.95); color: #a5b4fc; padding: 4px 10px;
      border-radius: 6px; font-size: 11px; font-family: 'Fira Code', 'Cascadia Code', monospace;
      border: 1px solid rgba(99,102,241,0.4); white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    `;
    document.body.appendChild(tooltip);

    let lastTarget = null;

    function onMouseMove(e) {
      const el = e.target;
      if (el.id?.startsWith('gs-picker') || el.closest('#gs-picker-info')) return;
      lastTarget = el;
      const rect = el.getBoundingClientRect();
      pickerHighlight.style.top = rect.top + 'px';
      pickerHighlight.style.left = rect.left + 'px';
      pickerHighlight.style.width = rect.width + 'px';
      pickerHighlight.style.height = rect.height + 'px';
      pickerHighlight.style.display = 'block';

      // Gerar seletor CSS
      const selector = generateCSSSelector(el);
      tooltip.textContent = selector;
      tooltip.style.top = Math.min(rect.bottom + 6, window.innerHeight - 30) + 'px';
      tooltip.style.left = Math.min(rect.left, window.innerWidth - 300) + 'px';
      tooltip.style.display = 'block';
    }

    function onMouseClick(e) {
      const el = e.target;
      if (el.id?.startsWith('gs-picker') || el.closest('#gs-picker-info')) {
        if (el.id === 'gs-picker-cancel') {
          cleanupPicker();
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const selector = generateCSSSelector(el);
      showBlockConfirm(el, selector);
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        cleanupPicker();
      }
    }

    function cleanupPicker() {
      elementPickerActive = false;
      document.removeEventListener('mousemove', onMouseMove, true);
      document.removeEventListener('click', onMouseClick, true);
      document.removeEventListener('keydown', onKeyDown, true);
      document.getElementById('gs-picker-info')?.remove();
      document.getElementById('gs-picker-highlight')?.remove();
      document.getElementById('gs-picker-tooltip')?.remove();
      document.getElementById('gs-picker-confirm')?.remove();
    }

    function showBlockConfirm(el, selector) {
      const existing = document.getElementById('gs-picker-confirm');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = 'gs-picker-confirm';
      modal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        z-index: 2147483647; background: linear-gradient(145deg, #0f0f23, #1a1a3e);
        border-radius: 16px; padding: 24px 28px; min-width: 380px; max-width: 500px;
        color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.3);
        backdrop-filter: blur(20px);
      `;
      const title = document.createElement('h3');
      title.style.cssText = 'margin:0 0 12px;font-size:16px;color:#a5b4fc;';
      title.textContent = 'Bloquear Elemento';
      
      const desc = document.createElement('p');
      desc.style.cssText = 'margin:0 0 8px;font-size:13px;opacity:0.8;';
      desc.textContent = 'O seguinte seletor CSS será bloqueado:';
      
      const selectorBox = document.createElement('div');
      selectorBox.style.cssText = 'background:rgba(0,0,0,0.4);padding:10px 14px;border-radius:10px;margin:8px 0 16px;font-family:monospace;font-size:12px;color:#818cf8;border:1px solid rgba(99,102,241,0.2);word-break:break-all;';
      selectorBox.textContent = selector;
      
      const actions = document.createElement('div');
      actions.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;';
      
      const cancel = document.createElement('button');
      cancel.id = 'gs-confirm-cancel';
      cancel.style.cssText = 'padding:8px 18px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#94a3b8;cursor:pointer;font-size:13px;font-weight:600;';
      cancel.textContent = 'Cancelar';
      cancel.onclick = () => modal.remove();
      
      const block = document.createElement('button');
      block.id = 'gs-confirm-block';
      block.style.cssText = 'padding:8px 18px;border-radius:10px;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;cursor:pointer;font-size:13px;font-weight:700;box-shadow:0 4px 12px rgba(99,102,241,0.4);';
      block.textContent = '🚫 Bloquear';
      
      actions.append(cancel, block);
      modal.append(title, desc, selectorBox, actions);
      document.body.appendChild(modal);

      document.getElementById('gs-confirm-cancel').addEventListener('click', () => {
        modal.remove();
      });

      document.getElementById('gs-confirm-block').addEventListener('click', () => {
        // Esconder o elemento imediatamente
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        el.setAttribute('data-gs-blocked', 'true');

        // Salvar regra via service worker
        chrome.runtime.sendMessage({ type: 'ADD_CUSTOM_RULE', selector, hostname: window.location.hostname });

        // Injetar regra CSS permanente para esta sessão
        let rulesStyle = document.getElementById('gs-custom-rules-css');
        if (!rulesStyle) {
          rulesStyle = document.createElement('style');
          rulesStyle.id = 'gs-custom-rules-css';
          document.head?.appendChild(rulesStyle);
        }
        rulesStyle.textContent += `\n${selector} { display: none !important; }`;

        modal.remove();
        cleanupPicker();

        showMiniAlert(
          '🚫 Elemento bloqueado',
          `Regra "${selector}" adicionada. O elemento não aparecerá mais.`,
          'info'
        );
      });
    }

    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click', onMouseClick, true);
    document.addEventListener('keydown', onKeyDown, true);

    document.getElementById('gs-picker-cancel')?.addEventListener('click', cleanupPicker);
  }

  function generateCSSSelector(el) {
    if (el.id) return `#${CSS.escape(el.id)}`;

    const path = [];
    let current = el;
    while (current && current !== document.body && current !== document.documentElement) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        path.unshift(`#${CSS.escape(current.id)}`);
        break;
      }
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/).filter(c => c && !c.startsWith('gs-'));
        if (classes.length > 0) {
          selector += '.' + classes.slice(0, 2).map(c => CSS.escape(c)).join('.');
          path.unshift(selector);
          break;
        }
      }
      // Nth-child fallback
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.tagName === current.tagName);
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += `:nth-child(${index})`;
        }
      }
      path.unshift(selector);
      current = current.parentElement;
    }
    return path.join(' > ');
  }

  // ═══════════════════════════════════════════════════
  // 🔧 Aplicar regras customizadas salvas
  // ═══════════════════════════════════════════════════
  function applyCustomRules() {
    chrome.runtime.sendMessage({ type: 'GET_CUSTOM_RULES' }, (rules) => {
      if (!rules || rules.length === 0) return;
      let style = document.getElementById('gs-custom-rules-css');
      if (!style) {
        style = document.createElement('style');
        style.id = 'gs-custom-rules-css';
        document.head?.appendChild(style);
      }
      const css = rules.map(r => `${r} { display: none !important; }`).join('\n');
      style.textContent = css;
    });
  }

  // ═══════════════════════════════════════════════════
  // Clipboard Guard — Protege dados sensíveis
  // ═══════════════════════════════════════════════════
  function initClipboardGuard() {
    document.addEventListener('paste', handlePaste, true);
    document.addEventListener('copy', handleCopy, true);
  }

  function handlePaste(event) {
    const pastedData = (event.clipboardData || window.clipboardData)?.getData('text') || '';
    if (isSensitiveData(pastedData)) {
      if (!isTrustedDomain(window.location.hostname)) {
        event.preventDefault();
        event.stopPropagation();
        showMiniAlert(
          'GuardianShield™ bloqueou a colagem!',
          'Dados sensíveis (CPF/Cartão) não podem ser colados em sites não confiáveis.',
          'warning'
        );
        console.log('[GuardianShield] Clipboard paste blocked — sensitive data on untrusted domain');
        chrome.runtime.sendMessage({ type: 'STATS_INCREMENT', key: 'clipboard' }).catch(() => {});
      }
    }
  }

  function handleCopy(event) {
    const selection = window.getSelection()?.toString() || '';
    if (isPixOrBarcode(selection)) {
      chrome.runtime.sendMessage({ type: 'GET_SCAN_RESULT', url: window.location.href }, (response) => {
        if (response && response.score >= 40) {
          showMiniAlert(
            '⚠️ Atenção com este Pagamento!',
            'Você copiou um código PIX/Boleto de um site não confiável (Risco: ' + response.score + '/100). Valide muito bem o recebedor no App do Banco!',
            'warning'
          );
        }
      });
    }
  }

  function isPixOrBarcode(text) {
    if (!text) return false;
    const cleaned = text.trim();
    const pixPayload = /^000201.*6304[A-F0-9]{4}$/i;
    const barcode = /^\d{40,48}$/;
    const phoneOrCpfKeys = /^\d{11,14}$/;
    return pixPayload.test(cleaned) || barcode.test(cleaned.replace(/\D/g, '')) || SENSITIVE_PATTERNS.email.test(cleaned) || phoneOrCpfKeys.test(cleaned.replace(/\D/g, ''));
  }

  function isSensitiveData(text) {
    if (!text || text.trim().length === 0) return false;
    const cleaned = text.trim();
    return Object.values(SENSITIVE_PATTERNS).some(pattern => pattern.test(cleaned));
  }

  const TRUSTED_DOMAINS = [
    'gov.br', 'caixa.gov.br', 'bb.com.br', 'itau.com.br',
    'bradesco.com.br', 'santander.com.br', 'nubank.com.br',
    'inter.co', 'c6bank.com.br', 'mercadopago.com.br',
    'pagseguro.com.br', 'google.com', 'google.com.br',
    'microsoft.com', 'apple.com', 'amazon.com.br',
    'receita.fazenda.gov.br', 'esocial.gov.br',
    'conectividade.gov.br', 'mercadolivre.com.br'
  ];

  function isTrustedDomain(hostname) {
    return TRUSTED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
  }

  // ═══════════════════════════════════════════════════
  // Mini Alert (toast no canto inferior direito)
  // ═══════════════════════════════════════════════════
  function showMiniAlert(title, message, type = 'info') {
    const existing = document.getElementById('gs-mini-alert');
    if (existing) existing.remove();

    const alert = document.createElement('div');
    alert.id = 'gs-mini-alert';
    alert.className = `gs-mini-alert gs-mini-alert--${type}`;
    const header = document.createElement('div');
    header.className = 'gs-mini-alert__header';
    
    const icon = document.createElement('span');
    icon.className = 'gs-mini-alert__icon';
    icon.textContent = type === 'warning' ? '⚠️' : type === 'danger' ? '🚫' : 'ℹ️';
    
    const alertTitle = document.createElement('strong');
    alertTitle.className = 'gs-mini-alert__title';
    alertTitle.textContent = title;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'gs-mini-alert__close';
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.innerHTML = '&times;'; // HTML entity is fine for static content
    
    header.append(icon, alertTitle, closeBtn);
    
    const pMsg = document.createElement('p');
    pMsg.className = 'gs-mini-alert__message';
    pMsg.textContent = message;
    
    alert.append(header, pMsg);

    document.body.appendChild(alert);

    requestAnimationFrame(() => {
      alert.classList.add('gs-mini-alert--visible');
    });

    alert.querySelector('.gs-mini-alert__close').addEventListener('click', () => {
      alert.classList.remove('gs-mini-alert--visible');
      setTimeout(() => alert.remove(), 300);
    });

    setTimeout(() => {
      if (alert.parentElement) {
        alert.classList.remove('gs-mini-alert--visible');
        setTimeout(() => alert.remove(), 300);
      }
    }, 8000);
  }

  // ═══════════════════════════════════════════════════
  // Alert Overlay — Tela cheia de aviso
  // ═══════════════════════════════════════════════════
  function showFullAlert(score, results, url) {
    if (alertOverlay) alertOverlay.remove();
    
    // Criação do Host para o Shadow DOM
    const host = document.createElement('div');
    host.id = 'gs-host-shield-' + Math.random().toString(36).substr(2, 6);
    host.style.position = 'fixed';
    host.style.inset = '0';
    host.style.zIndex = '2147483647';
    host.style.pointerEvents = 'none';

    const shadowRoot = host.attachShadow({ mode: 'closed' });

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('content.css');
    shadowRoot.appendChild(link);

    alertOverlay = document.createElement('div');
    alertOverlay.id = 'gs-alert-overlay';
    alertOverlay.className = 'gs-alert-overlay';
    alertOverlay.style.pointerEvents = 'auto';

    const backdrop = document.createElement('div');
    backdrop.className = 'gs-alert-overlay__backdrop';
    
    const card = document.createElement('div');
    card.className = 'gs-alert-overlay__card';
    
    const header = document.createElement('div');
    header.className = 'gs-alert-overlay__header';
    const shield = document.createElement('div');
    shield.className = 'gs-alert-overlay__shield';
    const h1 = document.createElement('h1');
    h1.className = 'gs-alert-overlay__title';
    h1.textContent = 'GuardianShield — Alerta de Segurança';
    header.append(shield, h1);
    
    const scoreRing = document.createElement('div');
    scoreRing.className = 'gs-alert-overlay__score-ring';
    scoreRing.innerHTML = `
      <svg viewBox="0 0 120 120" class="gs-alert-overlay__ring-svg">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#1e1e2e" stroke-width="8"/>
        <circle cx="60" cy="60" r="54" fill="none"
          stroke="${score >= 75 ? '#DC2626' : '#F59E0B'}"
          stroke-width="8"
          stroke-dasharray="${(score / 100) * 339.292} 339.292"
          stroke-linecap="round"
          transform="rotate(-90 60 60)"/>
      </svg>
      <div class="gs-alert-overlay__score-text">
        <span class="gs-alert-overlay__score-number">${score}</span>
        <span class="gs-alert-overlay__score-label">/ 100</span>
      </div>
    `;

    const pUrl = document.createElement('p');
    pUrl.className = 'gs-alert-overlay__url';
    pUrl.textContent = url || window.location.href;

    const reasonsDiv = document.createElement('div');
    reasonsDiv.className = 'gs-alert-overlay__reasons';
    const h3 = document.createElement('h3');
    h3.textContent = 'Motivos do alerta:';
    const ul = document.createElement('ul');
    
    const reasons = [];
    if (results) {
      if (results.phishTank?.threat) reasons.push('Detectado como Phishing (PhishTank)');
      if (results.safeBrowsing?.threat) reasons.push('Marcado pelo Google Safe Browsing');
      if (results.urlhaus?.threat) reasons.push('URL de malware conhecida (URLHaus)');
      if (results.whois?.threat) reasons.push(`Domínio muito novo (${results.whois.age} dias)`);
      if (results.ipgeo?.threat) reasons.push(`Servidor em país de risco (${results.ipgeo.countryCode})`);
      if (results.virusTotal?.threat) reasons.push(`${results.virusTotal.positives} detecções no VirusTotal`);
      if (results.domAnalysis?.threat) reasons.push('Elementos DOM suspeitos detectados');
      if (results.heuristics?.threat) reasons.push('Padrões heurísticos suspeitos');
      if (results.screenshotHash?.threat) reasons.push(`Visual similar a ${results.screenshotHash.bestMatch}`);
    }

    if (reasons.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Score de risco elevado baseado em múltiplas verificações';
      ul.appendChild(li);
    } else {
      reasons.forEach(rText => {
        const li = document.createElement('li');
        li.textContent = rText;
        ul.appendChild(li);
      });
    }
    reasonsDiv.append(h3, ul);

    const actions = document.createElement('div');
    actions.className = 'gs-alert-overlay__actions';
    
    const btnLeave = document.createElement('button');
    btnLeave.id = 'gs-btn-leave';
    btnLeave.className = 'gs-alert-overlay__btn gs-alert-overlay__btn--danger';
    btnLeave.textContent = '← Sair agora (recomendado)';
    
    const btnContinue = document.createElement('button');
    btnContinue.id = 'gs-btn-continue';
    btnContinue.className = 'gs-alert-overlay__btn gs-alert-overlay__btn--secondary';
    btnContinue.textContent = 'Apenas continuar →';
    
    const btnIncognito = document.createElement('button');
    btnIncognito.id = 'gs-btn-incognito';
    btnIncognito.className = 'gs-alert-overlay__btn gs-alert-overlay__btn--secondary';
    btnIncognito.style.cssText = 'margin-top: 10px; background-color: #6b21a8; border-color: #9333ea; color: white; width: 100%;';
    btnIncognito.textContent = '🕵️ Abrir Limpo (Modo Isolamento)';
    
    actions.append(btnLeave, btnContinue, btnIncognito);

    const disclaimer = document.createElement('p');
    disclaimer.className = 'gs-alert-overlay__disclaimer';
    disclaimer.textContent = '⚠️ Sites com score acima de 75 apresentam alto risco de phishing, malware ou fraude. Recomendamos fortemente que você não insira dados pessoais neste site.';

    card.append(header, scoreRing, pUrl, reasonsDiv, actions, disclaimer);
    alertOverlay.append(backdrop, card);

    shadowRoot.appendChild(alertOverlay);
    document.body.appendChild(host);

    requestAnimationFrame(() => {
      alertOverlay.classList.add('gs-alert-overlay--visible');
    });

    btnLeave.addEventListener('click', () => {
      window.history.back();
      setTimeout(() => {
        if (window.location.href === url) {
          window.location.href = 'about:blank';
        }
      }, 500);
    });

    btnContinue.addEventListener('click', () => {
      alertOverlay.classList.remove('gs-alert-overlay--visible');
      setTimeout(() => {
        host.remove();
        alertOverlay = null;
      }, 400);
      showMiniAlert(
        '⚠️ Prosseguindo por sua conta e risco',
        'A proteção de clipboard permanece ativa. Não insira dados sensíveis.',
        'warning'
      );
    });

    btnIncognito.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_INCOGNITO', url: url || window.location.href });
      btnLeave.click();
    });
  }

  // ═══════════════════════════════════════════════════
  // Sandbox — Isola conteúdo
  // ═══════════════════════════════════════════════════
  function activateSandbox() {
    if (isSandboxed) return;
    isSandboxed = true;

    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showMiniAlert(
          'Formulário bloqueado',
          'GuardianShield está impedindo envio de dados para site suspeito.',
          'danger'
        );
      }, true);
    });

    document.querySelectorAll('input[type="password"], input[type="text"], input[type="email"], input[type="tel"]')
      .forEach(input => {
        input.addEventListener('focus', () => {
          showMiniAlert(
            'Campo bloqueado',
            'Não insira dados pessoais em sites com risco elevado.',
            'danger'
          );
        });
        input.setAttribute('readonly', 'true');
        input.style.opacity = '0.5';
        input.style.cursor = 'not-allowed';
      });

    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('http') && !href.includes(window.location.hostname)) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          showMiniAlert('Link bloqueado', 'Links externos foram bloqueados neste site.', 'warning');
        });
        link.style.pointerEvents = 'none';
        link.style.opacity = '0.5';
      }
    });

    document.documentElement.style.border = '4px solid #DC2626';
    document.documentElement.style.boxSizing = 'border-box';

    console.log('[GuardianShield] 🔴 SANDBOX ATIVADO — Formulários e inputs bloqueados');
  }

  // ═══════════════════════════════════════════════════
  // Message listener
  // ═══════════════════════════════════════════════════
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'GS_HEARTBEAT':
        sendResponse(true);
        break;

      case 'COMPUTE_PHASH':
        if (window.GuardianPHash && message.imageData) {
          window.GuardianPHash.compute(message.imageData)
            .then(hash => sendResponse({ hash }))
            .catch(err => sendResponse({ error: err.message }));
          return true;
        }
        sendResponse({ error: 'pHash not available' });
        break;

      case 'SHOW_ALERT':
        showFullAlert(
          message.data.score,
          message.data.results,
          message.data.url
        );
        sendResponse({ ok: true });
        break;

      case 'ACTIVATE_SANDBOX':
        activateSandbox();
        sendResponse({ ok: true });
        break;

      case 'ACTIVATE_ELEMENT_PICKER':
        activateElementPicker();
        sendResponse({ ok: true });
        break;

      case 'GET_DOM_INFO':
        sendResponse({
          hostname: window.location.hostname,
          url: window.location.href,
          title: document.title,
          forms: document.querySelectorAll('form').length,
          iframes: document.querySelectorAll('iframe').length,
          scripts: document.querySelectorAll('script').length
        });
        break;
    }
  });

  // ═══════════════════════════════════════════════════
  // Utilidades
  // ═══════════════════════════════════════════════════
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function debounceLight(fn, delay) {
    let timer = null;
    return function() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { timer = null; fn(); }, delay);
    };
  }

  // ═══════════════════════════════════════════════════
  // Advanced Enterprise Security Features
  // ═══════════════════════════════════════════════════
  function initIframeSandboxing() {
    function enforceSandbox(node) {
      if (node.tagName === 'IFRAME') {
         if(!node.hasAttribute('sandbox')) {
           node.setAttribute('sandbox', 'allow-scripts allow-same-origin');
           node.setAttribute('gs-sandboxed', 'true');
         }
      } else if (node.querySelectorAll) {
         node.querySelectorAll('iframe:not([sandbox])').forEach(iframe => {
           iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
           iframe.setAttribute('gs-sandboxed', 'true');
         });
      }
    }
    
    enforceSandbox(document);

    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => m.addedNodes.forEach(enforceSandbox));
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    // console.log('[GuardianShield] IFrame Sandboxing Strict Enforcement ativado.');
  }

  // ═══════════════════════════════════════════════════
  // 💳 Anti-Skimmer — Proteção em páginas de Checkout
  // ═══════════════════════════════════════════════════
  function initAntiSkimmer() {
    const checkoutKeywords = ['checkout', 'payment', 'cart', 'pago', 'compra', 'finalizar', 'billing', 'basket'];
    const currentUrl = window.location.href.toLowerCase();
    const isCheckoutPage = checkoutKeywords.some(k => currentUrl.includes(k));

    if (!isCheckoutPage) return;

    // 1. Monitorar campos sensíveis
    const sensitiveSelectors = [
      'input[type="password"]', 
      'input[autocomplete*="cc-"]',
      '#card-number', '#cc-number', '#cvv', '#card-cvv', '#expiry',
      '[name*="cardnumber"]', '[name*="cvv"]', '[name*="expiry"]'
    ];

    const monitorFields = () => {
      sensitiveSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(field => {
          if (field.dataset.gsMonitored) return;
          field.dataset.gsMonitored = 'true';

          const handleInput = (e) => {
            if (e.isTrusted === false) {
              console.warn('[GS] Possível tentativa de Skimming detectada via evento simulado.');
              sendSkimmerAlert();
            }
          };

          field.addEventListener('input', debounceLight(handleInput, 1000));
        });
      });
    };

    // 2. Detectar injeção de scripts suspeitos em campos de checkout
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          monitorFields();
          
          mutation.addedNodes.forEach(node => {
            if (node.nodeName === 'IFRAME' || node.nodeName === 'SCRIPT') {
              const src = node.src || node.getAttribute('src');
              if (src && isSuspiciousSource(src)) {
                node.remove();
                console.error('[GS] Script/Iframe de Skimming bloqueado:', src);
                sendSkimmerAlert();
              }
            }
          });
        }
      });
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
    monitorFields();
  }

  function isSuspiciousSource(src) {
    try {
      const url = new URL(src, window.location.href);
      const host = url.hostname;
      const currentHost = window.location.hostname;
      
      const whitelist = ['stripe.com', 'paypal.com', 'pagseguro.uol.com.br', 'mercadopago.com', 'google.com', 'gstatic.com', 'facebook.net'];
      if (host === currentHost) return false;
      if (whitelist.some(w => host.endsWith(w))) return false;
      
      return true;
    } catch(e) { return false; }
  }

  function sendSkimmerAlert() {
    chrome.runtime.sendMessage({ 
      type: 'SKIMMER_ALERT', 
      hostname: window.location.hostname,
      url: window.location.href
    });
  }

  function initAntiCryptojacking() {
    const blockScript = document.createElement('script');
    blockScript.textContent = `
      (function() {
        if (typeof window.WebAssembly === 'object') {
          const originalInstantiate = WebAssembly.instantiate;
          WebAssembly.instantiate = function(bufferSource, importObject) {
             return originalInstantiate(bufferSource, importObject).catch(e => {
                console.warn('[GuardianShield] Possível mineração via WASM bloqueada.');
                throw e;
             });
          };
        }
        window.CoinHive = { Anonymous: function() { return { start: function(){} } } };
        window.CH = window.CoinHive;
        window.Miner = { start: function(){} };
      })();
    `;
    document.documentElement.appendChild(blockScript);
    blockScript.remove();
    // console.log('[GuardianShield] Heurística Anti-Cryptojacking engajada.');
  }

  function initBlockBeacon() {
    const script = document.createElement('script');
    script.textContent = `
      if (navigator.sendBeacon) {
        navigator.sendBeacon = function() {
          console.warn('[GuardianShield] Rastreamento furtivo (Beacon) bloqueado.');
          return true; // Finge sucesso para não quebrar a página
        };
      }
    `;
    document.documentElement.appendChild(script);
    script.remove();
  }

  function initBlockCanvas() {
    const script = document.createElement('script');
    script.textContent = `
      (function() {
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;

        HTMLCanvasElement.prototype.toDataURL = function(...args) {
          console.warn('[GuardianShield] Canvas fingerprinting ofuscado (toDataURL).');
          const context = this.getContext('2d');
          if (context) {
             context.fillStyle = 'rgba(' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 255) + ', 0.01)';
             context.fillRect(0, 0, 1, 1);
          }
          return originalToDataURL.apply(this, args);
        };

        CanvasRenderingContext2D.prototype.getImageData = function(...args) {
          console.warn('[GuardianShield] Canvas fingerprinting ofuscado (getImageData).');
          const data = originalGetImageData.apply(this, args);
          if (data && data.data && data.data.length) {
             for (let i = 0; i < data.data.length; i += Math.floor(Math.random() * 10 + 1)) {
                data.data[i] = data.data[i] ^ (Math.random() * 10);
             }
          }
          return data;
        };
      })();
    `;
    document.documentElement.appendChild(script);
    script.remove();
  }

  // ═══════════════════════════════════════════════════
  // Inicialização
  // ═══════════════════════════════════════════════════
  function init() {
    initClipboardGuard();

    // Carregar config de AdBlock e ativar módulos
    chrome.runtime.sendMessage({ type: 'GET_ADBLOCK_CONFIG' }, (cfg) => {
      adblockConfig = cfg || {};
      if (adblockConfig.blockCookiePopups) initCookieBlocker();
      if (adblockConfig.blockPushNotifications) initPushBlocker();
      if (adblockConfig.blockDistractions) initDistractionBlocker();
      if (adblockConfig.blockSocialTracking) initSocialBlocker();
      if (adblockConfig.iframeSandbox) initIframeSandboxing();
      if (adblockConfig.antiCryptojacking) initAntiCryptojacking();
      if (adblockConfig.blockBeacon) initBlockBeacon();
      if (adblockConfig.blockCanvas) initBlockCanvas();
    });

    // Aplicar regras customizadas de bloqueio
    applyCustomRules();

    console.log('[GuardianShield] Content script carregado ');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();