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

const tableQueries = {};

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = sqlRegex.exec(content)) !== null) {
    const rawSql = match[1];
    const relFile = path.relative(path.join(__dirname, '..'), f);
    
    // Find which table is targeted
    const tables = ['youtube_accounts', 'site_settings', 'truth_articles', 'categories', 'site_ads', 'ad_campaigns', 'article_translations', 'push_subscriptions', 'rss_sources'];
    for (const t of tables) {
      if (new RegExp(`\\b${t}\\b`, 'i').test(rawSql)) {
        if (!tableQueries[t]) tableQueries[t] = [];
        tableQueries[t].push({ file: relFile, sql: rawSql.trim().replace(/\s+/g, ' ') });
      }
    }
  }
}

for (const [table, qList] of Object.entries(tableQueries)) {
  console.log(`\n=================== TABLE: ${table} (${qList.length} queries) ===================`);
  for (const q of qList) {
    console.log(`[${q.file}]:\n  ${q.sql}\n`);
  }
}
