/* ═══════════════════════════════════════════════════════════════════
   GuardianShield™ — pHash.js
   Perceptual Hash para comparação visual de screenshots
   ═══════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── Perceptual Hash Implementation ───
  class PerceptualHash {
    constructor() {
      this.size = 32;       // Tamanho para redimensionamento
      this.smallSize = 8;   // Tamanho final do hash
    }

    /**
     * Calcula pHash de uma imagem (dataURL ou Image element)
     * @param {string|HTMLImageElement} input - DataURL ou elemento de imagem
     * @returns {Promise<string>} Hash hexadecimal
     */
    async compute(input) {
      return new Promise((resolve, reject) => {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';

          img.onload = () => {
            try {
              const hash = this._processImage(img);
              resolve(hash);
            } catch (e) {
              reject(e);
            }
          };

          img.onerror = () => reject(new Error('Falha ao carregar imagem'));

          if (typeof input === 'string') {
            img.src = input;
          } else if (input instanceof HTMLImageElement) {
            if (input.complete) {
              const hash = this._processImage(input);
              resolve(hash);
              return;
            }
            img.src = input.src;
          }
        } catch (e) {
          reject(e);
        }
      });
    }

    _processImage(img) {
      // 1. Redimensionar para 32x32
      const canvas = document.createElement('canvas');
      canvas.width = this.size;
      canvas.height = this.size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, this.size, this.size);

      // 2. Converter para escala de cinza
      const imageData = ctx.getImageData(0, 0, this.size, this.size);
      const gray = this._toGrayscale(imageData);

      // 3. Aplicar DCT (Discrete Cosine Transform)
      const dct = this._applyDCT(gray);

      // 4. Extrair frequências baixas (8x8 superior esquerdo)
      const lowFreq = [];
      for (let y = 0; y < this.smallSize; y++) {
        for (let x = 0; x < this.smallSize; x++) {
          lowFreq.push(dct[y][x]);
        }
      }

      // 5. Calcular mediana (excluindo DC)
      const withoutDC = lowFreq.slice(1);
      const sorted = [...withoutDC].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];

      // 6. Gerar hash binário
      let hash = '';
      for (let i = 0; i < lowFreq.length; i++) {
        hash += lowFreq[i] > median ? '1' : '0';
      }

      // 7. Converter para hexadecimal
      return this._binaryToHex(hash);
    }

    _toGrayscale(imageData) {
      const { data, width, height } = imageData;
      const gray = [];
      for (let y = 0; y < height; y++) {
        gray[y] = [];
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          // Luminance formula
          gray[y][x] = data[idx] * 0.299 + data[idx+1] * 0.587 + data[idx+2] * 0.114;
        }
      }
      return gray;
    }

    _applyDCT(matrix) {
      const N = this.size;
      const result = [];

      for (let u = 0; u < N; u++) {
        result[u] = [];
        for (let v = 0; v < N; v++) {
          let sum = 0;
          for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
              sum += matrix[i][j] *
                Math.cos(((2 * i + 1) * u * Math.PI) / (2 * N)) *
                Math.cos(((2 * j + 1) * v * Math.PI) / (2 * N));
            }
          }
          const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
          const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
          result[u][v] = (2 / N) * cu * cv * sum;
        }
      }

      return result;
    }

    _binaryToHex(binary) {
      let hex = '';
      for (let i = 0; i < binary.length; i += 4) {
        const nibble = binary.substr(i, 4);
        hex += parseInt(nibble, 2).toString(16);
      }
      return hex;
    }

    /**
     * Calcula distância de Hamming entre dois hashes
     * @param {string} hash1
     * @param {string} hash2
     * @returns {number} Distância (0 = idêntico, 64 = totalmente diferente)
     */
    distance(hash1, hash2) {
      if (!hash1 || !hash2) return 64;
      const bin1 = this._hexToBinary(hash1);
      const bin2 = this._hexToBinary(hash2);
      let dist = 0;
      const len = Math.max(bin1.length, bin2.length);
      for (let i = 0; i < len; i++) {
        if ((bin1[i] || '0') !== (bin2[i] || '0')) dist++;
      }
      return dist;
    }

    _hexToBinary(hex) {
      let binary = '';
      for (let i = 0; i < hex.length; i++) {
        binary += parseInt(hex[i], 16).toString(2).padStart(4, '0');
      }
      return binary;
    }
  }

  // ─── Expor globalmente ───
  window.GuardianPHash = new PerceptualHash();

  // ─── Listener para mensagens do service worker ───
  // (pHash computation será chamado via content.js)
})();
