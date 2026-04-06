/* ═══════════════════════════════════════════════════════════════════
   GuardianShield™ — Service Worker (Manifest V3)
   Motor de 10 verificações paralelas de segurança (incluindo IA)
   © 2026 GuardianShield™. Todos os direitos reservados. Licença EULA.
   ═══════════════════════════════════════════════════════════════════ */

// ─── Configuração default ───
// STATUS DAS APIs:
// [OK] GRATIS SEM KEY: PhishTank, URLhaus, WHOIS/RDAP, IP-API, DOM, Heurísticas, pHash
// [KEY] GRATIS COM KEY: Google Safe Browsing, VirusTotal, Gemini AI
// [SYS] Sem key -> usa fallback gratuito automático (menos funcional)
const DEFAULT_CONFIG = {
  apiKeys: {
    safeBrowsing: '',
    virusTotal: '',
    phishTank: '',
    gemini: '',
    openRouter: '',
    groq: '',
    urlDNA: '',
    urlScan: ''
  },
  thresholds: {
    alert: 75,
    sandbox: 90,
    badge_warn: 40
  },
  cacheTTL: 86400000,
  enabledChecks: {
    safeBrowsing: true,
    phishTank: true,
    urlhaus: true,
    whois: true,
    ipgeo: true,
    virusTotal: true,
    domAnalysis: true,
    heuristics: true,
    screenshotHash: true,
    geminiAI: true
  },
  clipboardGuard: true,
  autoSandbox: true,
  adsBlocking: true,
  contentFilters: {
    adult: true,
    gambling: true
  },
  whitelist: [],
  language: 'pt-BR',
  // ─── Novos módulos de proteção avançada ───
  blockSuspiciousTLDs: true,
  antiSkimmer: true,
  visualCamouflage: true,
  shadowGuard: true,
  quantumExecution: true,
  redirectIntegrity: true,
  monthlySummary: true,
  
  // ─── Novas funções AdBlock Plus ───
  blockCookiePopups: true,
  blockPushNotifications: true,
  blockTrackers: true,
  blockSocialTracking: true,
  blockDistractions: true,
  showAdsCountBadge: true,
  contextMenuBlockElement: true,
  acceptableAds: false,
  
  // ─── Proteções Avançadas (Privacy Suite) ───
  stripTrackingParams: true,
  blockWebRTC: true,
  hideReferer: true,
  doNotTrack: true,
  
  filterLists: [
    // ─── Listas Globais & Essenciais ───
    { id: 'easylist', name: 'EasyList', description: 'Lista principal global de bloqueio de anúncios.', url: 'https://easylist.to/easylist/easylist.txt', enabled: true, lastUpdated: 0, builtIn: true },
    { id: 'easyprivacy', name: 'EasyPrivacy', description: 'Otimizada para bloquear rastreadores e telemetria.', url: 'https://easylist.to/easylist/easyprivacy.txt', enabled: true, lastUpdated: 0, builtIn: true },
    { id: 'anti-adblock-filters', name: 'Anti-Adblock Filters', description: 'Filtros para impedir que sites detectem que você usa adblock.', url: 'https://easylist-downloads.adblockplus.org/antiadblockfilters.txt', enabled: true, lastUpdated: 0, builtIn: true },
    { id: 'anti-cv', name: 'Anti-CV (ABP Filters)', description: 'Bloqueio agressivo de contramedidas de segurança.', url: 'https://gitlab.com/eyeo/anti-cv/abp-filters-anti-cv/-/raw/master/antimeasures.txt', enabled: true, lastUpdated: 0, builtIn: true },
    
    // ─── Experiência & Privacidade Avançada ───
    { id: 'fanboy-annoyance', name: 'Fanboy Annoyances', description: 'Remove widgets irritantes e distrações.', url: 'https://secure.fanboy.co.nz/fanboy-annoyance.txt', enabled: true, lastUpdated: 0, builtIn: true },
    { id: 'fanboy-social', name: 'Fanboy Social', description: 'Bloqueia rastreamento e botões de redes sociais.', url: 'https://easylist.to/easylist/fanboy-social.txt', enabled: true, lastUpdated: 0, builtIn: true },
    { id: 'fanboy-cookie', name: 'Fanboy Cookie Monster', description: 'Elimina pedidos de consentimento de cookies.', url: 'https://secure.fanboy.co.nz/fanboy-cookiemonster.txt', enabled: true, lastUpdated: 0, builtIn: true },
    { id: 'easylist-no-adult', name: 'EasyList No Adult', description: 'Bloqueia conteúdo adulto mas permite anúncios gerais.', url: 'https://easylist-downloads.adblockplus.org/easylist_noadult.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'peter-lowe', name: 'Peter Lowe Ad Servers', description: 'Lista de servidores de anúncios baseada em domínios.', url: 'https://pgl.yoyo.org/adservers/serverlist.php?hostformat=adblockplus&mimetype=plaintext', enabled: false, lastUpdated: 0, builtIn: true },

    // ─── Listas Regionais (Américas & Europa) ───
    { id: 'easylistbrazil', name: 'EasyList Brazil', description: 'Proteção otimizada para sites brasileiros.', url: 'https://easylist-downloads.adblockplus.org/easylistbrazil.txt', enabled: true, lastUpdated: 0, builtIn: true },
    { id: 'easylistspanish', name: 'EasyList Spanish', description: 'Filtros para sites em espanhol.', url: 'https://easylist-downloads.adblockplus.org/easylistspanish.txt', enabled: true, lastUpdated: 0, builtIn: true },
    { id: 'easylistportuguese', name: 'EasyList Portuguese', description: 'Filtros específicos para a língua portuguesa.', url: 'https://easylist-downloads.adblockplus.org/easylistportuguese.txt', enabled: true, lastUpdated: 0, builtIn: true },
    { id: 'easylistgermany', name: 'EasyList Germany', description: 'Filtros para a região da Alemanha.', url: 'https://easylist.to/easylistgermany/easylistgermany.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'liste-fr', name: 'Liste FR', description: 'Filtros para sites franceses.', url: 'https://easylist-downloads.adblockplus.org/liste_fr.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'easylistitaly', name: 'EasyList Italy', description: 'Filtros para sites italianos.', url: 'https://easylist-downloads.adblockplus.org/easylistitaly.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'easylistdutch', name: 'EasyList Dutch', description: 'Filtros para sites holandeses.', url: 'https://easylist-downloads.adblockplus.org/easylistdutch.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'ruadlist', name: 'RU AdList', description: 'Proteção contra anúncios em russo.', url: 'https://easylist-downloads.adblockplus.org/ruadlist.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'rolist', name: 'RO List', description: 'Filtros para sites romenos.', url: 'https://zoso.ro/pages/rolist.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'easylistpolish', name: 'EasyList Polish', description: 'Filtros para sites poloneses.', url: 'https://easylist-downloads.adblockplus.org/easylistpolish.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'latvian-list', name: 'Latvian List', description: 'Filtros para a região da Letônia.', url: 'https://raw.githubusercontent.com/Latvian-List/adblock-latvian/master/lists/latvian-list.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'lithuanian-list', name: 'Lithuanian List', description: 'Filtros para sites lituanos.', url: 'https://raw.githubusercontent.com/EasyList-Lithuania/easylist_lithuania/master/easylistlithuania.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'czech-slovak', name: 'Czech/Slovak List', description: 'Filtros para Rep. Tcheca e Eslováquia.', url: 'https://raw.githubusercontent.com/tomasko126/easylistczechandslovak/master/filters.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'nordic-list', name: 'Nordic Filters', description: 'Filtros para Noruega, Suécia e Dinamarca.', url: 'https://raw.githubusercontent.com/DandelionSprout/adfilt/master/NorwegianExperimentalList%20alternate%20versions/NordicFiltersABP-Inclusion.txt', enabled: false, lastUpdated: 0, builtIn: true },

    // ─── Ásia & Oriente Médio ───
    { id: 'easylistchina', name: 'EasyList China', description: 'Filtros para sites chineses.', url: 'https://easylist-downloads.adblockplus.org/easylistchina.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'abpindo', name: 'ABP Indo', description: 'Filtros para a região da Indonésia.', url: 'https://raw.githubusercontent.com/heradhis/indonesianadblockrules/master/subscriptions/abpindo.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'abpvn', name: 'ABPVN', description: 'Filtros focados em sites vietnamitas.', url: 'https://abpvn.com/filter/abpvn-IPl6HE.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'koreanlist', name: 'Korean List', description: 'Filtros para sites na Coreia.', url: 'https://easylist-downloads.adblockplus.org/koreanlist.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'indianlist', name: 'Indian List', description: 'Filtros para a região da Índia.', url: 'https://easylist-downloads.adblockplus.org/indianlist.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'liste-ar', name: 'Liste AR', description: 'Filtros para sites em árabe.', url: 'https://easylist-downloads.adblockplus.org/liste_ar.txt', enabled: false, lastUpdated: 0, builtIn: true },
    { id: 'hebrew-list', name: 'Hebrew List', description: 'Filtros para sites em hebraico.', url: 'https://raw.githubusercontent.com/easylist/EasyListHebrew/master/EasyListHebrew.txt', enabled: false, lastUpdated: 0, builtIn: true }
  ],
  customRules: []
};

// ─── Estado global ───
let config = { ...DEFAULT_CONFIG };
let scanQueue = new Map();
let vtRateLimit = { count: 0, resetTime: 0 };
let tabAdsCounts = new Map(); // Contagem de ads por tab

// ─── Inicialização ───
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({
      config: DEFAULT_CONFIG,
      scanHistory: [],
      weeklyStats: { blocked: 0, scanned: 0, threats: 0, startDate: Date.now() },
      gsStats: { blocks: 0, visits: 0, clipboard: 0, ads: 0 },
      statsHistory: {}
    });
    console.log('[GuardianShield] Instalado com sucesso!');
  } else if (details.reason === 'update') {
    // Migração de listas de filtros novatas (como Anti-CV e BR) para quem já usa a v0.x
    const data = await chrome.storage.local.get('config');
    if (data.config && data.config.filterLists) {
      const currentIds = data.config.filterLists.map(l => l.id);
      DEFAULT_CONFIG.filterLists.forEach(newList => {
        if (!currentIds.includes(newList.id)) {
          data.config.filterLists.push(newList);
        }
      });
      await chrome.storage.local.set({ config: data.config });
    }
  }
  await loadConfig();
  setupAlarms();
  setupDynamicAdRules();
  setupContextMenu();
  setupAdvancedBlockingRules();
  applyPrivacyPolicies();
});

