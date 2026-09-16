const fs = require('fs');
const path = require('path');

const files = [
  'frontend/index.html',
  'frontend/vidhi-kavach.html',
  'frontend/punar-drishti.html',
  'frontend/artha-darpan.html',
  'frontend/chakra-vyuh.html',
  'frontend/sankhya-satya.html',
  'frontend/vibhed-netra.html',
  'frontend/bhu-drishti.html',
  'frontend/bhavishya-rekha.html',
  'frontend/satark-karyaa.html',
  'frontend/satark-simulation.html',
  'frontend/samvaad.html',
  'frontend/prashna-kavach.html'
];

let totalModifications = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log('Skipping missing file:', file);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Replace problematic inline style on modal-footer with responsive flex-wrap
  content = content.replace(
    /<div class="modal-footer" style="display:\s*flex;\s*justify-content:\s*space-between;\s*align-items:\s*center;\s*width:\s*100%;\s*">/g,
    '<div class="modal-footer">'
  );

  content = content.replace(
    /<div class="modal-footer" style="display:\s*flex;\s*justify-content:\s*space-between;\s*align-items:\s*center;\s*">/g,
    '<div class="modal-footer">'
  );

  // 2. Also ensure #gov-policy-content does not have restrictive max-height
  content = content.replace(
    /id="gov-policy-content"\s+style="([^"]*?)max-height:\s*480px;\s*overflow-y:\s*auto;\s*([^"]*?)"/g,
    'id="gov-policy-content" style="$1$2"'
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalModifications++;
    console.log('Updated modal footers in:', file);
  } else {
    console.log('No changes needed in:', file);
  }
});

console.log(`Finished. Updated ${totalModifications} files.`);
