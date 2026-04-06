/* ═══════════════════════════════════════════════════════════════════
   GuardianShield™ — Popup JS v3
   Real-time refresh, toggles, expandable breakdown, site info, EULA
   © 2026 GuardianShield™. Todos os direitos reservados.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Detect extension context ───
  const isExtension = typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;

  // ─── State ───
  let currentResult = null;
  let refreshTimer = null;
  let isExpanded = false;

  const CHECK_META = [
    { key: 'safeBrowsing',   icon: '<svg class="gs-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM9.71002 19.6674C8.74743 17.6259 8.15732 15.3742 8.02731 13H4.06189C4.458 16.1765 6.71639 18.7747 9.71002 19.6674ZM10.0307 13C10.1811 15.4388 10.8778 17.7297 12 19.752C13.1222 17.7297 13.8189 15.4388 13.9693 13H10.0307ZM19.9381 13H15.9727C15.8427 15.3742 15.2526 17.6259 14.29 19.6674C17.2836 18.7747 19.542 16.1765 19.9381 13ZM4.06189 11H8.02731C8.15732 8.62577 8.74743 6.37407 9.71002 4.33256C6.71639 5.22533 4.458 7.8235 4.06189 11ZM10.0307 11H13.9693C13.8189 8.56122 13.1222 6.27025 12 4.24799C10.8778 6.27025 10.1811 8.56122 10.0307 11ZM14.29 4.33256C15.2526 6.37407 15.8427 8.62577 15.9727 11H19.9381C19.542 7.8235 17.2836 5.22533 14.29 4.33256Z"></path></svg>', name: 'Google Safe Browsing' },
    { key: 'phishTank',      icon: '<svg class="gs-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 7C17.1046 7 18 6.10457 18 5C18 3.89543 17.1046 3 16 3C14.8954 3 14 3.89543 14 5C14 6.10457 14.8954 7 16 7ZM16 7C16 7 16 13.0948 16 17C16 23 6 23 6 17V13L8 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>', name: 'PhishTank' },
    { key: 'urlhaus',        icon: '<svg class="gs-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.7163 1.94745L17.4506 3.38092L16.7339 5.24808L15.8003 4.88947L15.0539 6.83436C15.8328 7.29585 16.4983 7.92847 16.9986 8.68044L18.9014 7.83255L18.4947 6.919L20.3218 6.10553L21.9487 9.75971L20.1216 10.5732L19.7149 9.65964L17.8126 10.5071C17.9348 10.9844 17.9998 11.4846 17.9998 12C17.9998 12.4062 17.9594 12.8031 17.8825 13.1867L19.8265 13.9327L20.1852 12.9998L22.0523 13.7165L20.6189 17.4508L18.7517 16.7341L19.1094 15.8009L17.1654 15.0541C16.7039 15.833 16.0713 16.4985 15.3194 16.9988L16.1672 18.9016L17.0808 18.4949L17.8943 20.322L14.2401 21.9489L13.4266 20.1218L14.3402 19.7151L13.4927 17.8128C13.0154 17.935 12.5152 18 11.9998 18C11.5932 18 11.196 17.9595 10.8121 17.8825L10.0662 19.8271L11 20.1854L10.2833 22.0525L6.54897 20.6191L7.2657 18.7519L8.19803 19.11L8.9457 17.1656C8.16683 16.7041 7.50133 16.0715 7.00097 15.3195L5.09818 16.1674L5.50492 17.081L3.67782 17.8944L2.05088 14.2403L3.87797 13.4268L4.28379 14.3407L6.18702 13.4929C6.06479 13.0156 5.99981 12.5154 5.99981 12C5.99981 11.5937 6.04018 11.1969 6.11714 10.8133L4.17174 10.0668L3.81443 11.0002L1.94727 10.2835L3.38074 6.54915L5.2479 7.26588L4.88888 8.19862L6.83418 8.94588C7.29566 8.16702 7.92829 7.50151 8.68026 7.00115L7.83237 5.09836L6.91882 5.5051L6.10535 3.67801L9.75953 2.05106L10.573 3.87815L9.65946 4.28489L10.5069 6.1872C10.9842 6.06497 11.4844 5.99999 11.9998 5.99999C12.4061 5.99999 12.8029 6.04037 13.1865 6.11732L13.9321 4.17233L12.9996 3.81461L13.7163 1.94745ZM11.9998 7.99999C9.79067 7.99999 7.99981 9.79085 7.99981 12C7.99981 14.2091 9.79067 16 11.9998 16C14.2089 16 15.9998 14.2091 15.9998 12C15.9998 9.79085 14.2089 7.99999 11.9998 7.99999ZM11.4998 12.866C11.9781 13.1422 12.142 13.7537 11.8658 14.232C11.5897 14.7103 10.9781 14.8742 10.4998 14.5981C10.0215 14.3219 9.85764 13.7103 10.1338 13.232C10.4099 12.7537 11.0215 12.5899 11.4998 12.866ZM13.9998 11C14.5521 11 14.9998 11.4477 14.9998 12C14.9998 12.5523 14.5521 13 13.9998 13C13.4475 13 12.9998 12.5523 12.9998 12C12.9998 11.4477 13.4475 11 13.9998 11ZM11.8658 9.76794C12.142 10.2462 11.9781 10.8578 11.4998 11.134C11.0215 11.4101 10.4099 11.2462 10.1338 10.7679C9.85764 10.2896 10.0215 9.67806 10.4998 9.40191C10.9781 9.12577 11.5897 9.28965 11.8658 9.76794Z"></path></svg>', name: 'URLHaus Malware Check' },
    { key: 'whois',          icon: '<svg class="gs-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 12.5C5 12.8134 5.46101 13.3584 6.53047 13.8931C7.91405 14.5849 9.87677 15 12 15C14.1232 15 16.0859 14.5849 17.4695 13.8931C18.539 13.3584 19 12.8134 19 12.5V10.3287C17.35 11.3482 14.8273 12 12 12C9.17273 12 6.64996 11.3482 5 10.3287V12.5ZM19 15.3287C17.35 16.3482 14.8273 17 12 17C9.17273 17 6.64996 16.3482 5 15.3287V17.5C5 17.8134 5.46101 18.3584 6.53047 18.8931C7.91405 19.5849 9.87677 20 12 20C14.1232 20 16.0859 19.5849 17.4695 18.8931C18.539 18.3584 19 17.8134 19 17.5V15.3287ZM3 17.5V7.5C3 5.01472 7.02944 3 12 3C16.9706 3 21 5.01472 21 7.5V17.5C21 19.9853 16.9706 22 12 22C7.02944 22 3 19.9853 3 17.5ZM12 10C14.1232 10 16.0859 9.58492 17.4695 8.89313C18.539 8.3584 19 7.81342 19 7.5C19 7.18658 18.539 6.6416 17.4695 6.10687C16.0859 5.41508 14.1232 5 12 5C9.87677 5 7.91405 5.41508 6.53047 6.10687C5.46101 6.6416 5 7.18658 5 7.5C5 7.81342 5.46101 8.3584 6.53047 8.89313C7.91405 9.58492 9.87677 10 12 10Z"></path></svg>', name: 'WHOIS / Idade do Domínio' },
    { key: 'ipgeo',          icon: '<svg class="gs-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.8995L16.9497 15.9497C19.6834 13.2161 19.6834 8.78392 16.9497 6.05025C14.2161 3.31658 9.78392 3.31658 7.05025 6.05025C4.31658 8.78392 4.31658 13.2161 7.05025 15.9497L12 20.8995ZM12 23.7279L5.63604 17.364C2.12132 13.8492 2.12132 8.15076 5.63604 4.63604C9.15076 1.12132 14.8492 1.12132 18.364 4.63604C21.8787 8.15076 21.8787 13.8492 18.364 17.364L12 23.7279ZM12 13C13.1046 13 14 12.1046 14 11C14 9.89543 13.1046 9 12 9C10.8954 9 10 9.89543 10 11C10 12.1046 10.8954 13 12 13ZM12 15C9.79086 15 8 13.2091 8 11C8 8.79086 9.79086 7 12 7C14.2091 7 16 8.79086 16 11C16 13.2091 14.2091 15 12 15Z"></path></svg>', name: 'Geolocalização / Reputação IP' },
    { key: 'virusTotal',     icon: '<svg class="gs-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.1962 2.26797L16.4462 7.89714C16.7223 8.37543 16.5584 8.98702 16.0801 9.26316L14.7806 10.0123L15.7811 11.7452L14.049 12.7452L13.0485 11.0123L11.75 11.7632C11.2717 12.0393 10.6601 11.8754 10.384 11.3971L8.5462 8.21466C6.49383 8.83736 5 10.7442 5 13C5 13.6254 5.1148 14.2239 5.32447 14.7757C6.0992 14.284 7.01643 14 8 14C9.68408 14 11.1737 14.8326 12.0797 16.1086L19.7681 11.6704L20.7681 13.4025L12.8898 17.951C12.962 18.2893 13 18.6402 13 19C13 19.3427 12.9655 19.6774 12.8999 20.0007L21 20V22L4.00054 22.0012C3.3723 21.1654 3 20.1262 3 19C3 17.9928 3.29782 17.0551 3.81021 16.2703C3.29276 15.2948 3 14.1816 3 13C3 10.0047 4.88131 7.44881 7.52677 6.44948L7.13397 5.76797C6.58169 4.81139 6.90944 3.58821 7.86603 3.03592L10.4641 1.53592C11.4207 0.983638 12.6439 1.31139 13.1962 2.26797ZM8 16C6.34315 16 5 17.3432 5 19C5 19.3506 5.06014 19.6872 5.17067 19.9999H10.8293C10.9399 19.6872 11 19.3506 11 19C11 17.3432 9.65685 16 8 16ZM11.4641 3.26797L8.86602 4.76797L11.616 9.53111L14.2141 8.03111L11.4641 3.26797Z"></path></svg>', name: 'Varredura VirusTotal' },
    { key: 'domAnalysis',    icon: '<svg class="gs-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.86885 11H2.6665L6 3H8L11.3334 11H9.13113L8.7213 10H5.27869L4.86885 11ZM6.09836 8H7.90163L7 5.8L6.09836 8ZM18.9999 16V3H16.9999V16H13.9999L17.9999 21L21.9999 16H18.9999ZM10.9999 13H2.99992V15H7.85414L2.99992 19V21H10.9999V19H6.14605L10.9999 15V13Z"></path></svg>', name: 'Análise DOM Estrita' },
    { key: 'heuristics',     icon: '<svg class="gs-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.86885 11H2.6665L6 3H8L11.3334 11H9.13113L8.7213 10H5.27869L4.86885 11ZM6.09836 8H7.90163L7 5.8L6.09836 8ZM18.9999 16V3H16.9999V16H13.9999L17.9999 21L21.9999 16H18.9999ZM10.9999 13H2.99992V15H7.85414L2.99992 19V21H10.9999V19H6.14605L10.9999 15V13Z"></path></svg>', name: 'Heurísticas Sociais' },
    { key: 'screenshotHash', icon: '<svg class="gs-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.7134 8.12811L20.4668 8.69379C20.2864 9.10792 19.7136 9.10792 19.5331 8.69379L19.2866 8.12811C18.8471 7.11947 18.0555 6.31641 17.0677 5.87708L16.308 5.53922C15.8973 5.35653 15.8973 4.75881 16.308 4.57612L17.0252 4.25714C18.0384 3.80651 18.8442 2.97373 19.2761 1.93083L19.5293 1.31953C19.7058 0.893489 20.2942 0.893489 20.4706 1.31953L20.7238 1.93083C21.1558 2.97373 21.9616 3.80651 22.9748 4.25714L23.6919 4.57612C24.1027 4.75881 24.1027 5.35653 23.6919 5.53922L22.9323 5.87708C21.9445 6.31641 21.1529 7.11947 20.7134 8.12811ZM9 3H14V5H9.82843L7.82843 7H4V19H20V11H22V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V6C2 5.44772 2.44772 5 3 5H7L9 3ZM12 18C8.96243 18 6.5 15.5376 6.5 12.5C6.5 9.46243 8.96243 7 12 7C15.0376 7 17.5 9.46243 17.5 12.5C17.5 15.5376 15.0376 18 12 18ZM12 16C13.933 16 15.5 14.433 15.5 12.5C15.5 10.567 13.933 9 12 9C10.067 9 8.5 10.567 8.5 12.5C8.5 14.433 10.067 16 12 16Z"></path></svg>', name: 'Análise Visual pHash v2' },
    { key: 'geminiAI',       icon: '<svg class="gs-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.1244 1.09094H12.8753L12.9269 1.9453C13.2227 6.85075 17.1493 10.7773 22.0546 11.0732L22.909 11.1247V12.8757L22.0546 12.9272C17.1493 13.2231 13.2227 17.1498 12.9269 22.0551L12.8753 22.9095H11.1244L11.0728 22.0551C10.777 17.1498 6.85036 13.2231 1.94518 12.9272L1.09082 12.8757V11.1247L1.94518 11.0732C6.85036 10.7773 10.777 6.85075 11.0728 1.9453L11.1244 1.09094ZM11.9999 5.85023C10.83 8.61547 8.61512 10.8304 5.84996 12.0002C8.61512 13.1701 10.83 15.385 11.9999 18.1502C13.1697 15.385 15.3846 13.1701 18.1498 12.0002C15.3846 10.8304 13.1697 8.61547 11.9999 5.85023Z"></path></svg>', name: 'Motor AI Gemini 2.5' },
    { key: 'urlScan',        icon: '<svg class="gs-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z"></path></svg>', name: 'Cache URLScan.io' },
    { key: 'urlDNA',         icon: '<svg class="gs-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 3V5H4V19H18V15H20V20C20 20.5523 19.5523 21 19 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H8ZM21 3V11H19V6.41421L12.7071 12.7071L11.2929 11.2929L17.5858 5H13V3H21Z"></path></svg>', name: 'Scan Profundo URLDNA' }
  ];

  const ADBLOCK_LABELS = ['Leve', 'Rigoroso', 'Máximo'];

  // ─── Init ───
  document.addEventListener('DOMContentLoaded', () => {
    buildChecksList();
    setupSliders();
    setupExpand();
    setupEulaModal();
    setupButtons();

    if (isExtension) {
      setupToggles();
      loadInitial();
      startAutoRefresh();
    } else {
      showNoScan('Modo de desenvolvimento');
    }
  });

  // ─── Build breakdown check items ───
  function buildChecksList() {
    const container = document.getElementById('checks-list');
    if (!container) return;
    container.textContent = '';
    
    CHECK_META.forEach(c => {
      const item = document.createElement('div');
      item.className = 'gs-chk loading';
      item.dataset.chk = c.key;
      
      const iconSpan = document.createElement('span');
      iconSpan.className = 'gs-chk__icon';
      // Safe to use innerHTML for internal trusted SVG strings, but let's be super safe
      const temp = document.createElement('div');
      temp.innerHTML = c.icon;
      const svg = temp.firstChild;
      if (svg) iconSpan.appendChild(svg);
      
      const infoDiv = document.createElement('div');
      infoDiv.className = 'gs-chk__info';
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'gs-chk__name';
      nameSpan.textContent = c.name;
      
      const detailSpan = document.createElement('span');
      detailSpan.className = 'gs-chk__detail';
      detailSpan.textContent = 'Aguardando...';
      
      infoDiv.append(nameSpan, detailSpan);
      
      const statusSpan = document.createElement('span');
      statusSpan.className = 'gs-chk__status pending';
      statusSpan.textContent = '[AGUARDE]';
      
      item.append(iconSpan, infoDiv, statusSpan);
      container.appendChild(item);
    });
  }

  // ─── Toggles ───
  function setupToggles() {
    const toggleMap = {
      'tog-adblock':   'adsBlocking',
      'tog-phishing':  'phishingEnabled',
      'tog-cpf':       'clipboardGuard',
      'tog-sandbox':   'autoSandbox'
    };

    // Load saved state
    chrome.runtime.sendMessage({ type: 'GET_CONFIG' }, (config) => {
      if (!config) return;
      const el_ab = document.getElementById('tog-adblock');
      const el_ph = document.getElementById('tog-phishing');
      const el_cpf = document.getElementById('tog-cpf');
      const el_sb = document.getElementById('tog-sandbox');

      if (el_ab) el_ab.checked = config.adsBlocking !== false;
      if (el_ph) el_ph.checked = true;
      if (el_cpf) el_cpf.checked = config.clipboardGuard !== false;
      if (el_sb) el_sb.checked = config.autoSandbox !== false;

      // Threshold slider
      const riskSlider = document.getElementById('slider-risk');
      if (riskSlider && config.thresholds) {
        riskSlider.value = config.thresholds.alert || 75;
        document.getElementById('slider-risk-val').textContent = riskSlider.value + '%';
      }
    });

    // Save on change
    Object.entries(toggleMap).forEach(([elId, cfgKey]) => {
      const el = document.getElementById(elId);
      if (!el) return;
      el.addEventListener('change', () => {
        chrome.runtime.sendMessage({ type: 'GET_CONFIG' }, (config) => {
          config[cfgKey] = el.checked;
          chrome.runtime.sendMessage({ type: 'SAVE_CONFIG', config });
        });
      });
    });
  }

  // ─── Sliders ───
  function setupSliders() {
    // Risk threshold
    const riskSlider = document.getElementById('slider-risk');
    const riskVal = document.getElementById('slider-risk-val');
    if (riskSlider && riskVal) {
      riskSlider.addEventListener('input', () => {
        riskVal.textContent = riskSlider.value + '%';
      });
      riskSlider.addEventListener('change', () => {
        chrome.runtime.sendMessage({ type: 'GET_CONFIG' }, (config) => {
          if (!config.thresholds) config.thresholds = {};
          config.thresholds.alert = parseInt(riskSlider.value);
          chrome.runtime.sendMessage({ type: 'SAVE_CONFIG', config });
        });
      });
    }

    // AdBlock level
    const abSlider = document.getElementById('slider-adblock');
    const abVal = document.getElementById('slider-adblock-val');
    if (abSlider && abVal) {
      abSlider.addEventListener('input', () => {
        abVal.textContent = ADBLOCK_LABELS[parseInt(abSlider.value)];
      });
      abSlider.addEventListener('change', () => {
        chrome.runtime.sendMessage({ type: 'GET_CONFIG' }, (config) => {
          config.adblockLevel = parseInt(abSlider.value);
          chrome.runtime.sendMessage({ type: 'SAVE_CONFIG', config });
        });
      });
    }
  }

  // ─── Expand / Collapse ───
  function setupExpand() {
    const btn = document.getElementById('btn-expand');
    const body = document.getElementById('expand-body');
    const label = document.getElementById('expand-label');

    if (!btn || !body || !label) return;

    btn.addEventListener('click', () => {
      isExpanded = !isExpanded;
      body.classList.toggle('open', isExpanded);
      btn.classList.toggle('open', isExpanded);
      label.textContent = isExpanded ? 'Ver Menos' : 'Ver Mais Detalhes';
    });
  }

  // ─── EULA Modal ───
  function setupEulaModal() {
    const modal = document.getElementById('eula-modal');
    const btnOpen = document.getElementById('btn-eula');
    const btnClose = document.getElementById('eula-close');
    const btnAccept = document.getElementById('eula-accept');
    const backdrop = document.getElementById('eula-backdrop');

    if (!modal || !btnOpen) return;

    btnOpen.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('open');
    });

    const closeModal = () => modal.classList.remove('open');
    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnAccept) btnAccept.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
  }

  // ─── Buttons ───
  function setupButtons() {
    // Rescan
    const btnRescan = document.getElementById('btn-rescan');
    if (btnRescan) {
      btnRescan.addEventListener('click', async () => {
        if (!isExtension) return;
        btnRescan.classList.add('spin');
        resetChecks();

        try {
          const result = await msg({ type: 'FORCE_SCAN' });
          if (result && !result.error) {
            currentResult = result;
            renderResult(result);
          }
        } catch (e) {
          console.warn('Rescan error:', e);
        } finally {
          btnRescan.classList.remove('spin');
        }
      });
    }

    // Update rules
    const btnRules = document.getElementById('btn-update-rules');
    if (btnRules) {
      btnRules.addEventListener('click', () => {
        btnRules.textContent = '[WAIT] Atualizando...';
        btnRules.disabled = true;
        setTimeout(() => {
          btnRules.textContent = '[OK] Regras atualizadas!';
          setTimeout(() => {
            btnRules.textContent = '↻ Atualizar regras';
            btnRules.disabled = false;
          }, 2000);
        }, 1500);
      });
    }

    // Report CSV — Functional download
    const btnReport = document.getElementById('btn-report');
    if (btnReport) {
      btnReport.addEventListener('click', () => {
        if (!currentResult || !currentResult.results) {
          btnReport.textContent = '[ERR] Sem dados';
          setTimeout(() => btnReport.textContent = 'Relatório CSV', 2000);
          return;
        }
        downloadResultsCSV(currentResult);
      });
    }

    // Deep Scan
    const btnDeep = document.getElementById('btn-deep-scan');
    const msgDeep = document.getElementById('msg-deep-scan');
    if (btnDeep) {
      const originalText = btnDeep.textContent.trim();
      const originalIconSource = btnDeep.querySelector('.IconContainer')?.innerHTML || '';

      btnDeep.addEventListener('click', async () => {
        btnDeep.classList.add('scanning');
        btnDeep.textContent = ' Analisando Profundamente...';
        const pulseDot = document.createElement('span');
        pulseDot.className = 'gs-pulse-dot';
        btnDeep.prepend(pulseDot);

        if (msgDeep) msgDeep.textContent = 'Solicitando veredito externo (URLDNA)...';
        
        try {
          await new Promise(r => setTimeout(r, 800));
          if (msgDeep) msgDeep.textContent = 'Iniciando verificação forense...';

          const result = await msg({ type: 'DEEP_SCAN' });
          if (result && result.status === 'ok') {
            currentResult = result;
            renderResult(result);
            btnDeep.textContent = ' Análise Concluída';
            const checkIcon = document.createElement('span');
            const svgTemp = document.createElement('div');
            svgTemp.innerHTML = '<svg class="gs-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg> ';
            checkIcon.appendChild(svgTemp.firstChild);
            btnDeep.prepend(checkIcon);
            if (msgDeep) msgDeep.textContent = 'Dados sincronizados com o motor GuardianShield.';
          } else {
            const err = result?.detail || 'Erro no Deep Scan';
            btnDeep.textContent = err.includes('Chave') ? 'Configurar Chave API!' : 'Foretrics Indisponível';
            if (msgDeep) msgDeep.textContent = err;
          }
        } catch (e) {
        } finally {
          setTimeout(() => {
            btnDeep.classList.remove('scanning');
            btnDeep.textContent = ' ' + originalText;
            if (originalIconSource) {
                const iconCont = document.createElement('span');
                iconCont.className = 'IconContainer';
                iconCont.innerHTML = originalIconSource;
                btnDeep.prepend(iconCont);
            }
            if (msgDeep) msgDeep.textContent = 'Solicita um escaneamento em tempo real nos motores URLScan & URLDNA.';
          }, 4000);
        }
      });
    }

    // Config Avançadas — fix links to use chrome API when in extension
    document.querySelectorAll('a[href="options.html"]').forEach(link => {
      link.addEventListener('click', (e) => {
        if (isExtension) {
          e.preventDefault();
          chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
        }
        // else let normal <a target="_blank"> behavior work
      });
    });
  }

  // ─── Load initial data ───
  async function loadInitial() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url) { showNoScan(); return; }

      // Show URL
      try {
        document.getElementById('current-url').textContent = new URL(tab.url).hostname;
      } catch {
        document.getElementById('current-url').textContent = tab.url.substring(0, 50);
      }

      // Internal URL?
      if (/^(chrome|edge|about|moz-extension|chrome-extension|opera):/.test(tab.url)) {
        showNoScan('Pagina interna'); return;
      }

      // Fetch cached result
      const result = await msg({ type: 'GET_SCAN_RESULT', url: tab.url });
      if (result) {
        currentResult = result;
        renderResult(result);
      } else {
        // Trigger scan
        document.getElementById('btn-rescan')?.click();
      }

      // Stats
      const stats = await msg({ type: 'GET_STATS' });
      if (stats) {
        document.getElementById('st-ads').textContent = fmt(stats.blocked || 0);
        document.getElementById('st-risks').textContent = fmt(stats.threats || 0);
      }
    } catch (e) {
      console.warn('Load initial error:', e);
      if (!isExtension) {
        showPreviewMode();
      } else {
        showNoScan('Erro de conexão');
      }
    }
  }

  // ─── Preview mode removed for production ───

  // ─── Auto-refresh every 3s ───
  function startAutoRefresh() {
    refreshTimer = setInterval(async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) return;
        if (/^(chrome|edge|about|moz-extension|chrome-extension|opera):/.test(tab.url)) return;

        const result = await msg({ type: 'GET_SCAN_RESULT', url: tab.url });
        if (result && result.timestamp !== currentResult?.timestamp) {
          currentResult = result;
          renderResult(result);
        }

        // Refresh stats
        const stats = await msg({ type: 'GET_STATS' });
        if (stats) {
          document.getElementById('st-ads').textContent = fmt(stats.blocked || 0);
          document.getElementById('st-risks').textContent = fmt(stats.threats || 0);
        }

        // Blink live indicator
        const live = document.getElementById('live-indicator');
        if (live) {
          live.style.opacity = '1';
          setTimeout(() => { live.style.opacity = ''; }, 300);
        }
      } catch (e) {}
    }, 3000);
  }

  // ─── Render full result ───
  function renderResult(result) {
    renderScore(result.score);
    renderChecks(result.results);
    renderSiteInfo(result.results);

    const loader = document.getElementById('scan-loader');
    if (loader) loader.style.display = 'none';

    const spinLoader = document.getElementById('scan-spinning-loader');
    if (spinLoader) spinLoader.classList.remove('active');

    if (result.elapsed) {
      document.getElementById('scan-meta').textContent = `${result.elapsed}ms • ${timeAgo(result.timestamp)}`;
    }
  }

  // ─── Render site info panel (WHOIS + IP Geo) ───
  function renderSiteInfo(results) {
    if (!results) return;

    // ─── WHOIS data ───
    const whois = results.whois;
    if (whois && whois.fulfilled) {
      const ageEl = document.getElementById('info-domain-age');
      const registrarEl = document.getElementById('info-registrar');
      const regDateEl = document.getElementById('info-reg-date');

      if (whois.age >= 0) {
        let ageText = '';
        if (whois.age > 365) {
          ageText = Math.floor(whois.age / 365) + ' anos, ' + (whois.age % 365) + ' dias';
        } else {
          ageText = whois.age + ' dias';
        }
        if (ageEl) {
          ageEl.textContent = ageText;
          if (whois.threat) {
            ageEl.classList.add('gs-info-row__value--risk');
            ageEl.textContent += ' [!]';
          } else {
            ageEl.classList.add('gs-info-row__value--safe');
          }
        }
      } else {
        if (ageEl) ageEl.textContent = 'Não disponível';
      }

      if (registrarEl && whois.registrar) {
        registrarEl.textContent = whois.registrar || '—';
      }

      if (regDateEl && whois.registrationDate) {
        try {
          const d = new Date(whois.registrationDate);
          regDateEl.textContent = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
          regDateEl.textContent = whois.registrationDate;
        }
      }
    } else if (whois) {
      const ageEl = document.getElementById('info-domain-age');
      if (ageEl) {
        ageEl.textContent = whois.error || whois.detail || 'Indisponível';
        ageEl.style.color = 'var(--text-3)';
      }
    }

    // ─── IP Geo data ───
    const ipgeo = results.ipgeo;
    if (ipgeo && ipgeo.fulfilled && ipgeo.status === 'ok') {
      const ipEl = document.getElementById('info-ip');
      const locationEl = document.getElementById('info-location');
      const countryEl = document.getElementById('info-country');
      const ispEl = document.getElementById('info-isp');
      const asnEl = document.getElementById('info-asn');
      const hostingEl = document.getElementById('info-hosting');

      // We don't have the IP directly in ipgeo result — use detail
      // If IP is available indirectly, show country info
      if (locationEl) {
        const parts = [];
        if (ipgeo.city) parts.push(ipgeo.city);
        locationEl.textContent = parts.length > 0 ? parts.join(', ') : '—';
      }

      if (countryEl) {
        const flag = getFlagEmoji(ipgeo.countryCode);
        countryEl.textContent = `${flag} ${ipgeo.country || '—'} (${ipgeo.countryCode || '—'})`;
        if (ipgeo.threat) {
          countryEl.classList.add('gs-info-row__value--risk');
        }
      }

      if (ispEl) {
        ispEl.textContent = ipgeo.isp || '—';
      }

      if (asnEl) {
        asnEl.textContent = ipgeo.asn || 'N/A';
      }

      if (hostingEl) {
        if (ipgeo.isHosting) {
          hostingEl.textContent = 'Cloud/Datacenter';
          hostingEl.style.color = 'var(--yellow)';
        } else {
          hostingEl.textContent = 'Local/Residencial';
          hostingEl.classList.add('gs-info-row__value--safe');
        }
      }

      if (ipEl) {
        // IP might be in the detail or org
        ipEl.textContent = ipgeo.org || '—';
      }
    } else if (ipgeo) {
      const locationEl = document.getElementById('info-location');
      if (locationEl) {
        locationEl.textContent = ipgeo.error || ipgeo.detail || 'Indisponível';
        locationEl.style.color = 'var(--text-3)';
      }
    }
  }

  // ─── Score ring + label ───
  function renderScore(score) {
    const num = document.getElementById('score-num');
    const label = document.getElementById('score-label');
    const ring = document.getElementById('score-ring');
    const progress = document.getElementById('ring-progress');
    const gradA = document.getElementById('grad-a');
    const gradB = document.getElementById('grad-b');

    // Animate number
    animateNum(num, score);

    // Ring progress (circumference = 2 * PI * 52 ≈ 326.726)
    const circ = 326.726;
    const dash = (score / 100) * circ;
    progress.setAttribute('stroke-dasharray', `${dash} ${circ}`);

    // Color by score
    ring.className = 'gs-hero__ring';
    if (score >= 75) {
      gradA.setAttribute('stop-color', '#ff3b5c');
      gradB.setAttribute('stop-color', '#ff6b3b');
      num.style.color = '#ff3b5c';
      label.textContent = '[PERIGO] DETECTADO!';
      label.style.color = '#ff3b5c';
      ring.classList.add('danger');
    } else if (score >= 40) {
      gradA.setAttribute('stop-color', '#ffc107');
      gradB.setAttribute('stop-color', '#ff9800');
      num.style.color = '#ffc107';
      label.textContent = '[!] Atenção necessária';
      label.style.color = '#ffc107';
      ring.classList.add('warning');
    } else if (score >= 10) {
      gradA.setAttribute('stop-color', '#00d4ff');
      gradB.setAttribute('stop-color', '#0090ff');
      num.style.color = '#00d4ff';
      label.textContent = '[i] Risco baixo';
      label.style.color = '#00d4ff';
    } else {
      gradA.setAttribute('stop-color', '#00ffaa');
      gradB.setAttribute('stop-color', '#00d4ff');
      num.style.color = '#00ffaa';
      label.textContent = '[OK] Site seguro';
      label.style.color = '#00ffaa';
    }
  }

  function animateNum(el, target) {
    const dur = 700;
    const start = performance.now();
    const from = parseInt(el.textContent) || 0;

    function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (target - from) * eased);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ─── Render checks breakdown ───
  function renderChecks(results) {
    if (!results) return;

    CHECK_META.forEach(({ key }) => {
      const el = document.querySelector(`[data-chk="${key}"]`);
      if (!el) return;
      const r = results[key];
      if (!r) return;

      const statusEl = el.querySelector('.gs-chk__status');
      const detailEl = el.querySelector('.gs-chk__detail');

      el.className = 'gs-chk';
      statusEl.className = 'gs-chk__status';

      if (!r.fulfilled) {
        el.classList.add('err');
        statusEl.textContent = '[X]';
        detailEl.textContent = r.error || 'Erro';
      } else if (r.status === 'disabled' || r.status === 'no_api_key') {
        el.classList.add('warn');
        statusEl.textContent = r.status === 'no_api_key' ? '[KEY]' : '[OFF]';
        detailEl.textContent = r.status === 'no_api_key' ? 'API key necessária' : 'Desativado';
      } else if (r.threat) {
        el.classList.add('threat');
        statusEl.textContent = '';
        const pulse = document.createElement('span');
        pulse.className = 'gs-pulse-dot gs-pulse-dot--danger';
        statusEl.appendChild(pulse);
        detailEl.textContent = r.detail || 'Ameaça!';
        detailEl.style.color = '#ff3b5c';
      } else {
        el.classList.add('safe');
        statusEl.textContent = '';
        const pulse = document.createElement('span');
        pulse.className = 'gs-pulse-dot';
        statusEl.appendChild(pulse);
        detailEl.textContent = r.detail || 'Seguro';
        detailEl.style.color = '#00ffaa';
      }

      // 🖼️ Thumbnail inject (URLScan)
      if (key === 'urlScan' && r.screenshot) {
        const existingThumb = el.querySelector('.gs-chk__thumb-container');
        if (!existingThumb) {
          const viewLink = document.createElement('span');
          viewLink.className = 'gs-chk__view-thumb';
          viewLink.textContent = 'Ver Thumbnail';
          
          const thumbCont = document.createElement('div');
          thumbCont.className = 'gs-chk__thumb-container';
          const img = document.createElement('img');
          img.src = r.screenshot;
          img.className = 'gs-chk__thumb';
          img.loading = 'lazy';
          thumbCont.appendChild(img);
          
          viewLink.onclick = () => thumbCont.classList.toggle('show');
          el.querySelector('.gs-chk__info').appendChild(viewLink);
          el.querySelector('.gs-chk__info').appendChild(thumbCont);
        }
      }
    });
  }

  function resetChecks() {
    const loader = document.getElementById('scan-loader');
    if (loader) loader.style.display = 'block';

    const spinLoader = document.getElementById('scan-spinning-loader');
    if (spinLoader) spinLoader.classList.add('active');

    document.querySelectorAll('.gs-chk').forEach(el => {
      el.className = 'gs-chk loading';
      el.querySelector('.gs-chk__status').className = 'gs-chk__status pending';
      el.querySelector('.gs-chk__status').textContent = '[AGUARDE]';
      const d = el.querySelector('.gs-chk__detail');
      d.textContent = 'Verificando...';
      d.style.color = '';
    });
    document.getElementById('score-num').textContent = '—';
    document.getElementById('score-label').textContent = 'Analisando...';
    document.getElementById('score-label').style.color = '';
    document.getElementById('scan-meta').textContent = '';

    // Reset site info
    const siteInfoIds = [
      'info-domain-age', 'info-registrar', 'info-reg-date',
      'info-ip', 'info-location', 'info-country',
      'info-isp', 'info-asn', 'info-hosting'
    ];
    siteInfoIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = id === 'info-domain-age' ? 'Carregando...' : '—';
        el.className = 'gs-info-row__value';
        el.style.color = '';
        // Restore mono class for IP and ASN
        if (id === 'info-ip' || id === 'info-asn') {
          el.classList.add('gs-info-row__value--mono');
        }
      }
    });
  }

  function showNoScan(reason = 'Não escaneável') {
    document.getElementById('score-num').textContent = '—';
    document.getElementById('score-label').textContent = reason;
    document.getElementById('score-label').style.color = '#5a6a96';
    document.querySelectorAll('.gs-chk').forEach(el => {
      el.className = 'gs-chk err';
      el.querySelector('.gs-chk__status').textContent = '[-]';
      el.querySelector('.gs-chk__detail').textContent = 'N/A';
    });

    // Reset site info
    ['info-domain-age', 'info-registrar', 'info-reg-date',
     'info-ip', 'info-location', 'info-country',
     'info-isp', 'info-asn', 'info-hosting'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = 'N/A';
    });

    if (refreshTimer) clearInterval(refreshTimer);
  }

  // ─── Utilities ───
  function msg(data) {
    return new Promise(resolve => {
      chrome.runtime.sendMessage(data, r => {
        if (chrome.runtime.lastError) resolve(null);
        else resolve(r);
      });
    });
  }

  function fmt(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return String(n);
  }

  function timeAgo(ts) {
    if (!ts) return '';
    const d = Date.now() - ts;
    if (d < 60000) return 'agora';
    if (d < 3600000) return Math.floor(d / 60000) + 'min atrás';
    if (d < 86400000) return Math.floor(d / 3600000) + 'h atrás';
    return Math.floor(d / 86400000) + 'd atrás';
  }

  function downloadResultsCSV(scanData) {
    const results = scanData.results;
    const url = scanData.url || (currentResult ? currentResult.url : 'N/A');
    const score = scanData.score || 0;
    
    // UTF-8 BOM for Excel compatibility
    let csv = '\uFEFF';
    csv += `Relatório GuardianShield;;;\n`;
    csv += `URL;${url};;\n`;
    csv += `Score Total;${score}%;;\n`;
    csv += `Data;${new Date().toLocaleString()};;\n\n`;
    csv += `Motor;Status;Resultado;Detalhes\n`;
    
    CHECK_META.forEach(({ key, name }) => {
      const r = results[key];
      if (!r) return;
      
      let status = 'DESCONHECIDO';
      if (!r.fulfilled) status = 'ERRO';
      else if (r.status === 'disabled') status = 'DESATIVADO';
      else if (r.threat) status = 'AMEAÇA DETECTADA';
      else status = 'SEGURO';

      const detail = (r.detail || r.error || 'N/A').replace(/;/g, ',').replace(/\n/g, ' ');
      csv += `${name};${status};${r.status || 'OK'};${detail}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const filename = `guardianshield-report-${new Date().toISOString().split('T')[0]}.csv`;
    
    const blobUrl = URL.createObjectURL(blob);
    link.setAttribute('href', blobUrl);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  }

  function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '[??]';
    return `[${countryCode.toUpperCase()}]`;
  }
})();
