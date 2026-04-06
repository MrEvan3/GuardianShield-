// Script injetado nos resultados do Google Search
// Analisa os links da pesquisa e pede reputação ao Service Worker

function initSERPShield() {
  // Pego todos os elementos 'a' puro, pois o Google vive mudando as classes div.g
  const resultLinks = document.querySelectorAll('a');
  
  const urlsToCheck = [];
  const linkElements = [];

  resultLinks.forEach(a => {
    // Apenas os links que tem um título visual (H3 normalmente)
    const heading = a.querySelector('h3');
    if (!heading) return;
    
    // Ignorar sublinks e caches internos
    if (!a.href || a.href.startsWith('/') || a.href.includes('google.com')) return;
    
    // Evita duplicatas visuais
    if (a.hasAttribute('data-gs-checked')) return;
    a.setAttribute('data-gs-checked', 'true');

    try {
      const url = new URL(a.href);
      urlsToCheck.push(url.href);
      linkElements.push({ url: url.href, element: a, heading: heading });
    } catch(e) {}
  });

  if (urlsToCheck.length === 0) return;

  // Enviar batch para background
  chrome.runtime.sendMessage({
    type: 'SERP_CHECK_BATCH',
    urls: urlsToCheck
  }, (response) => {
    if (!response || !response.results) return;

    linkElements.forEach(item => {
      const verdict = response.results[item.url];
      if (verdict) {
        injectShield(item.element, item.heading, verdict.score);
      }
    });
  });
}

function injectShield(element, heading, score) {
  const badge = document.createElement('span');
  badge.className = 'gs-serp-shield';
  
  let level = 'safe';
  let title = 'GuardianShield: Seguro';

  if (score >= 75) {
    level = 'danger';
    title = 'GuardianShield: PERIGOSO! Alto risco.';
  } else if (score >= 40) {
    level = 'warn';
    title = 'GuardianShield: Cuidado. Risco moderado.';
  }

  badge.classList.add(`gs-serp-shield--${level}`);
  badge.title = title;
  
  // Pegar a logo da extensão (precisa estar no web_accessible_resources)
  const iconUrl = chrome.runtime.getURL('icons/icon32.png');
  const img = document.createElement('img');
  img.src = iconUrl;
  img.className = 'gs-serp-logo';
  img.alt = 'GS';
  badge.appendChild(img);

  // Injeta diretamente dentro do H3 para não quebrar o layout
  heading.appendChild(badge);
}

// Roda no início e observa mutações (rolagem infinita do Google)
initSERPShield();

const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    if (m.addedNodes.length > 0) {
      // Debounce básico
      if (window.gsSerpTimer) clearTimeout(window.gsSerpTimer);
      window.gsSerpTimer = setTimeout(initSERPShield, 500);
      break;
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });
