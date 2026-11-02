/* ═══════════════════════════════════════════════════════════
   Savannah Jia — Portfolio JS
   ═══════════════════════════════════════════════════════════ */

/* ── State ───────────────────────────────────────────────── */
const state = {
  currentMedium: null,
  currentYear:   null,
  currentWorks:  [],
  lbIndex:       0,
};

/* ── DOM refs — assigned inside DOMContentLoaded ─────────── */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

let views, grid, worksLabel, lbEl, lbImg, lbTitle, lbInfo, lbFilmstrip,
    lbZoomView, zoomCanvas, zoomImg, zoomHint;

/* ── Utilities ───────────────────────────────────────────── */
function showView(name) {
  Object.entries(views).forEach(([k, el]) => {
    if (!el) return;
    el.classList.toggle('hidden', k !== name);
    el.classList.toggle('active', k === name);
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function allWorks() {
  return [
    ...(artworks.paintings          || []),
    ...(artworks['works-on-paper']  || []),
    ...(artworks.sculpture          || []),
  ];
}

/* ── Sidebar: build year lists ───────────────────────────── */
function buildNav() {
  const mediums = [
    { medium: 'paintings',       elId: 'years-paintings' },
    { medium: 'works-on-paper',  elId: 'years-works-on-paper' },
    { medium: 'sculpture',       elId: 'years-sculpture' },
  ];

  mediums.forEach(({ medium, elId }) => {
    const works   = artworks[medium] || [];
    const yearsEl = $(elId);
    if (!yearsEl) return;

    const years = [...new Set(works.map(w => w.year).filter(Boolean))].sort((a, b) => b - a);
    const hasUndated = works.some(w => !w.year);

    if (years.length === 0 && !hasUndated) {
      const parent = yearsEl.closest('.nav-item');
      if (parent) parent.style.display = 'none';
      return;
    }

    const items = years.map(yr => `<li><a data-medium="${medium}" data-year="${yr}">${yr}</a></li>`);
    if (hasUndated) items.push(`<li><a data-medium="${medium}" data-year="undated">Undated</a></li>`);
    yearsEl.innerHTML = items.join('');
  });
}

/* ── Navigation clicks ───────────────────────────────────── */
function handleNavClick(e) {
  const target = e.target.closest('[data-view], [data-medium], [data-year], .nav-medium');
  if (!target) return;

  if (target.dataset.view) {
    const v = target.dataset.view;
    showView(v === 'home' ? 'home' : v);
    closeMenu();
    return;
  }

  if (target.dataset.year) {
    showWorks(target.dataset.medium, target.dataset.year);
    closeMenu();
    return;
  }

  if (target.classList.contains('nav-medium')) {
    const parent = target.closest('.nav-item');
    const isOpen = parent.classList.contains('open');
    $$('.nav-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) parent.classList.add('open');
  }
}

/* ── Show works grid ─────────────────────────────────────── */
function showWorks(medium, yearKey) {
  const works = (artworks[medium] || []).filter(w => {
    if (yearKey === 'undated') return !w.year;
    return String(w.year) === String(yearKey);
  });

  state.currentMedium = medium;
  state.currentYear   = yearKey;
  state.currentWorks  = works;

  const mediumLabel = {
    'paintings':      'Paintings',
    'works-on-paper': 'Works on Paper',
    'sculpture':      'Sculpture',
  }[medium] || medium;

  worksLabel.textContent = `${mediumLabel}  ·  ${yearKey === 'undated' ? 'Undated' : yearKey}`;
  showView('works');
  $$('.nav-years a').forEach(a => {
    const active = a.dataset.medium === medium && a.dataset.year === String(yearKey);
    a.classList.toggle('active', active);
    if (active) a.closest('.nav-item').classList.add('open');
  });
  buildViewMore(medium, yearKey);

  grid.innerHTML = works.map((w, i) => `
    <div class="grid-item" data-index="${i}">
      <img src="${w.thumb}" alt="${w.title}" loading="lazy">
      <div class="grid-item-caption">
        <span class="grid-item-title">${w.title}</span>
        <span class="grid-item-meta">${[w.materials, w.year].filter(Boolean).join('  ·  ')}</span>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.grid-item').forEach(item => {
    item.addEventListener('click', () => openLightbox(parseInt(item.dataset.index)));
  });
}

/* Navigation after the final artwork, generated from the same content as the menu. */
function buildViewMore(currentMedium, currentYear) {
  const container = $('view-more-links');
  container.replaceChildren();
  const home = document.createElement('button');
  home.type = 'button';
  home.dataset.view = 'home';
  home.textContent = 'Home';
  container.append(home);
  for (const [medium, label] of Object.entries({
    paintings: 'Paintings', 'works-on-paper': 'Works on Paper', sculpture: 'Sculpture',
  })) {
    const works = artworks[medium] || [];
    const years = [...new Set(works.map(w => w.year).filter(Boolean))].sort((a, b) => b - a);
    if (works.some(w => !w.year)) years.push('undated');
    for (const year of years) {
      if (medium === currentMedium && String(year) === String(currentYear)) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.medium = medium;
      button.dataset.year = String(year);
      button.textContent = `${label} · ${year === 'undated' ? 'Undated' : year}`;
      container.append(button);
    }
  }
  for (const view of ['about', 'contact']) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.view = view;
    button.textContent = view === 'about' ? 'About' : 'Contact';
    container.append(button);
  }
}

/* ── Featured works on home page ─────────────────────────── */
function setupFeatured() {
  const slugs    = ['death-by-magnitude', 'leda', 'mythos'];
  const featured = slugs.map(slug => allWorks().find(w => w.slug === slug)).filter(Boolean);
  const container = $('featured-grid');
  if (!container) return;

  container.innerHTML = featured.map(w => `
    <div class="featured-item" data-slug="${w.slug}">
      <div class="featured-img-wrap">
        <img src="${w.thumb}" alt="${w.title}" loading="lazy">
      </div>
      <div class="featured-caption">
        <span class="featured-title">${w.title}</span>
        <span class="featured-meta">${[w.materials, w.year].filter(Boolean).join('  ·  ')}</span>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.featured-item').forEach(item => {
    item.addEventListener('click', () => {
      const work = featured.find(w => w.slug === item.dataset.slug);
      if (!work) return;
      const mediumWorks = artworks[work.medium] || [];
      state.currentMedium = work.medium;
      state.currentYear   = String(work.year);
      state.currentWorks  = mediumWorks;
      const idx = mediumWorks.findIndex(w => w.slug === work.slug);
      openLightbox(idx >= 0 ? idx : 0);
    });
  });
}

/* ══════════════════════════════════════════════════════════
   LIGHTBOX
   ══════════════════════════════════════════════════════════ */

// Keep a small decoded-image cache rather than downloading the whole collection.
const readyImages = new Map();
let artworkRequest = 0;
let requestedIndex = null;
function loadArtwork(src) {
  if (readyImages.has(src)) return readyImages.get(src);
  const image = new Image();
  image.src = src;
  const ready = image.decode().then(() => image).catch(error => {
    readyImages.delete(src);
    throw error;
  });
  readyImages.set(src, ready);
  if (readyImages.size > 5) readyImages.delete(readyImages.keys().next().value);
  return ready;
}
function preloadNeighbors(index) {
  for (const adjacent of [index - 1, index + 1]) {
    const work = state.currentWorks[adjacent];
    if (work) loadArtwork(work.img).catch(() => {});
  }
}
async function selectArtwork(index) {
  const work = state.currentWorks[index];
  if (!work) return;
  const request = ++artworkRequest;
  requestedIndex = index;
  lbEl.setAttribute('aria-busy', 'true');
  try {
    const image = await loadArtwork(work.img);
    if (request !== artworkRequest) return;
    const direction = index > state.lbIndex ? 1 : -1;
    // Insert the actual decoded node so the old photo stays painted until ready.
    image.id = 'lb-img';
    image.alt = work.title;
    if (image !== lbImg) {
      image.onclick = enterZoom;
      lbImg.replaceWith(image);
      lbImg = image;
    }
    state.lbIndex = index;
    lbTitle.textContent = work.title;
    lbInfo.textContent = buildInfo(work);
    updateFilmstripActive();
    exitZoom();
    animateArtwork(direction);
    preloadNeighbors(index);
  } catch {
    if (request === artworkRequest) {
      lbInfo.textContent = 'Image could not load. Please try again.';
    }
  } finally {
    if (request === artworkRequest) {
      requestedIndex = null;
      lbEl.removeAttribute('aria-busy');
    }
  }
}

function openLightbox(index) {
  ++artworkRequest;
  requestedIndex = null;
  lbEl.removeAttribute('aria-busy');
  clearTimeout(lightboxCloseTimer);
  lbEl.classList.remove('closing');
  state.lbIndex = index;
  const w = state.currentWorks[index];
  if (!w) return;

  const openingImage = new Image();
  openingImage.id = 'lb-img';
  openingImage.src = w.img;
  openingImage.alt = w.title;
  openingImage.onclick = enterZoom;
  lbImg.replaceWith(openingImage);
  lbImg = openingImage;
  lbTitle.textContent = w.title;
  lbInfo.textContent  = buildInfo(w);

  buildFilmstrip();
  updateFilmstripActive();

  lbEl.classList.remove('hidden');
  document.body.classList.add('lb-open');
  exitZoom();
  loadArtwork(w.img).catch(() => {});
  preloadNeighbors(index);
}

let lightboxCloseTimer;
function closeLightbox() {
  if (lbEl.classList.contains('hidden') || lbEl.classList.contains('closing')) return;
  ++artworkRequest;
  requestedIndex = null;
  lbEl.removeAttribute('aria-busy');
  lbEl.classList.add('closing');
  lightboxCloseTimer = setTimeout(() => {
    lbEl.classList.add('hidden');
    lbEl.classList.remove('closing');
    document.body.classList.remove('lb-open');
    exitZoom();
  }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 140);
}

function animateArtwork(direction) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const center = lbEl.querySelector('.lb-center');
  center.getAnimations().forEach(animation => animation.cancel());
  center.animate([
    { transform: `translateX(${direction * 12}px)` },
    { transform: 'translateX(0)' },
  ], { duration: 160, easing: 'ease-out' });
}

function buildInfo(w) {
  const parts = [];
  if (w.materials) parts.push(w.materials);
  if (w.dims && !w.dims.includes('?')) parts.push(w.dims);
  if (w.year) parts.push(w.year);
  return parts.join('  ·  ');
}

function navigate(dir) {
  const next = (requestedIndex ?? state.lbIndex) + dir;
  if (next < 0 || next >= state.currentWorks.length) return;
  selectArtwork(next);
}

function buildFilmstrip() {
  lbFilmstrip.innerHTML = state.currentWorks.map((w, i) => `
    <button class="lb-thumb-btn" data-index="${i}" aria-label="${w.title}">
      <img src="${w.thumb}" alt="${w.title}">
    </button>
  `).join('');

  lbFilmstrip.querySelectorAll('.lb-thumb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectArtwork(parseInt(btn.dataset.index));
    });
  });
}