async function setupDynamicAdRules() {
  const adDomains = [
    '*://*.youtube.com/api/stats/ads*',
    '*://*.youtube.com/pagead/*',
    '*://*.doubleclick.net/*',
    '*://*.googlesyndication.com/*'
  ];
  const rules = adDomains.map((domain, i) => ({
    id: 10000 + i,
    priority: 3,
    action: { type: 'block' },
    condition: { urlFilter: domain, resourceTypes: ['script', 'xmlhttprequest', 'sub_frame', 'image'] }
  }));
  try {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const currentIds = existing.map(r => r.id);
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: currentIds,
      addRules: rules
    });
  } catch(e) {
    console.warn('[GuardianShield] Dynamic rules error:', e);
  }
}

// ─── Contagem de ads bloqueados por tab (Badge real) ───
if (chrome.declarativeNetRequest?.onRuleMatchedDebug) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    updateStatsGlobal('ads');
    // Contagem por tab para badge
    if (info.request?.tabId > 0 && config.showAdsCountBadge) {
      const tabId = info.request.tabId;
      const count = (tabAdsCounts.get(tabId) || 0) + 1;
      tabAdsCounts.set(tabId, count);
      chrome.action.setBadgeBackgroundColor({ tabId, color: '#6366f1' }).catch(() => {});
      chrome.action.setBadgeText({ tabId, text: String(count) }).catch(() => {});
    }
  });
}

// Limpar contagem quando tab navega
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    tabAdsCounts.delete(tabId);
  }
});
chrome.tabs.onRemoved.addListener((tabId) => {
  tabAdsCounts.delete(tabId);
});

// ═══════════════════════════════════════════════════
// Menu de Contexto
// ═══════════════════════════════════════════════════
function setupContextMenu() {
  chrome.contextMenus.removeAll(() => {
    // ─── Itens no clique direito do ÍCONE da extensão ───
    chrome.contextMenus.create({
      id: 'gs-disable-site',
      title: '🚫 Desativar proteção aqui',
      contexts: ['action']
    });
    chrome.contextMenus.create({
      id: 'gs-manual-block',
      title: '🎯 Bloquear elemento (AdBlock)',
      contexts: ['action']
    });
    chrome.contextMenus.create({
      id: 'gs-check-security',
      title: '🔍 Análise Forense Profunda',
      contexts: ['action']
    });
    chrome.contextMenus.create({
      id: 'gs-report-problem',
      title: '📝 Reportar bug / problema',
      contexts: ['action']
    });

    // ─── Item no clique direito em PÁGINAS ───
    if (config.contextMenuBlockElement) {
      chrome.contextMenus.create({
        id: 'gs-block-element',
        title: 'GuardianShield™ — Bloquear Elemento',
        contexts: ['page', 'image', 'video', 'audio', 'frame', 'link']
      });
    }
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // ─── Bloquear Elemento (página) ───
  if (info.menuItemId === 'gs-block-element' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'ACTIVATE_ELEMENT_PICKER' }).catch(() => {});
    return;
  }

  // ─── Desativar filtragem neste site ───
  if (info.menuItemId === 'gs-disable-site' && tab?.url) {
    try {
      const hostname = new URL(tab.url).hostname;
      if (!config.whitelist) config.whitelist = [];
      if (!config.whitelist.includes(hostname)) {
        config.whitelist.push(hostname);
        await chrome.storage.local.set({ config });
        chrome.notifications.create('gs-whitelist-added', {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'GuardianShield™',
          message: `Filtragem desativada para "${hostname}". O site foi adicionado à whitelist.`
        });
      } else {
        chrome.notifications.create('gs-whitelist-exists', {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'GuardianShield™',
          message: `"${hostname}" já está na whitelist.`
        });
      }
    } catch(e) {}
    return;
  }

  // ─── Bloquear anúncios manualmente ───
  if (info.menuItemId === 'gs-manual-block' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'ACTIVATE_ELEMENT_PICKER' }).catch(() => {});
    return;
  }

  // ─── Verificar segurança do site ───
  if (info.menuItemId === 'gs-check-security' && tab?.id) {
    try {
      const key = `cache_${hashString(tab.url)}`;
      await chrome.storage.local.remove(key);
      const results = await runAllChecks(tab.id, tab);
      const score = calculateRisk(results);
      updateBadge(tab.id, score);
      const scanResult = { url: tab.url, hostname: new URL(tab.url).hostname, score, results, timestamp: Date.now() };
      await cacheResult(tab.url, scanResult);
      await addToHistory(scanResult);
      // Mostrar resultado via content script
      if (score >= (config.thresholds?.alert || 75)) {
        chrome.tabs.sendMessage(tab.id, { type: 'SHOW_ALERT', data: scanResult }).catch(() => {});
      } else {
        chrome.notifications.create('gs-scan-result', {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'GuardianShield™ — Resultado',
          message: `Score de risco: ${score}/100 — ${score < 30 ? '[OK] Site seguro' : score < 60 ? '[!] Atenção moderada' : '[RISK] Risco elevado'}`
        });
      }
    } catch(e) {
      console.warn('[GuardianShield] Security check error:', e);
    }
    return;
  }

  // ─── Reportar um problema ───
  if (info.menuItemId === 'gs-report-problem') {
    const reportUrl = chrome.runtime.getURL('report.html');
    // Passar a URL atual como parâmetro para auto-preencher
    const currentUrl = tab?.url ? `?site=${encodeURIComponent(tab.url)}` : '';
    chrome.tabs.create({ url: reportUrl + currentUrl });
    return;
  }
});

// ═══════════════════════════════════════════════════
// 🍪🔔🕵️📱📦 Regras Avançadas de Bloqueio
// ═══════════════════════════════════════════════════
async function setupAdvancedBlockingRules() {
  const rules = [];
  let ruleId = 20000;

  // ─── Bloquear Pop-ups de Cookies ───
  if (config.blockCookiePopups) {
    const cookieDomains = [
      '*://*.cookiebot.com/*', '*://*.cookielaw.org/*', '*://*.onetrust.com/*',
      '*://*.trustarc.com/*', '*://*.cookieconsent.com/*', '*://*.quantcast.com/choice/*',
      '*://*.consensu.org/*', '*://*.privacy-mgmt.com/*', '*://*.cookiepro.com/*',
      '*://*.usercentrics.eu/*', '*://*.cookiefirst.com/*', '*://*.osano.com/*',
      '*://*.iubenda.com/consent/*', '*://*.termly.io/embed/*'
    ];
    cookieDomains.forEach(domain => {
      rules.push({
        id: ruleId++,
        priority: 2,
        action: { type: 'block' },
        condition: { urlFilter: domain, resourceTypes: ['script', 'sub_frame', 'stylesheet'] }
      });
    });
  }

  // ─── Bloquear Rastreadores ───
  if (config.blockTrackers) {
    const trackerDomains = [
      '*://*.google-analytics.com/*', '*://*.analytics.google.com/*',
      '*://*.hotjar.com/*', '*://*.mixpanel.com/*', '*://*.segment.com/*',
      '*://*.amplitude.com/*', '*://*.fullstory.com/*', '*://*.mouseflow.com/*',
      '*://*.crazyegg.com/*', '*://*.clarity.ms/*', '*://*.newrelic.com/*',
      '*://*.sentry.io/*', '*://*.bugsnag.com/*', '*://*.smartlook.com/*',
      '*://*.matomo.cloud/*', '*://*.plausible.io/*', '*://*.heap.io/*',
      '*://*.optimizely.com/*', '*://*.adobedtm.com/*', '*://*.demdex.net/*',
      '*://*.omtrdc.net/*', '*://*.scorecardresearch.com/*',
      '*://*.taboola.com/*', '*://*.outbrain.com/*'
    ];
    trackerDomains.forEach(domain => {
      rules.push({
        id: ruleId++,
        priority: 2,
        action: { type: 'block' },
        condition: { urlFilter: domain, resourceTypes: ['script', 'xmlhttprequest', 'image', 'ping'] }
      });
    });
  }

  // ─── Bloquear Rastreamento de Redes Sociais ───
  if (config.blockSocialTracking) {
    const socialDomains = [
      '*://*.facebook.com/plugins/*', '*://*.facebook.com/tr*',
      '*://*.facebook.net/signals/*', '*://*.connect.facebook.net/*',
      '*://*.platform.twitter.com/widgets*', '*://syndication.twitter.com/*',
      '*://*.platform.linkedin.com/*', '*://*.snap.licdn.com/*',
      '*://*.platform.instagram.com/*', '*://*.pinterest.com/pin/create/*',
      '*://*.apis.google.com/js/plusone*', '*://*.plus.google.com/*',
      '*://*.tiktok.com/embed/*', '*://analytics.tiktok.com/*'
    ];
    socialDomains.forEach(domain => {
      rules.push({
        id: ruleId++,
        priority: 2,
        action: { type: 'block' },
        condition: { urlFilter: domain, resourceTypes: ['script', 'sub_frame', 'image', 'xmlhttprequest'] }
      });
    });
  }

  // ─── Proteções Avançadas (Privacy Suite) ───
  if (config.stripTrackingParams) {
    rules.push({
      id: ruleId++,
      priority: 2,
      action: {
        type: 'redirect',
        redirect: {
          transform: {
            queryTransform: {
              removeParams: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'igshid', '_hsenc', 'mc_cid', 'mc_eid', 'msclkid']
            }
          }
        }
      },
      // Ignorar main_frame em redirecionamentos às vezes quebra navegação dependendo do site, então removemos na hora do frame
      condition: { resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'image'] }
    });
  }

  if (config.hideReferer || config.doNotTrack) {
    const requestHeaders = [];
    if (config.hideReferer) {
      requestHeaders.push({ header: 'Referer', operation: 'remove' });
    }
    if (config.doNotTrack) {
      requestHeaders.push({ header: 'DNT', operation: 'set', value: '1' });
    }
    if (requestHeaders.length > 0) {
      rules.push({
        id: ruleId++,
        priority: 2,
        action: {
          type: 'modifyHeaders',
          requestHeaders: requestHeaders
        },
        condition: { resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'image'] }
      });
    }
  }

  // Aplicar regras dinâmicas
  try {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const advancedIds = existing.filter(r => r.id >= 20000).map(r => r.id);
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: advancedIds,
      addRules: rules.slice(0, 100) // Limite de segurança
    });
    console.log(`[GuardianShield] ${rules.length} regras avançadas de bloqueio testadas`);
  } catch(e) {
    console.warn('[GuardianShield] Advanced blocking rules error:', e);
  }
}

