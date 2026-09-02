const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'mospi');
const target = path.join(dir, 'real_works_recommended_completed.json');
const part1File = path.join(dir, 'real_works_part1.json');
const part2File = path.join(dir, 'real_works_part2.json');

if (!fs.existsSync(target) && fs.existsSync(part1File) && fs.existsSync(part2File)) {
    console.log('Recombining parts...');
    const p1 = JSON.parse(fs.readFileSync(part1File, 'utf8'));
    const p2 = JSON.parse(fs.readFileSync(part2File, 'utf8'));
    const combined = [...p1, ...p2];
    fs.writeFileSync(target, JSON.stringify(combined));
    console.log(`Recombined ${combined.length} works successfully!`);
} else {
    console.log('Target file already exists or parts not found.');
}
