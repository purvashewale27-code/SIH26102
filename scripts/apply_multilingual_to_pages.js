/**
 * scripts/apply_multilingual_to_pages.js
 * Injects i18n script and header-lang-block into all frontend pages.
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const files = fs.readdirSync(FRONTEND_DIR).filter(f => f.endsWith('.html'));

const LANG_BLOCK_HTML = `        <!-- Sovereign Language Switcher Block (English & हिन्दी) -->
        <div class="header-lang-block" id="header-lang-block">
          <span class="lang-block-label">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span>भाषा / Language:</span>
          </span>
          <div class="lang-pills-group" role="radiogroup" aria-label="Select Language">
            <button type="button" class="lang-pill-btn active" data-lang="en" onclick="setAppLanguage('en')">English</button>
            <button type="button" class="lang-pill-btn" data-lang="hi" onclick="setAppLanguage('hi')">हिन्दी</button>
          </div>
        </div>`;

let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(FRONTEND_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Add script tag to head if not present
  if (!content.includes('src="i18n.js"')) {
    content = content.replace('</head>', '  <!-- Sovereign Multilingual Engine -->\n  <script src="i18n.js"></script>\n</head>');
    changed = true;
  }

  // 2. Add header-lang-block if not present
  if (!content.includes('id="header-lang-block"')) {
    // Look for </header> or end of header-action-buttons
    const target = '          <button class="header-btn header-btn-prov" id="btn-open-provenance" onclick="openProvenanceModal()" title="Inspect 176,925 MoSPI Work Lineage &amp; Cryptographic Ledger">\n            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>\n            <span>Data Lineage &amp; Ledger</span>\n          </button>\n        </div>';
    
    if (content.includes(target)) {
      content = content.replace(target, target + '\n\n' + LANG_BLOCK_HTML);
      changed = true;
    } else {
      // Fallback for pages that might have slightly different spacing
      const fallbackTarget = 'id="btn-open-provenance"';
      if (content.includes(fallbackTarget)) {
        const buttonClose = content.indexOf('</div>', content.indexOf(fallbackTarget));
        if (buttonClose !== -1) {
          const insertPos = buttonClose + 6;
          content = content.slice(0, insertPos) + '\n\n' + LANG_BLOCK_HTML + content.slice(insertPos);
          changed = true;
        }
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${file}`);
    updatedCount++;
  } else {
    console.log(`ℹ️ Already up to date: ${file}`);
  }
}

console.log(`\n🎉 Processed ${files.length} pages, updated ${updatedCount} pages.`);
