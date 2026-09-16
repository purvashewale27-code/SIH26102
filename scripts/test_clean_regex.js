function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const testPhrases = [
  'Mar',
  'March',
  'MARCH-RUSH',
  'one (?) nos',
  'Benchmark',
  'Market',
  'Fair Market Pricing',
  'SENTINEL',
  'VIDHI-KAVACH',
  'PUNAR-DRISHTI',
  'ARTHA-DARPAN',
  'CHAKRA-VYUH',
  'VIBHED-NETRA',
  'SANKHYA-SATYA',
  'BHU-DRISHTI'
];

testPhrases.forEach(en => {
  const startBoundary = /^\w/.test(en) ? '\\b' : '';
  const endBoundary = /\w$/.test(en) ? '\\b' : '';
  const r = new RegExp(startBoundary + escapeRegex(en) + endBoundary, 'gi');
  console.log(`Pattern for "${en}":`, r);
});

// Test replacement on tricky strings:
const rMar = new RegExp('\\b' + escapeRegex('Mar') + '\\b', 'gi');
console.log('"Benchmark" with rMar:', 'Benchmark'.replace(rMar, 'मार्च'));
console.log('"Market" with rMar:', 'Market'.replace(rMar, 'मार्च'));
console.log('"Maremma" with rMar:', 'Maremma'.replace(rMar, 'मार्च'));
console.log('"28-Mar-2025" with rMar:', '28-Mar-2025'.replace(rMar, 'मार्च'));
console.log('"March" with rMar:', 'March'.replace(rMar, 'मार्च'));

const rOne = new RegExp('\\b' + escapeRegex('one (?) nos') + '\\b', 'gi');
console.log('one (?) nos test:', 'Installation / one (?) nos / solar pump'.replace(rOne, '१ नग'));
