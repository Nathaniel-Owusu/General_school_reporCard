const fs = require('fs');
const html = fs.readFileSync('super-admin.html', 'utf8');
const scriptMatches = html.match(/<script(?![^>]*src)([^>]*)>([\s\S]*?)<\/script>/g);
if (scriptMatches) {
    const lastScript = scriptMatches[scriptMatches.length - 1];
    const jsCode = lastScript.replace(/<\/?script[^>]*>/g, '');
    fs.writeFileSync('test.js', jsCode);
}
