const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function extractPptxText(filePath, label, log = console.log) {
  log(`\n${'='.repeat(60)}`);
  log(`=== ${label} ===`);
  log(`File: ${filePath}`);
  log(`${'='.repeat(60)}`);

  const data = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(data);

  // Find all slide XML files
  const slideFiles = Object.keys(zip.files)
    .filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)[1]);
      const numB = parseInt(b.match(/slide(\d+)/)[1]);
      return numA - numB;
    });

  log(`Total slides: ${slideFiles.length}\n`);

  for (const slideFile of slideFiles) {
    const slideNum = slideFile.match(/slide(\d+)/)[1];
    const xml = await zip.files[slideFile].async('string');

    // Extract all text content from XML
    const texts = [];
    const textRegex = /<a:t>([^<]*)<\/a:t>/g;
    let match;
    while ((match = textRegex.exec(xml)) !== null) {
      const t = match[1].trim();
      if (t) texts.push(t);
    }

    // Group consecutive text segments into logical lines
    log(`--- Slide ${slideNum} ---`);
    if (texts.length > 0) {
      // Join nearby text fragments and print
      let currentLine = '';
      for (const t of texts) {
        if (currentLine.length + t.length < 200) {
          currentLine += (currentLine ? ' ' : '') + t;
        } else {
          if (currentLine) log(`  ${currentLine}`);
          currentLine = t;
        }
      }
      if (currentLine) log(`  ${currentLine}`);
    } else {
      log('  (no text content - may be image-only slide)');
    }
    log('');
  }
}

  const outFile = path.join(__dirname, '..', 'parsed_ppts_output.txt');
  fs.writeFileSync(outFile, ''); // reset
  
  const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(outFile, msg + '\n', 'utf8');
  };

  async function run() {
    try {
      await extractPptxText(
        path.join(__dirname, '..', 'SIH2026-IDEA-Presentation-Format.pptx'),
        'SIH REFERENCE TEMPLATE',
        log
      );
    } catch (e) {
      log('Error parsing SIH template: ' + e.message);
    }

    try {
      await extractPptxText(
        path.join(__dirname, '..', 'ppt ext 26.pptx'),
        'OUR CURRENT PPT',
        log
      );
    } catch (e) {
      log('Error parsing our PPT: ' + e.message);
    }
  }

  run();

