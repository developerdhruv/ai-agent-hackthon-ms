// copy-cmaps.js
import path from 'node:path';
import fs from 'node:fs';

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const cMapsDir = path.join(pdfjsDistPath, 'cmaps');

fs.cpSync(cMapsDir, './public/cmaps', { recursive: true });