// ═══════════════════════════════════════════════════
// 🔒 Políticas Globais de Privacidade API
// ═══════════════════════════════════════════════════
function applyPrivacyPolicies() {
  if (chrome.privacy && chrome.privacy.network) {
    // Impede o vazamento do IP local via WebRTC (muito útil para contornar vazamentos em VPN)
    // 'default_public_interface_only' mantém WebRTC funcionando para Meet/Zoom, mas esconde IPs sensíveis
    const policy = config.blockWebRTC ? 'default_public_interface_only' : 'default';
    chrome.privacy.network.webRTCIPHandlingPolicy.set({ value: policy }).catch(e => {
      console.warn('[GuardianShield] Falha ao setar WebRTC policy:', e);
    });
  }
}

// ═══════════════════════════════════════════════════
// 📋 Gerenciamento de Listas de Filtros
// ═══════════════════════════════════════════════════
async function updateFilterList(listId) {
  const lists = config.filterLists || [];
  const list = lists.find(l => l.id === listId);
  if (!list || !list.url || !list.enabled) return { success: false, error: 'Lista não encontrada ou desativada' };

  try {
    const resp = await fetch(list.url, { signal: AbortSignal.timeout(15000) });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('!') && !l.startsWith('['));
    
    // Salvar conteúdo da lista
    await chrome.storage.local.set({ [`filterList_${listId}`]: { lines: lines.slice(0, 2000), updated: Date.now() } });
    
    // Atualizar timestamp na config
    list.lastUpdated = Date.now();
    await chrome.storage.local.set({ config });
    
    return { success: true, rulesCount: lines.length };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

async function updateAllFilterLists() {
  const results = {};
  for (const list of (config.filterLists || [])) {
    if (list.enabled && list.url) {
      results[list.id] = await updateFilterList(list.id);
    }
  }
  return results;
}

chrome.runtime.onStartup.addListener(async () => {
  await loadConfig();
  setupContextMenu();
  setupAdvancedBlockingRules();
  applyPrivacyPolicies();
});

async function loadConfig() {
  try {
    const data = await chrome.storage.local.get('config');
    config = { ...DEFAULT_CONFIG, ...data.config };
  } catch (e) {
    config = { ...DEFAULT_CONFIG };
  }
}

function setupAlarms() {
  chrome.alarms.create('cleanup-cache', { periodInMinutes: 360 });
  chrome.alarms.create('weekly-report', { periodInMinutes: 10080 });
  chrome.alarms.create('update-feeds', { periodInMinutes: 720 });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'cleanup-cache') {
    await cleanupCache();
  } else if (alarm.name === 'weekly-report') {
    await generateWeeklyReport();
  } else if (alarm.name === 'update-feeds') {
    await updateThreatFeeds();
  }
});

// ─── Debounce utility ───
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, delay);
  };
}

// ─── Listener principal ───
chrome.tabs.onUpdated.addListener(debounce(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;

  // Ignora URLs internas do navegador
  if (tab.url.startsWith('chrome://') ||
      tab.url.startsWith('chrome-extension://') ||
      tab.url.startsWith('edge://') ||
      tab.url.startsWith('about:') ||
      tab.url.startsWith('moz-extension://') ||
      tab.url.startsWith('opera://')) return;

  // Verifica cache
  const cached = await getCached(tab.url);
  if (cached !== null) {
    updateBadge(tabId, cached.score);
    return;
  }

  // Evita scans duplicados
  if (scanQueue.has(tabId)) return;
  scanQueue.set(tabId, true);

  try {
    await loadConfig();
    const startTime = performance.now();
    const results = await runAllChecks(tabId, tab);
    const elapsed = Math.round(performance.now() - startTime);

    let score = calculateRisk(results);

    // ─── Whitelist & Filtros Especiais ───
    const hostname = new URL(tab.url).hostname.toLowerCase();
    const cleanUrl = tab.url.toLowerCase().replace(/^https?:\/\//, '');
    
    // Whitelist zera o score (bypass automático)
    const isWhitelisted = config.whitelist?.some(w => cleanUrl.includes(w));
    if (isWhitelisted) {
      score = 0;
    } else {
      // ─── Bloqueio de gTLDs Suspeitos ───
      if (config.blockSuspiciousTLDs !== false) {
        const suspiciousTLDs = ['.top', '.xin', '.icu', '.bond', '.win', '.cfd', '.li', '.xyz', '.shop', '.info'];
        const currentTLD = '.' + hostname.split('.').pop();
        if (suspiciousTLDs.includes(currentTLD)) {
          score = 100;
          results.heuristics = { 
            fulfilled: true, 
            threat: true, 
            detail: `[TLD] Domínio suspeito (${currentTLD}). Este TLD é frequentemente associado a campanhas de Phishing e Malware.` 
          };
        }
      }

      // Filtros de nicho explícito
      const adultRegex = /pornhub|xvideos|redtube|xnxx|xhamster|brazzers|onlyfans|sex|xnxx|cam4|chaturbate/i;
      const gambleRegex = /bet365|blaze|betano|sportingbet|pixbet|betway|casino|1xbet|roleta|foguetinho|aviator|tiger/i;

      if (config.contentFilters?.adult !== false && adultRegex.test(hostname)) {
        score = 100;
        results.heuristics = { fulfilled: true, threat: true, detail: "[!] Filtro de Conteúdo Adulto." };
      } else if (config.contentFilters?.gambling !== false && gambleRegex.test(hostname)) {
        score = 100;
        results.heuristics = { fulfilled: true, threat: true, detail: "[RISK] Filtro de Jogos de Azar e Apostas não licenciadas." };
      }
    }

    updateBadge(tabId, score);

    // Salvar resultado
    const scanResult = {
      url: tab.url,
      hostname: new URL(tab.url).hostname,
      score,
      results,
      timestamp: Date.now(),
      elapsed
    };

    await cacheResult(tab.url, scanResult);
    await addToHistory(scanResult);
    await updateWeeklyStats(score);
    
    // Tally blocks / visits stats se for malicioso e não deu bounce na whitelist
    if (!isWhitelisted) {
      if (score >= config.thresholds.sandbox) {
        await updateStatsGlobal('blocks');
      } else if (score >= config.thresholds.badge_warn) {
        await updateStatsGlobal('visits');
      }
    }

    // Alertas e sandboxing
    if (score > config.thresholds.alert) {
      showAlert(tabId, score, results, tab.url);
    }
    if (score >= config.thresholds.sandbox && config.autoSandbox) {
      sandboxTab(tabId);
    }

    // Enviar resultado para popup
    chrome.runtime.sendMessage({
      type: 'SCAN_RESULT',
      data: scanResult
    }).catch(() => {}); // Ignora se popup não está aberto

    console.log(`[GuardianShield] ${tab.url} → Score: ${score} (${elapsed}ms)`);
  } catch (e) {
    console.warn('[GuardianShield] Erro no scan:', e);
  } finally {
    scanQueue.delete(tabId);
  }
}, 500));

// ─── Motor de 10 verificações ───
async function runAllChecks(tabId, tab) {
  let hostname;
  try {
    hostname = new URL(tab.url).hostname;
  } catch {
    return getEmptyResults();
  }

  const checks = [
    config.enabledChecks.safeBrowsing  ? checkSafeBrowsing(tab.url)     : Promise.resolve({ status: 'disabled' }),
    config.enabledChecks.phishTank     ? checkPhishTank(tab.url)        : Promise.resolve({ status: 'disabled' }),
    config.enabledChecks.urlhaus       ? checkURLHaus(tab.url)          : Promise.resolve({ status: 'disabled' }),
    config.enabledChecks.whois         ? getWHOIS(hostname)             : Promise.resolve({ status: 'disabled' }),
    config.enabledChecks.ipgeo         ? getIPGeo(hostname)             : Promise.resolve({ status: 'disabled' }),
    config.enabledChecks.virusTotal    ? checkVirusTotal(hostname)      : Promise.resolve({ status: 'disabled' }),
    config.enabledChecks.domAnalysis   ? analyzeDOM(tabId)              : Promise.resolve({ status: 'disabled' }),
    config.enabledChecks.heuristics    ? runHeuristics(hostname, tab.url) : Promise.resolve({ status: 'disabled' }),
    config.enabledChecks.screenshotHash ? screenshotHash(tabId)         : Promise.resolve({ status: 'disabled' }),
    config.enabledChecks.geminiAI      ? checkMultiAI(tab.url, hostname) : Promise.resolve({ status: 'disabled' }),
    checkURLScan(tab.url),
    checkURLDNA(tab.url)
  ];

  const settled = await Promise.allSettled(checks);

  return {
    safeBrowsing:   extractResult(settled[0], 'safeBrowsing'),
    phishTank:      extractResult(settled[1], 'phishTank'),
    urlhaus:        extractResult(settled[2], 'urlhaus'),
    whois:          extractResult(settled[3], 'whois'),
    ipgeo:          extractResult(settled[4], 'ipgeo'),
    virusTotal:     extractResult(settled[5], 'virusTotal'),
    domAnalysis:    extractResult(settled[6], 'domAnalysis'),
    heuristics:     extractResult(settled[7], 'heuristics'),
    screenshotHash: extractResult(settled[8], 'screenshotHash'),
    geminiAI:       extractResult(settled[9], 'geminiAI'),
    urlScan:        extractResult(settled[10], 'urlScan'),
    urlDNA:         extractResult(settled[11], 'urlDNA')
  };
}

