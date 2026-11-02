import { cp, mkdir, rm, readFile, writeFile, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
for (const file of ['index.html', 'css', 'js', 'images', 'favicon.ico', 'favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png', 'og-image.jpg']) {
  await cp(file, `dist/${file}`, { recursive: true });
}
// New HTML must never reuse stale scripts or styles from a previous deployment.
let html = await readFile('dist/index.html', 'utf8');
for (const asset of ['css/style.css', 'js/data.js', 'js/main.js']) {
  const content = await readFile(`dist/${asset}`);
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 12);
  const versioned = asset.replace(/\.(css|js)$/, `.${hash}.$1`);
  await rename(`dist/${asset}`, `dist/${versioned}`);
  html = html.replaceAll(`"${asset}"`, `"${versioned}"`);
}
await writeFile('dist/index.html', html);
console.log('Public site prepared in dist/ with versioned styles and scripts.');
