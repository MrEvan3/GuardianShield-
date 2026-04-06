(function() {
  'use strict';

  let attachedImages = [];
  const MAX_IMAGES = 3;
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB

  // Auto-preencher URL do site
  const params = new URLSearchParams(window.location.search);
  const siteUrl = params.get('site');
  if (siteUrl) {
    document.getElementById('report-url').value = decodeURIComponent(siteUrl);
  }

  // ─── Categorias ───
  const categoryInputs = document.querySelectorAll('input[name="category"]');
  categoryInputs.forEach(input => {
    input.addEventListener('change', () => {
      document.querySelectorAll('.category-option').forEach(opt => {
        opt.classList.toggle('selected', opt.querySelector('input').checked);
      });
    });
  });

  // ─── Dropzone ───
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = ''; // Reset para permitir re-selecionar
  });

  function handleFiles(files) {
    const fileList = Array.from(files);
    for (const file of fileList) {
      if (attachedImages.length >= MAX_IMAGES) {
        alert(`Máximo de ${MAX_IMAGES} imagens permitido.`);
        break;
      }
      if (file.size > MAX_SIZE) {
        alert(`"${file.name}" excede o limite de 2MB.`);
        continue;
      }
      if (!file.type.startsWith('image/')) {
        alert(`"${file.name}" não é uma imagem válida.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        attachedImages.push({
          name: file.name,
          data: e.target.result,
          type: file.type
        });
        renderPreviews();
      };
      reader.readAsDataURL(file);
    }
  }

  function renderPreviews() {
    const container = document.getElementById('image-previews');
    container.innerHTML = '';

    attachedImages.forEach((img, index) => {
      const preview = document.createElement('div');
      preview.className = 'image-preview';
      
      const imgEl = document.createElement('img');
      imgEl.src = img.data;
      imgEl.alt = img.name;
      
      const btn = document.createElement('button');
      btn.className = 'image-preview__remove';
      btn.dataset.index = index;
      btn.type = 'button';
      btn.textContent = '✕';
      
      preview.append(imgEl, btn);
      container.appendChild(preview);
    });

    // Remove listeners
    container.querySelectorAll('.image-preview__remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        attachedImages.splice(idx, 1);
        renderPreviews();
      });
    });
  }

  // ─── Submit ───
  document.getElementById('report-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const description = document.getElementById('report-description').value.trim();
    if (!description) {
      document.getElementById('report-description').focus();
      document.getElementById('report-description').style.borderColor = '#DC2626';
      return;
    }

    const category = document.querySelector('input[name="category"]:checked')?.value || 'other';
    const url = document.getElementById('report-url').value.trim();

    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.textContent = ' Salvando...';
    // Re-add icon securely if needed, but text is enough for "Saving" state

    try {
      const report = {
        category,
        url,
        description,
        images: attachedImages.map(img => ({
          name: img.name,
          data: img.data
        })),
        userAgent: navigator.userAgent,
        extensionVersion: chrome.runtime.getManifest().version
      };

      const result = await chrome.runtime.sendMessage({ type: 'SAVE_REPORT', report });

      if (result?.success) {
        document.getElementById('success-overlay').classList.add('visible');
      } else {
        throw new Error(result?.error || 'Erro desconhecido');
      }
    } catch(err) {
      alert('Erro ao salvar relatório: ' + err.message);
      btn.disabled = false;
      btn.innerHTML = '<svg class="gs-icon" style="width:14px;height:14px;margin-right:8px;vertical-align:middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> Enviar Relatório';
    }
  });

  // ─── Cancel/Close ───
  document.getElementById('btn-cancel').addEventListener('click', () => {
    window.close();
  });

  document.getElementById('btn-close-success').addEventListener('click', () => {
    window.close();
  });

  // Reset description border on input
  document.getElementById('report-description').addEventListener('input', function() {
    this.style.borderColor = '';
  });

  // ─── System Transparency Status ───
  const statusModal = document.getElementById('modal-status');
  const showStatusBtn = document.getElementById('btn-show-status');
  const closeStatusBtn = document.getElementById('btn-close-status');

  if (showStatusBtn && statusModal) {
    showStatusBtn.addEventListener('click', async () => {
      statusModal.style.display = 'flex';
      await renderSystemStatus();
    });
  }

  if (closeStatusBtn && statusModal) {
    closeStatusBtn.addEventListener('click', () => {
      statusModal.style.display = 'none';
    });
  }

  async function renderSystemStatus() {
    const grid = document.getElementById('status-grid');
    if (!grid) return;

    // Buscar config atual
    const data = await chrome.storage.local.get('config');
    const config = data.config || {};
    const checks = config.enabledChecks || {};

    const motors = [
      { id: 'safeBrowsing', name: 'Safe Browsing' },
      { id: 'phishTank', name: 'PhishTank DB' },
      { id: 'urlhaus', name: 'URLHaus' },
      { id: 'virusTotal', name: 'VirusTotal' },
      { id: 'geminiAI', name: 'Gemini AI' },
      { id: 'heuristics', name: 'Heurística' },
      { id: 'domAnalysis', name: 'DOM Scan' },
      { id: 'whois', name: 'WHOIS' },
      { id: 'screenshotHash', name: 'pHash' },
      { id: 'ipgeo', name: 'IP Geo' }
    ];

    grid.innerHTML = '';
    motors.forEach(m => {
      const isOnline = checks[m.id] !== false;
      const item = document.createElement('div');
      item.className = 'gs-status-item';
      
      const pulse = document.createElement('div');
      pulse.className = `gs-pulse-dot ${isOnline ? 'gs-pulse-dot--online' : 'gs-pulse-dot--offline'}`;
      
      const info = document.createElement('div');
      info.className = 'gs-status-info';
      
      const label = document.createElement('span');
      label.className = 'gs-status-label';
      label.textContent = m.name;
      
      const val = document.createElement('span');
      val.className = 'gs-status-value';
      val.textContent = isOnline ? 'ON' : 'OFF';
      
      info.append(label, val);
      item.append(pulse, info);
      grid.appendChild(item);
    });

    // Filtros de Proteção
    const protections = [
      { id: 'stripTrackingParams', name: 'Stealth' },
      { id: 'blockWebRTC', name: 'IP Leak' },
      { id: 'hideReferer', name: 'Referer' },
      { id: 'doNotTrack', name: 'DNT' }
    ];

    protections.forEach(p => {
      const isOnline = config[p.id] !== false;
      const item = document.createElement('div');
      item.className = 'gs-status-item';
      item.style.borderStyle = 'dotted';
      item.innerHTML = `
        <div class="gs-pulse-dot ${isOnline ? 'gs-pulse-dot--online' : 'gs-pulse-dot--offline'}"></div>
        <div class="gs-status-info">
          <span class="gs-status-label">${p.name}</span>
          <span class="gs-status-value">${isOnline ? 'ATIVO' : 'OFF'}</span>
        </div>
      `;
      grid.appendChild(item);
    });
  }

})();
