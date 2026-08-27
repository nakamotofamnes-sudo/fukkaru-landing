const fs = require('fs');
const s = fs.readFileSync('src/App.tsx','utf8');
const counts = {paren:0,brace:0,bracket:0,bt:0,lt:0,gt:0};
for(let i=0;i<s.length;i++){const c=s[i]; if(c==='(')counts.paren++; if(c===')')counts.paren--; if(c==='{')counts.brace++; if(c==='}')counts.brace--; if(c==='[')counts.bracket++; if(c===']')counts.bracket--; if(c==='`')counts.bt++; if(c==='<' )counts.lt++; if(c==='>')counts.gt++;}
console.log(counts);
