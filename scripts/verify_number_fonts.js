const fs = require('fs');
const path = require('path');

console.log('--- Verifying Step 6: Professional Number Fonts & Tabular Numerals ---');

const html = fs.readFileSync(path.join(__dirname, '../frontend/index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../frontend/style.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../frontend/app.js'), 'utf8');

// 1. Check font imports in HTML
const hasIBM = html.includes('IBM+Plex+Mono');
const hasJetBrains = html.includes('JetBrains+Mono');
console.log('IBM Plex Mono in index.html:', hasIBM);
console.log('JetBrains Mono in index.html:', hasJetBrains);

if (!hasIBM || !hasJetBrains) {
  console.error('FAIL: Missing professional number font imports in index.html!');
  process.exit(1);
}

// 2. Check CSS variables and tabular rules
const hasFontNumberVar = css.includes('--font-number');
const hasTabularNums = css.includes('tabular-nums');
const hasLiningNums = css.includes('lining-nums');
const hasSlashedZero = css.includes('slashed-zero');
console.log('--font-number variable present in style.css:', hasFontNumberVar);
console.log('tabular-nums feature present in style.css:', hasTabularNums);
console.log('lining-nums feature present in style.css:', hasLiningNums);
console.log('slashed-zero feature present in style.css:', hasSlashedZero);

if (!hasFontNumberVar || !hasTabularNums || !hasLiningNums || !hasSlashedZero) {
  console.error('FAIL: Missing tabular numeral rules or variables in style.css!');
  process.exit(1);
}

// 3. Check table alignment (Right-aligned numeric columns for financial accounting)
const hasThNum = css.includes('.th-num') && html.includes('class="th-num"');
const hasTdNum = css.includes('.td-num') && js.includes('class="td-num"');
console.log('.th-num in HTML and CSS:', hasThNum);
console.log('.td-num in JS and CSS:', hasTdNum);

if (!hasThNum || !hasTdNum) {
  console.error('FAIL: Financial table column alignment (.th-num / .td-num) missing!');
  process.exit(1);
}

// 4. Check Tabular badges across components
const hasTabCountBadge = css.includes('.tab-count-badge') && js.includes('tab-count-badge');
const hasScoreBadgeNum = css.includes('.score-badge-num') && js.includes('score-badge-num');
console.log('.tab-count-badge in JS and CSS:', hasTabCountBadge);
console.log('.score-badge-num in JS and CSS:', hasScoreBadgeNum);

if (!hasTabCountBadge || !hasScoreBadgeNum) {
  console.error('FAIL: Tabular badge classes missing!');
  process.exit(1);
}

console.log('\n🌟 ALL STEP 6 (PROFESSIONAL NUMBER FONTS) VERIFICATIONS PASSED 100%! 🌟');