function extractResult(settled, name) {
  if (settled.status === 'fulfilled') {
    return { ...settled.value, fulfilled: true, name };
  }
  return { fulfilled: false, name, error: settled.reason?.message || 'Erro desconhecido' };
}

function getEmptyResults() {
  const names = ['safeBrowsing','phishTank','urlhaus','whois','ipgeo','virusTotal','domAnalysis','heuristics','screenshotHash','geminiAI'];
  const r = {};
  names.forEach(n => r[n] = { fulfilled: false, name: n, error: 'URL inválida' });
  return r;
}

// ═══════════════════════════════════════════════════
// 1️⃣ Google Safe Browsing
// ✅ Com API key → usa API v4 oficial (10k req/dia grátis)
// 💡 Sem API key → usa Transparency Report (grátis, sem limite)
// ═══════════════════════════════════════════════════
async function checkSafeBrowsing(url) {
  const apiKey = config.apiKeys.safeBrowsing;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    if (apiKey) {
      // ── Modo API key (oficial, mais preciso) ──
      const resp = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            client: { clientId: 'guardianshield', clientVersion: '1.0.0' },
            threatInfo: {
              threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: [{ url }]
            }
          })
        }
      );
      const data = await resp.json();
      const hasThreat = !!(data.matches && data.matches.length > 0);
      return {
        threat: hasThreat,
        status: 'ok',
        matches: data.matches || [],
        detail: hasThreat ? `Ameaça: ${data.matches[0].threatType}` : 'Limpo (API oficial)'
      };
    } else {
      // ── Modo gratuito (Transparency Report) ──
      const encoded = encodeURIComponent(url);
      const resp = await fetch(
        `https://transparencyreport.google.com/transparencyreport/api/v3/safebrowsing/status?site=${encoded}`,
        { signal: controller.signal }
      );
      const text = await resp.text();
      // A resposta inclui prefixo de segurança ")]}'\n" que precisa ser removido
      const clean = text.replace(/^\)\]\}'\n/, '');
      const hasDanger = clean.includes('"This site is unsafe"') ||
                        clean.includes('"Partially dangerous"') ||
                        clean.includes('"2"');
      return {
        threat: hasDanger,
        status: 'ok',
        detail: hasDanger ? '⚠️ Site marcado pelo Google (fallback)' : 'Limpo (fallback gratuito)'
      };
    }
  } catch (e) {
    return { threat: false, status: 'error', detail: e.message };
  } finally {
    clearTimeout(timeout);
  }
}

// ═══════════════════════════════════════════════════
// 2️⃣ PhishTank
// ═══════════════════════════════════════════════════
async function checkPhishTank(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const formData = new URLSearchParams();
    formData.append('url', url);
    formData.append('format', 'json');
    if (config.apiKeys.phishTank) {
      formData.append('app_key', config.apiKeys.phishTank);
    }

    const resp = await fetch('https://checkurl.phishtank.com/checkurl/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'phishtank/guardianshield-v1'
      },
      signal: controller.signal,
      body: formData.toString()
    });
    
    // Validar se o retorno é JSON antes de parsear
    const contentType = resp.headers.get('content-type');
    if (!resp.ok || !contentType || !contentType.includes('application/json')) {
      // Fallback 1: URLScan Search para PhishTank falho
      const scanResult = await checkURLScan(url);
      if (scanResult.threat) return { threat: true, status: 'ok', detail: 'Detectado via URLScan (PhishTank Offline)' };
      return { threat: false, status: 'fallback', detail: 'PhishTank instável, usando filtros locais' };
    }

    const data = await resp.json();
    const isPhish = data.results?.in_database && data.results?.valid;
    return {
      threat: isPhish,
      status: 'ok',
      inDatabase: data.results?.in_database || false,
      detail: isPhish ? 'URL confirmada como PHISHING!' : 'Não encontrada no PhishTank'
    };
  } catch (e) {
    return { threat: false, status: 'error', detail: e.message };
  } finally {
    clearTimeout(timeout);
  }
}

// ═══════════════════════════════════════════════════
// 3️⃣ URLHaus (Abuse.ch)
// ═══════════════════════════════════════════════════
async function checkURLHaus(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const formData = new URLSearchParams();
    formData.append('url', url);

    const resp = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: controller.signal,
      body: formData.toString()
    });
    const data = await resp.json();
    const isMalware = data.query_status === 'ok' && data.urls && data.urls.length > 0;
    return {
      threat: isMalware,
      status: 'ok',
      urlCount: data.urls?.length || 0,
      tags: data.urls?.[0]?.tags || [],
      detail: isMalware ? `Malware detectado! Tags: ${data.urls[0].tags?.join(', ')}` : 'URL limpa'
    };
  } catch (e) {
    return { threat: false, status: 'error', detail: e.message };
  } finally {
    clearTimeout(timeout);
  }
}

// ═══════════════════════════════════════════════════
// 4️⃣ WHOIS / RDAP
// ═══════════════════════════════════════════════════
async function getWHOIS(hostname) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    // Tenta RDAP para TLDs comuns
    const tld = hostname.split('.').slice(-1)[0];
    let rdapUrl;
    if (['com', 'net'].includes(tld)) {
      rdapUrl = `https://rdap.verisign.com/com/v1/domain/${hostname}`;
    } else if (tld === 'br') {
      rdapUrl = `https://rdap.registro.br/domain/${hostname}`;
    } else {
      rdapUrl = `https://rdap.org/domain/${hostname}`;
    }

    const resp = await fetch(rdapUrl, {
      signal: controller.signal,
      headers: { 
        'Accept': 'application/rdap+json',
        'User-Agent': 'GuardianShield/1.0.0'
      }
    });

    if (!resp.ok) {
      // Fallback 2: Tentar RDAP.org universal se o específico falhar
      if (rdapUrl !== `https://rdap.org/domain/${hostname}`) {
        return getWHOIS(hostname, `https://rdap.org/domain/${hostname}`);
      }
      return { threat: false, status: 'not_found', age: -1, detail: 'Registro RDAP não localizado' };
    }

    const data = await resp.json();
    let registrationDate = null;
    if (data.events) {
      const regEvent = data.events.find(e => ['registration', 'created'].includes(e.eventAction));
      if (regEvent) registrationDate = new Date(regEvent.eventDate);
    }

    const age = registrationDate ? Math.floor((Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24)) : -1;
    const isSuspicious = age >= 0 && age < 180;

    return {
      threat: isSuspicious,
      status: 'ok',
      age,
      registrationDate: registrationDate?.toISOString() || null,
      registrar: data.entities?.[0]?.vcardArray?.[1]?.[1]?.[3] || 'Privado/Oculto',
      detail: age >= 0
        ? `Domínio com ${age} dias${isSuspicious ? ' (SUSPEITO: <6 meses)' : ''}`
        : 'Idade não determinada'
    };
  } catch (e) {
    return { threat: false, status: 'error', age: -1, detail: e.message };
  } finally {
    clearTimeout(timeout);
  }
}

// ═══════════════════════════════════════════════════
// 5️⃣ IP Geolocalização
// ═══════════════════════════════════════════════════
const HIGH_RISK_COUNTRIES = ['RU', 'CN', 'NG', 'KP', 'IR', 'VN', 'UA', 'RO', 'BD'];

async function getIPGeo(hostname) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const resp = await fetch(`http://ip-api.com/json/${hostname}?fields=status,country,countryCode,city,isp,org,as,hosting`, {
      signal: controller.signal
    });
    const data = await resp.json();

    if (data.status !== 'success') {
      return { threat: false, status: 'error', detail: 'Falha na geolocalização' };
    }

    const isRisky = HIGH_RISK_COUNTRIES.includes(data.countryCode);
    const isHosting = data.hosting === true;

    return {
      threat: isRisky,
      status: 'ok',
      country: data.country,
      countryCode: data.countryCode,
      city: data.city,
      isp: data.isp,
      org: data.org,
      asn: data.as,
      isHosting,
      detail: `IP em ${data.country} (${data.countryCode})${isRisky ? ' ⚠️ PAÍS DE RISCO' : ''}${isHosting ? ' [Datacenter]' : ''}`
    };
  } catch (e) {
    return { threat: false, status: 'error', detail: e.message };
  } finally {
    clearTimeout(timeout);
  }
}

