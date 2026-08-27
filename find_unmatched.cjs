const fs = require('fs');
const s = fs.readFileSync('src/App.tsx','utf8');
let brace=0; const lines = s.split('\n');
for(let i=0;i<lines.length;i++){
  const line = lines[i];
  for(const c of line){ if(c==='{') brace++; if(c==='}') brace--; }
  if(brace<0) { console.log('Negative at line', i+1); process.exit(0); }
}
if(brace!==0) console.log('Final brace count', brace); else console.log('Braces balanced');
