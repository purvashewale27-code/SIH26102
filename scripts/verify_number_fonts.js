const fs = require('fs');
const path = require('path');

console.log('--- Verifying Executive Number Fonts & Tabular Numerals ---');

const html = fs.readFileSync(path.join(__dirname, '../frontend/index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../frontend/style.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../frontend/app.js'), 'utf8');

// 1. Check executive sans-serif font imports in HTML
const hasPlusJakarta = html.includes('Plus+Jakarta+Sans');
const hasInter = html.includes('Inter');
console.log('Plus Jakarta Sans in index.html:', hasPlusJakarta);
console.log('Inter in index.html:', hasInter);

if (!hasPlusJakarta || !hasInter) {
  console.error('FAIL: Missing professional executive font imports in index.html!');
  process.exit(1);
}

// 2. Check CSS variables and tabular rules
const hasFontNumberVar = css.includes('--font-number') && css.includes("'Plus Jakarta Sans'");
const hasTabularNums = css.includes('tabular-nums');
const hasLiningNums = css.includes('lining-nums');
const hasNoSlashedZero = !css.includes('slashed-zero');
const hasNoZeroFeature = !css.includes('"zero" 1');

console.log('--font-number variable uses Plus Jakarta Sans:', hasFontNumberVar);
console.log('tabular-nums feature present in style.css:', hasTabularNums);
console.log('lining-nums feature present in style.css:', hasLiningNums);
console.log('slashed-zero completely eliminated (no coder zeros):', hasNoSlashedZero);
console.log('"zero" 1 feature eliminated (clean executive numerals):', hasNoZeroFeature);

if (!hasFontNumberVar || !hasTabularNums || !hasLiningNums || !hasNoSlashedZero || !hasNoZeroFeature) {
  console.error('FAIL: Number typography rules mismatch or robotic slashed-zero persists!');
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

console.log('\n🌟 ALL EXECUTIVE TABULAR NUMBER FONT VERIFICATIONS PASSED 100%! 🌟');