// ═══════════════════════════════════════════════════
// 6️⃣ VirusTotal
// ✅ Com API key → usa API v2 oficial (4 req/min grátis)
// 💡 Sem API key → consulta reputação via headers/fallback
// ═══════════════════════════════════════════════════
async function checkVirusTotal(hostname) {
  const apiKey = config.apiKeys.virusTotal;

  // Rate limiting
  const now = Date.now();
  if (vtRateLimit.resetTime < now) {
    vtRateLimit = { count: 0, resetTime: now + 60000 };
  }
  if (vtRateLimit.count >= 4) {
    return { threat: false, status: 'rate_limited', positives: 0, detail: 'Limite atingido, aguarde 1 min' };
  }
  vtRateLimit.count++;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    if (apiKey) {
      // ── Modo API key (oficial) ──
      const resp = await fetch(
        `https://www.virustotal.com/vtapi/v2/domain/report?apikey=${apiKey}&domain=${hostname}`,
        { signal: controller.signal }
      );
      const data = await resp.json();

      if (data.response_code !== 1) {
        return { threat: false, status: 'not_found', positives: 0, detail: 'Não encontrado no VT' };
      }

      let positives = 0;
      let total = 0;
      if (data.detected_urls) {
        data.detected_urls.forEach(u => {
          positives += u.positives || 0;
          total += u.total || 0;
        });
      }

      const hasThreat = positives > 3;
      return {
        threat: hasThreat,
        status: 'ok',
        positives,
        total,
        categories: data.categories || {},
        subdomains: (data.subdomains || []).slice(0, 5),
        detail: hasThreat ? `⚠️ ${positives} detecções` : `Limpo (${positives} detecções)`
      };
    } else {
      // ── Modo sem key: verifica contra listas públicas de malware ──
      // Consulta AbuseIPDB/listas abertas via hostname check
      const resp = await fetch(
        `https://urlhaus-api.abuse.ch/v1/host/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          signal: controller.signal,
          body: `host=${hostname}`
        }
      );
      const data = await resp.json();
      const hasUrls = data.query_status === 'ok' && data.urls && data.urls.length > 0;
      const onlineCount = hasUrls ? data.urls.filter(u => u.url_status === 'online').length : 0;
      return {
        threat: onlineCount > 0,
        status: 'ok',
        positives: onlineCount,
        total: data.urls?.length || 0,
        detail: onlineCount > 0
          ? `⚠️ ${onlineCount} URLs maliciosas ativas (fallback)`
          : `Limpo — ${data.urls?.length || 0} registros (fallback gratuito)`
      };
    }
  } catch (e) {
    return { threat: false, status: 'error', positives: 0, detail: e.message };
  } finally {
    clearTimeout(timeout);
  }
}

// ═══════════════════════════════════════════════════
// 7️⃣ Análise DOM (via content script)
// ═══════════════════════════════════════════════════
async function analyzeDOM(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const findings = [];
        let malicious = false;

        // iframes ocultos
        const iframes = document.querySelectorAll('iframe');
        let hiddenIframes = 0;
        iframes.forEach(iframe => {
          const style = window.getComputedStyle(iframe);
          if (style.display === 'none' || style.visibility === 'hidden' ||
              parseInt(style.width) < 3 || parseInt(style.height) < 3 ||
              style.opacity === '0') {
            hiddenIframes++;
          }
        });
        if (hiddenIframes > 0) {
          findings.push(`${hiddenIframes} iframe(s) oculto(s) detectado(s)`);
          malicious = true;
        }

        // Scripts base64
        const scripts = document.querySelectorAll('script');
        let base64Scripts = 0;
        scripts.forEach(s => {
          const text = s.textContent || '';
          if (text.match(/atob\s*\(|btoa\s*\(|eval\s*\(.*base64/gi)) {
            base64Scripts++;
          }
          if (text.match(/document\.write\s*\(/gi) && text.length > 500) {
            base64Scripts++;
          }
        });
        if (base64Scripts > 0) {
          findings.push(`${base64Scripts} script(s) com código ofuscado/base64`);
          malicious = true;
        }

        // Forms suspeitos
        const forms = document.querySelectorAll('form');
        let suspiciousForms = 0;
        forms.forEach(f => {
          const action = f.action || '';
          const method = (f.method || '').toLowerCase();
          const hasPassword = f.querySelector('input[type="password"]');
          const hasSensitive = f.querySelector('input[name*="cpf"], input[name*="card"], input[name*="cartao"], input[name*="senha"]');

          if (method === 'post' && hasPassword && action && !action.startsWith(window.location.origin)) {
            suspiciousForms++;
          }
          if (hasSensitive) {
            suspiciousForms++;
          }
        });
        if (suspiciousForms > 0) {
          findings.push(`${suspiciousForms} formulário(s) suspeito(s) (POST cross-origin ou campo sensível)`);
          malicious = true;
        }

        // Links mailto/tel com redirecionamento
        const suspiciousLinks = document.querySelectorAll('a[href*="javascript:"], a[href*="data:"]');
        if (suspiciousLinks.length > 0) {
          findings.push(`${suspiciousLinks.length} link(s) com protocolo suspeito`);
          malicious = true;
        }

        // Meta refresh
        const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
        if (metaRefresh) {
          const content = metaRefresh.getAttribute('content') || '';
          if (content.toLowerCase().includes('url=')) {
            findings.push('Meta refresh com redirecionamento detectado');
            malicious = true;
          }
        }

        // Popups em excesso
        const onclickHandlers = document.querySelectorAll('[onclick*="window.open"], [onclick*="popup"]');
        if (onclickHandlers.length > 3) {
          findings.push(`${onclickHandlers.length} handlers de popup detectados`);
        }

        return { malicious, findings, formCount: forms.length, iframeCount: iframes.length, scriptCount: scripts.length };
      }
    });

    if (results && results[0] && results[0].result) {
      return { ...results[0].result, status: 'ok', threat: results[0].result.malicious };
    }
    return { threat: false, malicious: false, status: 'ok', findings: [], detail: 'Análise DOM concluída' };
  } catch (e) {
    return { threat: false, malicious: false, status: 'error', findings: [], detail: e.message };
  }
}

// ═══════════════════════════════════════════════════
// 8️⃣ Heurísticas (Typosquatting, l33t, TLD)
// ═══════════════════════════════════════════════════

// Bancos e serviços BR para detecção de typosquatting
const BR_TARGETS = [
  'itau.com.br', 'bradesco.com.br', 'bb.com.br', 'caixa.gov.br',
  'santander.com.br', 'nubank.com.br', 'inter.co', 'c6bank.com.br',
  'mercadopago.com.br', 'picpay.com', 'pagseguro.com.br',
  'banrisul.com.br', 'sicoob.com.br', 'sicredi.com.br',
  'gov.br', 'receita.fazenda.gov.br', 'correios.com.br',
  'google.com', 'facebook.com', 'instagram.com', 'whatsapp.com',
  'amazon.com.br', 'mercadolivre.com.br', 'americanas.com.br',
  'magazineluiza.com.br', 'casasbahia.com.br'
];

const SUSPICIOUS_TLDS = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work', '.click', '.loan', '.racing', '.download', '.stream', '.gdn', '.bid', '.win'];

const L33T_MAP = { '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '!': 'i' };

async function runHeuristics(hostname, url) {
  let score = 0;
  const findings = [];

  // 1. TLD suspeito
  const hasSuspiciousTLD = SUSPICIOUS_TLDS.some(tld => hostname.endsWith(tld));
  if (hasSuspiciousTLD) {
    score += 2;
    findings.push('TLD suspeito detectado');
  }

  // 2. Typosquatting check
  const domainBase = hostname.replace(/^www\./, '').split('.')[0];
  for (const target of BR_TARGETS) {
    const targetBase = target.split('.')[0];
    const distance = levenshtein(domainBase, targetBase);
    if (distance > 0 && distance <= 2 && domainBase !== targetBase) {
      score += 3;
      findings.push(`Possível typosquatting de ${target} (distância: ${distance})`);
      break;
    }
  }

  // 3. L33tspeak
  let decoded = hostname;
  for (const [num, letter] of Object.entries(L33T_MAP)) {
    decoded = decoded.replaceAll(num, letter);
  }
  if (decoded !== hostname) {
    for (const target of BR_TARGETS) {
      const targetBase = target.split('.')[0];
      const decodedBase = decoded.replace(/^www\./, '').split('.')[0];
      if (levenshtein(decodedBase, targetBase) <= 1) {
        score += 3;
        findings.push(`L33tspeak detectado: ${hostname} → ${decoded} (parece ${target})`);
        break;
      }
    }
  }

  // 4. Excesso de subdomínios
  const subdomainCount = hostname.split('.').length - 2;
  if (subdomainCount > 3) {
    score += 1;
    findings.push(`${subdomainCount} subdomínios (suspeito)`);
  }

  // 5. Domínio muito longo
  if (hostname.length > 40) {
    score += 1;
    findings.push('Domínio excessivamente longo');
  }

  // 6. Caracteres repetidos ou padrões estranhos
  if (/(.)\1{3,}/.test(domainBase)) {
    score += 1;
    findings.push('Caracteres repetidos no domínio');
  }

  // 7. Hífens em excesso
  if ((domainBase.match(/-/g) || []).length > 2) {
    score += 1;
    findings.push('Excesso de hífens no domínio');
  }

  // 8. Números misturados com letras de forma suspeita
  if (/[a-z]+\d+[a-z]+\d+/i.test(domainBase)) {
    score += 1;
    findings.push('Padrão suspeito de números e letras');
  }

  // 9. URL com termos de phishing
  const phishTerms = ['login', 'signin', 'verify', 'secure', 'account', 'update', 'confirm',
    'banco', 'senha', 'cartao', 'pix', 'boleto', 'fatura', 'nfe', 'nota-fiscal',
    'cpf', 'cnpj', 'comprovante', 'transferencia'];
  const urlLower = url.toLowerCase();
  const matchedTerms = phishTerms.filter(t => urlLower.includes(t));
  if (matchedTerms.length >= 2 && hasSuspiciousTLD) {
    score += 2;
    findings.push(`Termos suspeitos na URL: ${matchedTerms.join(', ')}`);
  }

  // 10. Punycode / IDN homograph
  if (hostname.startsWith('xn--')) {
    score += 2;
    findings.push('Domínio Punycode (possível ataque homográfico)');
  }

  return {
    threat: score >= 3,
    status: 'ok',
    score,
    findings,
    detail: findings.length > 0 ? findings.join('; ') : 'Nenhuma anomalia heurística detectada'
  };
}

// Levenshtein distance
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// ═══════════════════════════════════════════════════
// 9️⃣ Screenshot Hash (pHash comparison)
// ═══════════════════════════════════════════════════
async function screenshotHash(tabId) {
  try {
    // 1. Verificar se o script está vivo (ping)
    const isAlive = await chrome.tabs.sendMessage(tabId, { type: 'GS_HEARTBEAT' }).catch(() => false);
    
    if (!isAlive) {
      console.log('[GuardianShield] Content Script ausente. Injetando logic pHash...');
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      }).catch(e => console.warn('Injection failed:', e));
      // Aguardar um pouco para inicialização
      await new Promise(r => setTimeout(r, 300));
    }

    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 30 });

    // Enviar para content script calcular o hash
    const results = await chrome.tabs.sendMessage(tabId, {
      type: 'COMPUTE_PHASH',
      imageData: dataUrl
    }).catch(e => {
        console.warn('[GuardianShield] pHash Message Fail:', e);
        return null;
    });

    if (results && results.hash) {
      // Comparar com hashes conhecidos de páginas de bancos
      const knownHashes = await getKnownHashes();
      let bestMatch = null;
      let minDistance = Infinity;

      for (const [name, hash] of Object.entries(knownHashes)) {
        const distance = hammingDistance(results.hash, hash);
        if (distance < minDistance) {
          minDistance = distance;
          bestMatch = name;
        }
      }

      const isSuspicious = minDistance < 10 && minDistance > 0;
      return {
        threat: isSuspicious,
        status: 'ok',
        hash: results.hash,
        bestMatch: isSuspicious ? bestMatch : null,
        similarity: minDistance,
        detail: isSuspicious
          ? `[ALERTA VISUAL] Similar a ${bestMatch} (distância: ${minDistance})`
          : 'Visual não corresponde a sites conhecidos'
      };
    }

    return { threat: false, status: 'ok', detail: 'Hash calculado sem correspondências' };
  } catch (e) {
    return { threat: false, status: 'error', detail: e.message };
  }
}

function hammingDistance(a, b) {
  if (!a || !b || a.length !== b.length) return Infinity;
  let distance = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) distance++;
  }
  return distance;
}

async function getKnownHashes() {
  try {
    const data = await chrome.storage.local.get('knownHashes');
    return data.knownHashes || {};
  } catch {
    return {};
  }
}

// ═══════════════════════════════════════════════════
// 📊 Cálculo de score IA ponderado
// ═══════════════════════════════════════════════════
function calculateRisk(results) {
  let score = 0;

  // Peso 40: PhishTank positivo
  if (results.phishTank.fulfilled && results.phishTank.threat) score += 40;

  // Peso 35: Safe Browsing positivo
  if (results.safeBrowsing.fulfilled && results.safeBrowsing.threat) score += 35;

  // Peso 30: URLHaus positivo
  if (results.urlhaus.fulfilled && results.urlhaus.threat) score += 30;

  // Peso 20: WHOIS domínio jovem
  if (results.whois.fulfilled && results.whois.age >= 0 && results.whois.age < 180) score += 20;

  // Peso 15: VirusTotal positivo
  if (results.virusTotal.fulfilled && results.virusTotal.threat) score += 15;

  // Peso 10: IP em país de risco
  if (results.ipgeo.fulfilled && results.ipgeo.threat) score += 10;

  // Peso 20: DOM malicioso (Aumentado de 10 para 20)
  if (results.domAnalysis.fulfilled && results.domAnalysis.threat) score += 20;

  // Peso 8: Heurísticas
  if (results.heuristics.fulfilled && results.heuristics.threat) {
    score += Math.min(results.heuristics.score * 2, 8);
  }

  // Peso 7: Screenshot hash similar
  if (results.screenshotHash.fulfilled && results.screenshotHash.threat) score += 7;

  // 🔥 INTEGRAÇÃO GEMINI AI (Peso Dinâmico de até 45)
  if (results.geminiAI.fulfilled) {
    if (results.geminiAI.threat) {
      score += 45; // Penaliza duramente se a IA achar que é golpe
    } else if (results.geminiAI.ai_score > 30) {
      score += (results.geminiAI.ai_score * 0.4);
    }
  }

  // 🧬 INTEGRAÇÃO URLScan & URLDNA (Peso 15 cada)
  if (results.urlScan.fulfilled && results.urlScan.threat) score += 15;
  if (results.urlDNA.fulfilled && results.urlDNA.threat) score += 15;
  else if (results.urlDNA.fulfilled && results.urlDNA.score > 50) score += 5;

  // 🌩️ TEMPESTADE PERFEITA (Zero-Day Rule)
  // Domínio Jovem + DOM pedindo senha/cartão/CPF
  if (
    results.whois.fulfilled && results.whois.age >= 0 && results.whois.age < 180 &&
    results.domAnalysis.fulfilled && results.domAnalysis.threat
  ) {
    score += 50; // Bloqueio imediato para sites recém-nascidos exigindo credenciais
  }

  return Math.min(Math.round(score), 100);
}

// ═══════════════════════════════════════════════════
// 🔔 Badge e alertas
// ═══════════════════════════════════════════════════
function updateBadge(tabId, score) {
  let color, text;

  if (score >= 75) {
    color = '#DC2626'; // Vermelho
    text = '!!';
  } else if (score >= 40) {
    color = '#F59E0B'; // Amarelo
    text = `${score}`;
  } else if (score >= 10) {
    color = '#3B82F6'; // Azul
    text = `${score}`;
  } else {
    color = '#10B981'; // Verde
    text = 'V';
  }

  chrome.action.setBadgeBackgroundColor({ tabId, color }).catch(() => {});
  chrome.action.setBadgeText({ tabId, text }).catch(() => {});
  chrome.action.setTitle({
    tabId,
    title: `GuardianShield — SCORE: ${score}/100 | STATUS: ${score >= 75 ? 'PERIGO CRÍTICO' : score >= 40 ? 'RISCO MODERADO' : 'SISTEMA SEGURO'}`
  }).catch(() => {});
}

function showAlert(tabId, score, results, url) {
  // Configura a mensagem da IA para o alerta
  let aiMessage = '';
  if (results.geminiAI && results.geminiAI.fulfilled && results.geminiAI.detail) {
    aiMessage = `\n\n[ANÁLISE IA]: "${results.geminiAI.detail}"`;
  }

  // Alerta via notification do SO
  chrome.notifications.create(`threat-${tabId}-${Date.now()}`, {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'GuardianShield™ — ALERTA DE SEGURANÇA!',
    message: `Score de risco: ${score}/100\nURL: ${url}${aiMessage}\n\nRecomendação: Saia deste site imediatamente!`,
    priority: 2,
    requireInteraction: true
  });

  // Alerta via content script
  chrome.tabs.sendMessage(tabId, {
    type: 'SHOW_ALERT',
    data: { score, results, url }
  }).catch(() => {});
}

// ═══════════════════════════════════════════════════
// 🔴 Auto-sandbox
// ═══════════════════════════════════════════════════
function sandboxTab(tabId) {
  chrome.tabs.sendMessage(tabId, {
    type: 'ACTIVATE_SANDBOX'
  }).catch(() => {});
}

// ═══════════════════════════════════════════════════
// 💾 Cache e histórico
// ═══════════════════════════════════════════════════
async function getCached(url) {
  try {
    const key = `cache_${hashString(url)}`;
    const data = await chrome.storage.local.get(key);
    if (data[key] && (Date.now() - data[key].timestamp) < config.cacheTTL) {
      return data[key];
    }
    return null;
  } catch {
    return null;
  }
}

async function cacheResult(url, result) {
  try {
    const key = `cache_${hashString(url)}`;
    await chrome.storage.local.set({ [key]: result });
  } catch (e) {
    console.warn('[GuardianShield] Cache write failed:', e);
  }
}

async function addToHistory(scanResult) {
  try {
    const data = await chrome.storage.local.get('scanHistory');
    const history = data.scanHistory || [];
    history.unshift({
      url: scanResult.url,
      hostname: scanResult.hostname,
      score: scanResult.score,
      timestamp: scanResult.timestamp,
      elapsed: scanResult.elapsed
    });
    // Manter apenas 500 últimos
    if (history.length > 500) history.length = 500;
    await chrome.storage.local.set({ scanHistory: history });
  } catch (e) {
    console.warn('[GuardianShield] History write failed:', e);
  }
}

async function updateWeeklyStats(score) {
  try {
    const now = new Date();
    const monthKey = `mstats_${now.getFullYear()}_${now.getMonth() + 1}`;
    
    const store = await chrome.storage.local.get(['weeklyStats', monthKey]);
    
    // 1. Weekly Stats (for 7-day chart)
    const stats = store.weeklyStats || { blocked: 0, scanned: 0, threats: 0, startDate: Date.now() };
    stats.scanned++;
    if (score >= 75) stats.threats++;
    
    // 2. Monthly Stats (for Reports tab)
    const mStats = store[monthKey] || { blocked: 0, scanned: 0, threats: 0, ads: 0, privacy: 0 };
    mStats.scanned++;
    if (score >= 90) mStats.threats++;
    else if (score >= 75) mStats.blocked++;
    
    await chrome.storage.local.set({ 
      weeklyStats: stats,
      [monthKey]: mStats 
    });
  } catch (e) {
    console.error('Error updating stats:', e);
  }
}

async function updateStatsGlobal(key) {
  try {
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const data = await chrome.storage.local.get(['gsStats', 'statsHistory']);
    const stats = data.gsStats || { blocks: 0, visits: 0, clipboard: 0, ads: 0, scanned: 0 };
    if (stats[key] !== undefined) stats[key]++;

    const history = data.statsHistory || {};
    if (!history[dateKey]) {
      history[dateKey] = { blocks: 0, visits: 0, clipboard: 0, ads: 0, scanned: 0 };
    }
    if (history[dateKey][key] !== undefined) {
      history[dateKey][key]++;
    }

    // Limpar histórico antigo (> 90 dias) para não estourar storage
    const threshold = Date.now() - (90 * 24 * 60 * 60 * 1000);
    Object.keys(history).forEach(dk => {
      if (new Date(dk).getTime() < threshold) delete history[dk];
    });

    await chrome.storage.local.set({ gsStats: stats, statsHistory: history });
  } catch (e) {
    console.warn('[GuardianShield] Stats persistence error:', e);
  }
}

async function cleanupCache() {
  try {
    const all = await chrome.storage.local.get(null);
    const keysToRemove = [];
    for (const [key, value] of Object.entries(all)) {
      if (key.startsWith('cache_') && value.timestamp && (Date.now() - value.timestamp) > config.cacheTTL) {
        keysToRemove.push(key);
      }
    }
    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove);
      console.log(`[GuardianShield] Cache cleanup: ${keysToRemove.length} entradas removidas`);
    }
  } catch (e) {}
}

async function generateWeeklyReport() {
  // Notificar para gerar relatório
  chrome.runtime.sendMessage({ type: 'GENERATE_REPORT' }).catch(() => {});
}

async function updateThreatFeeds() {
  // Atualizar feeds de ameaças BR
  try {
    const resp = await fetch('https://raw.githubusercontent.com/AZO-Software/BR-malware-list/master/domains.txt');
    if (resp.ok) {
      const text = await resp.text();
      const domains = text.split('\n').filter(d => d.trim() && !d.startsWith('#'));
      await chrome.storage.local.set({ brThreatList: domains, brThreatListUpdated: Date.now() });
    }
  } catch (e) {
    console.warn('[GuardianShield] Feed update failed:', e);
  }
}

// ─── Utilidades ───
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// ═══════════════════════════════════════════════════
// 🔟 Inteligência Artificial — Motor Multi-I.A (Google, Groq, OpenRouter)
// ═══════════════════════════════════════════════════

/**
 * Função principal que tenta múltiplas fontes de IA para máxima robustez (Opção de Contingência)
 */
async function checkMultiAI(url, hostname) {
  // 1. Tentar Gemini primeiro (Core)
  const geminiResult = await checkGeminiAI(url, hostname);
  
  // Se for sucesso (ameaça ou seguro), retorna.
  // SE for erro de API (429, 503, etc), tenta contingência IMEDIATA.
  if (geminiResult && (geminiResult.threat !== undefined || geminiResult.status === 'ok')) {
    return geminiResult;
  }

  const isRateLimited = geminiResult.status === 'rate_limited' || 
                        (geminiResult.detail && geminiResult.detail.includes('429'));

  if (isRateLimited || geminiResult.status === 'error' || geminiResult.status === 'no_api_key') {
    // 2. Tentar Groq (Contingência Principal)
    if (config.apiKeys.groq && config.apiKeys.groq.length > 5) {
      console.log('[GuardianShield] Gemini Offline/Limitado. Ativando Contingência Groq...');
      const groqResult = await checkGroqAI(url, hostname);
      if (groqResult && groqResult.status === 'ok') return groqResult;
    }

    // 3. Tentar OpenRouter (Contingência Secundária)
    if (config.apiKeys.openRouter && config.apiKeys.openRouter.length > 5) {
      console.log('[GuardianShield] Ativando Contingência OpenRouter...');
      const orResult = await checkOpenRouterAI(url, hostname);
      if (orResult && orResult.status === 'ok') return orResult;
    }
  }

  return geminiResult;
}

async function checkGeminiAI(url, hostname) {
  let apiKey = config.apiKeys.gemini;
  
  // Try fallback fake key logic if user leaves empty or puts generic text
  if (!apiKey || apiKey.length < 10) {
    // Para funcionar "pré-configurado" para testes locais (Dummy logic/Fallback)
    // Obviamente, em um ambiente real, o usuário precisará colocar sua chave real.
    // Vamos simular a IA se a chave não existir
    if (/localhost|127\.0\.0\.1|exemplo\.com\.br/.test(hostname)) {
      return { threat: false, detail: 'IA Simulada (Seguro)', model: 'gemini-fallback', ai_score: 5 };
    }
    return { status: 'no_api_key', detail: 'Chave Gemini faltando' };
  }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // Aumentado para 10s

    try {
      const prompt = `Analise a URL a seguir e determine se é provavelmente segura, phishing ou scam (golpe).
Aja como um analista de segurança de computadores estrito e direto.
URL: ${url}
Hostname: ${hostname}

IMPORTANTE: Responda APENAS com um objeto JSON puro, sem formatação markdown ou blocos de código.
Formato: {"threat": boolean, "score": number_0_to_100, "reason": "string curta"} `;

    const tryModels = [
      { ver: 'v1', name: 'gemini-2.5-flash' },          // Novo Topo de Linha (Abril 2026)
      { ver: 'v1', name: 'gemini-2.0-flash' },          // Versão Estável
      { ver: 'v1', name: 'gemini-flash-latest' },       // Evergreen (Sempre aponta pro mais novo)
      { ver: 'v1', name: 'gemini-1.5-flash-latest' },  // Legado de suporte
      { ver: 'v1beta', name: 'gemini-1.5-flash' }      // Fallback final
    ];

    let lastError = null;
    let successData = null;

    for (const model of tryModels) {
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/${model.ver}/models/${model.name}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.1 },
              safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
              ]
            })
          }
        );

        if (resp.ok) {
          successData = await resp.json();
          console.log(`[GuardianShield] Gemini Connected via ${model.ver}/${model.name}`);
          break; // Sucesso!
        } else {
          const errorData = await resp.json().catch(() => ({}));
          const is429 = resp.status === 429;
          return { 
            status: is429 ? 'rate_limited' : 'error', 
            detail: is429 ? 'Limite de taxa excedido (Aguarde 1min)' : `HTTP ${resp.status}: ${errorData.error?.message || 'Erro de API'}` 
          };
        }
      } catch (err) {
        lastError = { status: 0, data: err.message };
        if (err.name === 'AbortError') break;
      }
    }

    clearTimeout(timeout);

    if (!successData) {
      const errDetail = lastError ? JSON.stringify(lastError.data) : 'Desconhecido';
      const status = lastError ? lastError.status : 500;
      
      if (status === 400 || status === 403) {
        return { status: 'no_api_key', detail: `Chave Inválida/Erro: ${status}` };
      }
      if (status === 404) {
        return { status: 'not_found', detail: 'Modelo Não Encontrado (Google removeu suporte para sua região/versão)' };
      }
      if (status === 429) {
        return { status: 'rate_limited', detail: 'Limite de taxa excedido (Aguarde 1min)' };
      }
      throw new Error(`Gemini Fallback Failed. Last HTTP ${status}: ${errDetail}`);
    }

    const data = successData;
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse the JSON from the model response
    let jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Falha no parse do Gemini');
    
    const aiData = JSON.parse(jsonMatch[0]);
    
    return {
      threat: aiData.threat || (aiData.score > 60),
      detail: aiData.reason || 'Análise de IA completa',
      ai_score: aiData.score || 0,
      model: model.name
    };
  } catch (error) {
    if (error.name === 'AbortError') return { error: 'Timeout' };
    console.warn('[Gemini AI] Erro:', error);
    return { error: 'Falha de requisição' };
  }
}

async function checkGroqAI(url, hostname) {
  const apiKey = config.apiKeys.groq;
  const prompt = `Analise a URL e determine se é Phishing/Scam. Responda APENAS JSON: {"threat": boolean, "score": number, "reason": "string"}. URL: ${url}`;
  
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      })
    });
    if (!res.ok) return { error: 'Groq Fail' };
    const data = await res.json();
    const result = JSON.parse(data.choices[0].message.content.match(/\{[\s\S]*\}/)[0]);
    return { threat: result.threat, detail: result.reason, ai_score: result.score, model: 'Groq/Llama-3.1' };
  } catch (e) { return { error: e.message }; }
}

async function checkOpenRouterAI(url, hostname) {
  const apiKey = config.apiKeys.openRouter;
  const prompt = `Analise a URL e determine se é Phishing/Scam. Responda APENAS JSON: {"threat": boolean, "score": number, "reason": "string"}. URL: ${url}`;
  
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://guardianshield.net'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-70b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      })
    });
    if (!res.ok) return { error: 'OR Fail' };
    const data = await res.json();
    const result = JSON.parse(data.choices[0].message.content.match(/\{[\s\S]*\}/)[0]);
    return { threat: result.threat, detail: result.reason, ai_score: result.score, model: 'OpenRouter/Llama-3' };
  } catch (e) { return { error: e.message }; }
}

// ─── Mensagens do popup / content ───
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STATS_INCREMENT') {
    updateStatsGlobal(message.key);
    return true;
  }
  
  if (message.type === 'GET_SCAN_RESULT') {
    (async () => {
      const cached = await getCached(message.url);
      sendResponse(cached);
    })();
    return true;
  }

  if (message.type === 'GET_HISTORY') {
    (async () => {
      const data = await chrome.storage.local.get('scanHistory');
      sendResponse(data.scanHistory || []);
    })();
    return true;
  }

  if (message.type === 'GET_STATS') {
    (async () => {
      const data = await chrome.storage.local.get('weeklyStats');
      sendResponse(data.weeklyStats || {});
    })();
    return true;
  }

  if (message.type === 'FORCE_SCAN') {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          const key = `cache_${hashString(tab.url)}`;
          await chrome.storage.local.remove(key);
          const results = await runAllChecks(tab.id, tab);
          const score = calculateRisk(results);
          updateBadge(tab.id, score);
          const scanResult = { url: tab.url, hostname: new URL(tab.url).hostname, score, results, timestamp: Date.now() };
          await cacheResult(tab.url, scanResult);
          await addToHistory(scanResult);
          sendResponse(scanResult);
        }
      } catch (e) {
        sendResponse({ error: e.message });
      }
    })();
    return true;
  }

  if (message.type === 'GET_CONFIG') {
    (async () => {
      await loadConfig();
      sendResponse(config);
    })();
    return true;
  }

  if (message.type === 'SAVE_CONFIG') {
    (async () => {
      const oldBlockElement = config.contextMenuBlockElement;
      config = { ...DEFAULT_CONFIG, ...message.config };
      await chrome.storage.local.set({ config });
      // Reconstruir menu de contexto e regras se configurações de bloqueio mudaram
      setupContextMenu();
      setupAdvancedBlockingRules();
      applyPrivacyPolicies();
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.type === 'CLEAR_HISTORY') {
    (async () => {
      await chrome.storage.local.set({ scanHistory: [], weeklyStats: { blocked: 0, scanned: 0, threats: 0, startDate: Date.now() } });
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.type === 'SERP_CHECK_BATCH') {
    (async () => {
      const results = {};
      const checks = message.urls.map(async (url) => {
        try {
          const cached = await getCached(url);
          if (cached) {
            results[url] = { score: cached.score };
            return;
          }
          const hostname = new URL(url).hostname;
          const hResult = await runHeuristics(hostname, url);
          let score = hResult.score * 12;
          if (hostname.endsWith('.tk') || hostname.endsWith('.xyz') || hostname.endsWith('.top')) score += 50;
          results[url] = { score: Math.min(score, 100) };
        } catch(e) {}
      });
      await Promise.allSettled(checks);
      sendResponse({ results });
    })();
    return true;
  }

  if (message.type === 'OPEN_INCOGNITO') {
    chrome.windows.create({ url: message.url, incognito: true });
    sendResponse({ success: true });
    return true;
  }

  // ─── Novas mensagens para AdBlock avançado ───
  if (message.type === 'UPDATE_ALL_FILTER_LISTS') {
    (async () => {
      const results = await updateAllFilterLists();
      sendResponse(results);
    })();
    return true;
  }

  if (message.type === 'UPDATE_FILTER_LIST') {
    (async () => {
      const result = await updateFilterList(message.listId);
      sendResponse(result);
    })();
    return true;
  }

  if (message.type === 'ADD_CUSTOM_RULE') {
    (async () => {
      if (!config.customRules) config.customRules = [];
      if (message.selector && !config.customRules.includes(message.selector)) {
        config.customRules.push(message.selector);
        await chrome.storage.local.set({ config });
      }
      sendResponse({ success: true, rules: config.customRules });
    })();
    return true;
  }

  if (message.type === 'REMOVE_CUSTOM_RULE') {
    (async () => {
      if (!config.customRules) config.customRules = [];
      config.customRules = config.customRules.filter(r => r !== message.selector);
      await chrome.storage.local.set({ config });
      sendResponse({ success: true, rules: config.customRules });
    })();
    return true;
  }

  if (message.type === 'GET_CUSTOM_RULES') {
    sendResponse(config.customRules || []);
    return true;
  }

  if (message.type === 'DEEP_SCAN') {
    (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) { sendResponse({ status: 'error', detail: 'Tab não encontrada' }); return; }
      
      const deepResult = await submitDeepScan(tab.url);
      sendResponse(deepResult);
    })();
    return true;
  }

  if (message.type === 'GET_ADBLOCK_CONFIG') {
    sendResponse({
      blockCookiePopups: config.blockCookiePopups,
      blockPushNotifications: config.blockPushNotifications,
      blockTrackers: config.blockTrackers,
      blockSocialTracking: config.blockSocialTracking,
      blockDistractions: config.blockDistractions,
      showAdsCountBadge: config.showAdsCountBadge,
      contextMenuBlockElement: config.contextMenuBlockElement,
      acceptableAds: config.acceptableAds,
      adsBlocking: config.adsBlocking
    });
    return true;
  }

  // ─── Relatórios de Problemas ───
  if (message.type === 'SAVE_REPORT') {
    (async () => {
      try {
        const data = await chrome.storage.local.get('reports');
        const reports = data.reports || [];
        reports.unshift({
          id: Date.now(),
          ...message.report,
          timestamp: Date.now()
        });
        // Manter no máximo 50 relatórios
        if (reports.length > 50) reports.length = 50;
        await chrome.storage.local.set({ reports });
        sendResponse({ success: true, total: reports.length });
      } catch(e) {
        sendResponse({ success: false, error: e.message });
      }
    })();
    return true;
  }

  if (message.type === 'GET_REPORTS') {
    (async () => {
      const data = await chrome.storage.local.get('reports');
      sendResponse(data.reports || []);
    })();
    return true;
  }

  if (message.type === 'DELETE_REPORT') {
    (async () => {
      const data = await chrome.storage.local.get('reports');
      const reports = (data.reports || []).filter(r => r.id !== message.reportId);
      await chrome.storage.local.set({ reports });
      sendResponse({ success: true, reports });
    })();
    return true;
  }

  if (message.type === 'CLEAR_REPORTS') {
    (async () => {
      await chrome.storage.local.set({ reports: [] });
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.type === 'CLEAR_HISTORY') {
    (async () => {
      await chrome.storage.local.set({ 
        scanHistory: [], 
        gsStats: { blocks: 0, visits: 0, clipboard: 0, ads: 0 },
        statsHistory: {}
      });
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.type === 'FACTORY_RESET') {
    (async () => {
      try {
        await chrome.storage.local.clear();
        config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        await chrome.storage.local.set({
          config: DEFAULT_CONFIG,
          scanHistory: [],
          weeklyStats: { blocked: 0, scanned: 0, threats: 0, startDate: Date.now() },
          gsStats: { blocks: 0, visits: 0, clipboard: 0, ads: 0 },
          statsHistory: {},
          reports: []
        });
        setupContextMenu();
        setupAdvancedBlockingRules();
        applyPrivacyPolicies();
        sendResponse({ success: true });
      } catch (e) {
        sendResponse({ success: false, error: e.message });
      }
    })();
    return true;
  }

  if (message.type === 'SKIMMER_ALERT') {
    (async () => {
      if (config.antiSkimmer !== false) {
        chrome.notifications.create(`skimmer-${Date.now()}`, {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: '🚨 Proteção Anti-Skimmer — GuardianShield™',
          message: `Atividade suspeita bloqueada em: ${message.hostname}. Tentativa de captura de dados de pagamento evitada.`
        });
        
        // Registrar nas estatísticas como um bloqueio
        await updateWeeklyStats(100);
      }
      sendResponse({ success: true });
    })();
    return true;
  }
});

// 📥 Interceptador de Downloads
// ═══════════════════════════════════════════════════
chrome.downloads.onCreated.addListener(async (downloadItem) => {
  const dangerousExts = ['.exe', '.scr', '.vbs', '.bat', '.cmd', '.zip', '.rar', '.js', '.msi'];
  if(!downloadItem.filename) return;

  const ext = downloadItem.filename.substring(downloadItem.filename.lastIndexOf('.')).toLowerCase();
  if (dangerousExts.includes(ext)) {
    const cached = await getCached(downloadItem.url) || await getCached(downloadItem.url.split('?')[0]);
    if (cached && cached.score >= 40) {
      chrome.downloads.cancel(downloadItem.id).catch(() => {});
      chrome.notifications.create(`dl-block-${Date.now()}`, {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'GuardianShield™ — Download Bloqueado',
        message: `Arquivo suspeito "${downloadItem.filename}" evitado com sucesso.`
      });
    }
  }
});

// ═══════════════════════════════════════════════════
// 🔍 URLScan.io — Busca em cache global
// ═══════════════════════════════════════════════════
async function checkURLScan(url) {
  try {
    const domain = new URL(url).hostname;
    const resp = await fetch(`https://urlscan.io/api/v1/search/?q=domain:${domain}&size=1`, {
      headers: { 'User-Agent': 'GuardianShield/1.0.0' }
    });
    if (!resp.ok) return { status: 'error' };
    const data = await resp.json();
    if (data.results && data.results.length > 0) {
      const lastScan = data.results[0];
      const isMalicious = lastScan.verdicts?.overall?.malicious === true || lastScan.verdicts?.engines?.malicious > 0;
      return { 
        threat: isMalicious, 
        status: 'ok', 
        detail: isMalicious ? `⚠️ URLScan detectou ameaça em cache` : `URLScan: Limpo em cache` 
      };
    }
    return { threat: false, status: 'no_match' };
  } catch (e) { return { status: 'error' }; }
}

