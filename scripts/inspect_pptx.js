const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('C:\\Users\\rasika\\Desktop\\SIH26102\\SIH2026-IDEA-Presentation-Format.pptx');
console.log('PPTX file size:', buf.length);

// Scan for local file headers (0x04034b50)
let pos = 0;
const entries = [];

while (pos < buf.length - 30) {
  if (buf[pos] === 0x50 && buf[pos+1] === 0x4b && buf[pos+2] === 0x03 && buf[pos+3] === 0x04) {
    const compMethod = buf.readUInt16LE(pos + 8);
    const compSize = buf.readUInt32LE(pos + 18);
    const uncompSize = buf.readUInt32LE(pos + 22);
    const nameLen = buf.readUInt16LE(pos + 26);
    const extraLen = buf.readUInt16LE(pos + 28);
    const filename = buf.toString('utf8', pos + 30, pos + 30 + nameLen);
    const dataStart = pos + 30 + nameLen + extraLen;
    const dataEnd = dataStart + compSize;

    entries.push({ filename, compMethod, dataStart, compSize, uncompSize });
    pos = dataEnd;
  } else {
    pos++;
  }
}

console.log('Found zip entries count:', entries.length);
const slides = entries.filter(e => e.filename.startsWith('ppt/slides/slide') && e.filename.endsWith('.xml'));
console.log('Slide XMLs:', slides.map(s => s.filename));

slides.sort((a, b) => {
  const numA = parseInt(a.filename.match(/slide(\d+)\.xml/)[1]);
  const numB = parseInt(b.filename.match(/slide(\d+)\.xml/)[1]);
  return numA - numB;
});

for (const s of slides) {
  const compData = buf.slice(s.dataStart, s.dataStart + s.compSize);
  try {
    const rawXml = zlib.inflateRawSync(compData).toString('utf8');
    // Extract text nodes <a:t>...</a:t>
    const matches = rawXml.match(/<a:t>([^<]+)<\/a:t>/g) || [];
    const texts = matches.map(m => m.replace(/<\/?a:t>/g, '').trim()).filter(t => t.length > 0);
    console.log(`\n================== ${s.filename} ==================`);
    console.log(texts.join(' | '));
  } catch (err) {
    console.error(`Error decompressing ${s.filename}:`, err.message);
  }
}
