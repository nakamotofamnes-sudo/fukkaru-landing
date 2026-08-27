const fs = require('fs');
const s = fs.readFileSync('src/App.tsx','utf8');
let brace=0; const lines = s.split('\n');
for(let i=0;i<lines.length;i++){
  const line = lines[i];
  for(const c of line){ if(c==='{') brace++; if(c==='}') brace--; }
  if(brace!==0) console.log(i+1, brace, line.trim());
}
console.log('final', brace);
