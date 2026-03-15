const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        results.push(filePath);
      }
    }
  }
  return results;
}

const allFiles = walk(path.join(__dirname, 'src'));

for (const filePath of allFiles) {
  let original = fs.readFileSync(filePath, 'utf8');
  let content = original;

  // Strip interfaces: interface Name { ... }
  content = content.replace(/interface\s+\w+\s*\{[^}]+\}/g, '');
  
  // Strip types: type Name = ...;
  content = content.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');

  // Strip TS syntax in components: React.FC<{...}> 
  content = content.replace(/: React\.FC<[^>]+>/g, '');
  content = content.replace(/: React\.ReactNode/g, '');

  content = content.replace(/useState<Theme>/g, 'useState');
  content = content.replace(/\(saved as Theme\)/g, 'saved');
  // strip some other common TS typings we've seen:
  content = content.replace(/\(e: React\.FormEvent\)/g, '(e)');
  content = content.replace(/\(e: React\.ChangeEvent<[^>]+>\)/g, '(e)');
  content = content.replace(/:\s*any/g, '');
  content = content.replace(/:\s*string/g, '');
  content = content.replace(/:\s*boolean/g, '');
  content = content.replace(/:\s*number/g, '');
  content = content.replace(/ as string/g, '');
  content = content.replace(/<[^>]+>\s*\(/g, '('); // generic function calls e.g. someFunc<Type>(...)

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Stripped typescript in', filePath);
  }
}
