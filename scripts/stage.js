import { cp, mkdir, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
for (const file of ['index.html', 'css', 'js', 'images', 'favicon.ico', 'favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png', 'og-image.jpg']) {
  await cp(file, `dist/${file}`, { recursive: true });
}
console.log('Public site prepared in dist/');