function updateFilmstripActive() {
  lbFilmstrip.querySelectorAll('.lb-thumb-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === state.lbIndex);
  });
  const active = lbFilmstrip.querySelector('.lb-thumb-btn.active');
  if (active) active.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
}

/* ══════════════════════════════════════════════════════════
   PAN-AND-ZOOM VIEWER
   ══════════════════════════════════════════════════════════ */

const zoom = {
  scale:     1,
  minScale:  0.3,
  maxScale:  8,
  tx:        0,
  ty:        0,
  dragging:  false,
  lastX:     0,
  lastY:     0,
  pinchDist: null,
};

function toggleZoom() {
  lbZoomView.classList.contains('hidden') ? enterZoom() : exitZoom();
}

function enterZoom() {
  const w = state.currentWorks[state.lbIndex];
  if (!w) return;

  zoomImg.src = w.img;
  zoomImg.alt = w.title;
  zoom.scale    = 1.5;
  zoom.minScale = 0.3;
  zoom.tx = 0;
  zoom.ty = 0;
  applyZoomTransform(false);

  lbZoomView.classList.remove('hidden');
  zoomHint.classList.remove('hide');
  setTimeout(() => zoomHint.classList.add('hide'), 2800);
}

function exitZoom() {
  lbZoomView.classList.add('hidden');
  zoomImg.src = '';
}

