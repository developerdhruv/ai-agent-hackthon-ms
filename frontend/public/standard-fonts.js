// copy-standard-fonts.js
import path from 'node:path';
import fs from 'node:fs';

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const standardFontsDir = path.join(pdfjsDistPath, 'standard_fonts');

fs.cpSync(standardFontsDir, './public/standard_fonts', { recursive: true });