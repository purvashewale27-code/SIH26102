const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'mospi');
const fullFile = path.join(dir, 'real_works_recommended_completed.json');
const part1File = path.join(dir, 'real_works_part1.json');
const part2File = path.join(dir, 'real_works_part2.json');

console.log('Reading real_works_recommended_completed.json...');
const data = JSON.parse(fs.readFileSync(fullFile, 'utf8'));
console.log(`Total records: ${data.length}`);

const mid = Math.ceil(data.length / 2);
const part1 = data.slice(0, mid);
const part2 = data.slice(mid);

console.log(`Writing part1 (${part1.length} records)...`);
fs.writeFileSync(part1File, JSON.stringify(part1));

console.log(`Writing part2 (${part2.length} records)...`);
fs.writeFileSync(part2File, JSON.stringify(part2));

console.log('Split complete!');
const p1MB = (fs.statSync(part1File).size / 1024 / 1024).toFixed(2);
const p2MB = (fs.statSync(part2File).size / 1024 / 1024).toFixed(2);
console.log(`Part 1 Size: ${p1MB} MB (Safe for GitHub < 100 MB)`);
console.log(`Part 2 Size: ${p2MB} MB (Safe for GitHub < 100 MB)`);
