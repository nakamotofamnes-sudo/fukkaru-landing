const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (match) {
  let code = match[1];
  
  // Replace React imports
  code = code.replace(/const \{ useState, useEffect, useRef \} = React;/, 'import React, { useState, useEffect, useRef } from "react";');
  
  // Add lucide-react imports
  const icons = ['Phone', 'MessageCircle', 'Menu', 'X', 'Shovel', 'Hammer', 'Home', 'Monitor', 'AlertCircle', 'Truck', 'Warehouse', 'Quote', 'ArrowLeft', 'Send', 'CheckCircle', 'Calendar', 'MapPin', 'Mail', 'CalendarCheck', 'FileText', 'HelpCircle', 'Wrench', 'Star', 'User', 'Leaf', 'Droplets', 'ShoppingBag', 'ChevronDown', 'ChevronUp', 'Check', 'ArrowRight', 'CreditCard', 'ShieldCheck', 'Gift'];
  code = `import { ${icons.join(', ')} } from 'lucide-react';\n` + code;
  
  // Remove Icon helper and icon declarations
  code = code.replace(/\/\/ --- アイコン表示用ヘルパーコンポーネント ---[\s\S]*?\/\/ アプリ内で使用するアイコンを定義\n/, '');
  icons.forEach(icon => {
    code = code.replace(new RegExp(`\\s*const ${icon} = \\(p\\) => <Icon name="${icon}" \\{\\.\\.\\.p\\} \\/>;\\n`, 'g'), '');
  });
  
  // Remove ReactDOM.createRoot
  code = code.replace(/const root = ReactDOM\.createRoot[\s\S]*$/, 'export default App;');
  
  fs.writeFileSync('src/App.tsx', code);
  console.log('Extracted to src/App.tsx');
} else {
  console.log('Could not find script tag');
}
