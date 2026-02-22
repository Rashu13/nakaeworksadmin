const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const srcDir = 'd:/Node Js Projects/nakaeworks/adminPanal/src';

walk(srcDir, (filePath) => {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Match lucide-react import
        const lucideImportRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]lucide-react['"]/g;

        let newContent = content.replace(lucideImportRegex, (match, p1) => {
            const icons = p1.split(',').map(i => i.trim()).filter(i => i);
            const uniqueIcons = [...new Set(icons)];
            return `import { ${uniqueIcons.join(', ')} } from 'lucide-react'`;
        });

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Cleaned imports in: ${filePath}`);
        }
    }
});