function applyZoomTransform(animated) {
  zoomCanvas.style.transition = animated ? 'transform 0.22s ease' : 'none';
  zoomCanvas.style.transform  = `translate(${zoom.tx}px, ${zoom.ty}px) scale(${zoom.scale})`;
}

function clampPan() {
  const vw  = lbZoomView.clientWidth;
  const vh  = lbZoomView.clientHeight;
  const iw  = (zoomImg.naturalWidth  || 1200) * zoom.scale;
  const ih  = (zoomImg.naturalHeight || 900)  * zoom.scale;
  const maxX = Math.max(0, (iw - vw) / 2);
  const maxY = Math.max(0, (ih - vh) / 2);
  zoom.tx = Math.max(-maxX, Math.min(maxX, zoom.tx));
  zoom.ty = Math.max(-maxY, Math.min(maxY, zoom.ty));
}

function pinchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}


/* ── Init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  /* Assign DOM refs */
  views = {
    home:    $('view-home'),
    works:   $('view-works'),
    about:   $('view-about'),
    contact: $('view-contact'),
  };
  grid        = $('grid');
  worksLabel  = $('works-label');
  lbEl        = $('lightbox');
  lbImg       = $('lb-img');
  lbTitle     = $('lb-title');
  lbInfo      = $('lb-info');
  lbFilmstrip = $('lb-filmstrip');
  lbZoomView  = $('lb-zoom-view');
  zoomCanvas  = $('zoom-canvas');
  zoomImg     = $('zoom-img');
  zoomHint    = $('zoom-hint');

  buildNav();
  setupFeatured();

  /* Nav & lightbox controls */
  document.addEventListener('click', handleNavClick);

  $('lb-close').addEventListener('click', closeLightbox);
  $('lb-prev').addEventListener('click',  () => navigate(-1));
  $('lb-next').addEventListener('click',  () => navigate(1));
  $('zoom-exit').addEventListener('click', exitZoom);

  $('hamburger').addEventListener('click', () => document.body.classList.toggle('menu-open'));
  $('sidebar-overlay').addEventListener('click', closeMenu);

  /* Keyboard navigation */
  document.addEventListener('keydown', e => {
    if (lbEl.classList.contains('hidden')) return;
    if (e.key === 'Escape') {
      if (!lbZoomView.classList.contains('hidden')) { exitZoom(); return; }
      closeLightbox();
    }
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
    if (e.key === 'z' || e.key === 'Z') toggleZoom();
  });

  /* Click image to enter zoom */
  lbImg.addEventListener('click', enterZoom);

  /* Wheel zoom */
  lbZoomView.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const rect  = lbZoomView.getBoundingClientRect();
    const ox    = e.clientX - rect.left  - rect.width  / 2;
    const oy    = e.clientY - rect.top   - rect.height / 2;
    const prev  = zoom.scale;
    zoom.scale  = Math.min(zoom.maxScale, Math.max(zoom.minScale, zoom.scale * delta));
    const r     = zoom.scale / prev;
    zoom.tx     = ox - r * (ox - zoom.tx);
    zoom.ty     = oy - r * (oy - zoom.ty);
    clampPan();
    applyZoomTransform(false);
  }, { passive: false });

  /* Mouse drag */
  lbZoomView.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    zoom.dragging = true;
    zoom.lastX = e.clientX;
    zoom.lastY = e.clientY;
    lbZoomView.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', e => {
    if (!zoom.dragging) return;
    zoom.tx += e.clientX - zoom.lastX;
    zoom.ty += e.clientY - zoom.lastY;
    zoom.lastX = e.clientX;
    zoom.lastY = e.clientY;
    clampPan();
    applyZoomTransform(false);
  });
  window.addEventListener('mouseup', () => {
    if (!zoom.dragging) return;
    zoom.dragging = false;
    if (!lbZoomView.classList.contains('hidden')) lbZoomView.style.cursor = 'crosshair';
  });

  /* Touch */
  lbZoomView.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      zoom.pinchDist = pinchDist(e.touches);
      zoom.dragging = false;
    } else if (e.touches.length === 1) {
      zoom.dragging = true;
      zoom.lastX = e.touches[0].clientX;
      zoom.lastY = e.touches[0].clientY;
    }
  }, { passive: true });

  lbZoomView.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const d = pinchDist(e.touches);
      if (zoom.pinchDist) {
        zoom.scale = Math.min(zoom.maxScale, Math.max(zoom.minScale, zoom.scale * d / zoom.pinchDist));
      }
      zoom.pinchDist = d;
      clampPan();
      applyZoomTransform(false);
    } else if (e.touches.length === 1 && zoom.dragging) {
      zoom.tx += e.touches[0].clientX - zoom.lastX;
      zoom.ty += e.touches[0].clientY - zoom.lastY;
      zoom.lastX = e.touches[0].clientX;
      zoom.lastY = e.touches[0].clientY;
      clampPan();
      applyZoomTransform(false);
    }
  }, { passive: false });

  lbZoomView.addEventListener('touchend', e => {
    if (e.touches.length < 2) zoom.pinchDist = null;
    if (e.touches.length === 0) zoom.dragging = false;
  });

  /* Double-click to zoom in/out */
  lbZoomView.addEventListener('dblclick', e => {
    const rect   = lbZoomView.getBoundingClientRect();
    const ox     = e.clientX - rect.left - rect.width  / 2;
    const oy     = e.clientY - rect.top  - rect.height / 2;
    const target = zoom.scale < 1.5 ? Math.min(zoom.maxScale, 2.5) : zoom.minScale * 1.5;
    const ratio  = target / zoom.scale;
    zoom.scale   = target;
    zoom.tx      = ox - ratio * (ox - zoom.tx);
    zoom.ty      = oy - ratio * (oy - zoom.ty);
    clampPan();
    applyZoomTransform(true);
  });
});

function closeMenu() { document.body.classList.remove('menu-open'); }
