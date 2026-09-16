const cp = require('child_process');

function run(cmd, timeout = 60000) {
  console.log(`\n> ${cmd}`);
  try {
    const out = cp.execSync(cmd, { stdio: 'pipe', timeout, encoding: 'utf8' });
    console.log(out.trim());
    return true;
  } catch (err) {
    if (err.stdout) console.log(err.stdout.toString().trim());
    if (err.stderr) console.error(err.stderr.toString().trim());
    console.error(`Command failed: ${err.message}`);
    return false;
  }
}

console.log('=== STAGING FILES ===');
run('git add -A');

console.log('\n=== COMMITTING FILES ===');
const commitMsg = 'feat(ui): update hero banner with subtle parliament wave background, enhance modal styling and presentation resources';
run(`git commit -m "${commitMsg}"`);

console.log('\n=== PUSHING TO ORIGIN MAIN ===');
run('git push origin main', 120000);
