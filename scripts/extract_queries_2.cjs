const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        results = results.concat(getFiles(fullPath));
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = getFiles(path.join(__dirname, '../src'));
const sqlRegex = /sql`([\s\S]*?)`/g;

const tables = ['youtube_accounts', 'articles', 'categories', 'push_subscriptions', 'site_settings', 'rss_sources'];

for (const t of tables) {
  console.log(`\n=================== TABLE: ${t} ===================`);
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    let match;
    while ((match = sqlRegex.exec(content)) !== null) {
      const rawSql = match[1];
      const relFile = path.relative(path.join(__dirname, '..'), f);
      if (new RegExp(`\\b${t}\\b`, 'i').test(rawSql)) {
        console.log(`[${relFile}]:\n  ${rawSql.trim().replace(/\s+/g, ' ')}\n`);
      }
    }
  }
}
