# Política de Privacidade — GuardianShield™

O **GuardianShield™** foi construído com foco total na privacidade do usuário, seguindo os princípios de *Privacy-by-Design* e conformidade com a LGPD (Lei Geral de Proteção de Dados).

## 1. Coleta de Dados
O GuardianShield™ **NÃO** coleta, armazena, vende ou transmite quaisquer dados pessoais identificáveis. Todo o processamento de segurança é realizado localmente no seu navegador.

## 2. Processamento Local e APIs
Para fornecer proteção em tempo real, a extensão utiliza consultas a serviços de segurança externos. Estas consultas são feitas de forma anônima e técnica:
- **Google Safe Browsing & Gemini AI**: Consultas de URLs para detecção de phising e ameaças.
- **PhishTank & URLhaus**: Verificação de domínios maliciosos.
- **IP-API & WHOIS**: Obtenção de dados técnicos sobre o servidor para análise de reputação.

Nenhum desses serviços recebe informações sobre a identidade do usuário ou seu histórico de navegação completo.

## 3. Armazenamento local
As configurações da extensão e o histórico de detecções (opcional) são armazenados exclusivamente na memória local do seu navegador (`chrome.storage.local`). Você pode limpar esses dados a qualquer momento nas opções da extensão.

## 4. Segurança do Usuário
A extensão utiliza as seguintes permissões para sua proteção:
- `<all_urls>`: Necessário para analisar sites em busca de fraudes e injetar proteção contra skimmers.
- `declarativeNetRequest`: Utilizado para bloquear anúncios invasivos e scripts maliciosos de rastreamento.
- `downloads`: Para analisar automaticamente arquivos baixados em busca de perigos.

## 5. Contato
Para dúvidas sobre privacidade, acesse: [https://github.com/MrEvan3/GuardianShield/issues](https://github.com/MrEvan3/GuardianShield/issues)