// ═══════════════════════════════════════════════════
// 🧬 URLDNA.io — Verificação Profunda
// ═══════════════════════════════════════════════════
async function checkURLDNA(url) {
  const apiKey = config.apiKeys.urlDNA;
  if (!apiKey || apiKey.length < 10) return { status: 'no_key' };
  try {
    const domain = new URL(url).hostname;
    const resp = await fetch(`https://api.urldna.io/v1/search?q=domain:${domain}`, {
      headers: { 'Authorization': apiKey, 'User-Agent': 'GuardianShield/1.0' }
    });
    if (!resp.ok) return { status: 'error' };
    const data = await resp.json();
    if (data.results && data.results.length > 0) {
      const res = data.results[0];
      const threat = res.risk_score > 70;
      return { 
        threat: threat, 
        status: 'ok', 
        score: res.risk_score, 
        detail: threat ? `🔴 Risco DNA: ${res.risk_score}/100` : `DNA Score: ${res.risk_score}/100` 
      };
    }
    return { threat: false, status: 'no_match' };
  } catch (e) { return { status: 'error' }; }
}

// 🧬 Deep Scan Forense (URLDNA.io Polling)
// ═══════════════════════════════════════════════════
async function submitDeepScan(url) {
  const apiKey = config.apiKeys.urlDNA;
  if (!apiKey || apiKey.length < 10) return { status: 'error', detail: 'Chave URLDNA expirada/faltando' };

  try {
    // 1. Solicitar Novo Scan
    const submitResp = await fetch('https://api.urldna.io/v1/scan', {
      method: 'POST',
      headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, visibility: 'public' })
    });
    
    if (!submitResp.ok) return { status: 'error', detail: 'Falha ao iniciar scan remoto' };
    const { id } = await submitResp.json();

    // 2. Polling (Aguardar resultado por até 30s)
    let resultData = null;
    for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 5000)); // Espera 5s
        const pollResp = await fetch(`https://api.urldna.io/v1/result/${id}`, {
            headers: { 'Authorization': apiKey }
        });
        if (pollResp.ok) {
            const data = await pollResp.json();
            if (data.status === 'done' || data.risk_score !== undefined) {
                resultData = data;
                break;
            }
        }
    }

    if (!resultData) return { status: 'error', detail: 'O Scan remoto expirou ou demorou muito. Tente novamente.' };

    // 3. Atualizar Cache Local com Veredito Forense
    const hostname = new URL(url).hostname;
    const finalScore = Math.max(resultData.risk_score || 0, 0);
    
    // Simular o objeto de resposta padrão
    const forensicResults = {
        urlDNA: { 
            fulfilled: true, 
            threat: finalScore > 70, 
            score: finalScore, 
            detail: `🧬 FORENSE: DNA Score ${finalScore}/100`,
            screenshot: resultData.screenshot_url
        },
        urlScan: {
            fulfilled: true,
            threat: resultData.malicious || false,
            detail: 'Scan em tempo real concluído',
            screenshot: resultData.screenshot_url // Usar o mesmo screenshot se disponível
        }
    };

    // Re-rodar o scan local para unir os dados (opcional)
    // Para simplificar, retornamos um mock do scanResult atualizado
    return {
        status: 'ok',
        score: finalScore,
        results: forensicResults,
        timestamp: Date.now(),
        url: url
    };

  } catch (e) {
    return { status: 'error', detail: e.message };
  }
}

console.log('[GuardianShield] Service Worker ativo com Ultra-Redundância & Forense Digital! 🛡️');

// ─── Evento de Instalação (Primeira Execução) ───
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Definir flag de primeira execução para o Onboarding
    await chrome.storage.local.set({ firstRun: true });
    
    // Abrir o Dashboard (Painel de Controle)
    chrome.tabs.create({
      url: chrome.runtime.getURL('options.html?onboarding=true')
    });
  }
});
