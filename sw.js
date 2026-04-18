const CACHE_NAME = 'scout-v1';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './fundo.jpg' // Adicione aqui o nome da sua imagem de fundo
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});