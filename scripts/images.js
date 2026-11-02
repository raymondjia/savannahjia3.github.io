import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';

// Only explicit artwork folders are processed; originals remain private to the workspace.
let count = 0;
for (const folder of ['paintings', 'works-on-paper', 'sculpture']) {
  const input = path.join('uploads', folder);
  const files = await readdir(input).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  const candidates = files.filter(name => /\.(jpe?g|png|webp|tiff?)$/i.test(name));
  const slugs = new Set();
  for (const name of candidates) {
    const slug = path.parse(name).name;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error(`${input}/${name}: use a lowercase name with hyphens, e.g. still-lovely.jpg`);
    }
    if (slugs.has(slug)) throw new Error(`Duplicate image name in ${input}: ${slug}`);
    slugs.add(slug);
  }
  for (const name of candidates) {
    const slug = path.parse(name).name;
    for (const [variant, size, quality] of [['thumbs', 600, 82], ['web', 2400, 90]]) {
      const destination = path.join('images', folder, variant);
      await mkdir(destination, { recursive: true });
      await sharp(path.join(input, name), { failOn: 'error' })
        .rotate()
        .resize(size, size, { fit: 'inside', withoutEnlargement: true })
        .flatten({ background: '#ffffff' })
        .jpeg({ quality, mozjpeg: true })
        .toFile(path.join(destination, `${slug}.jpg`));
    }
    console.log(`Prepared ${folder}/${slug}`);
    count++;
  }
}
console.log(count ? `${count} artwork image(s) prepared.` : 'No uploads found. Add images under uploads/<medium>/ first.');
