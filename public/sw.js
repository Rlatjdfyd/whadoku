// public/sw.js
const CACHE_NAME = 'whadoku-v1';

// 서비스 워커 설치 시
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

// 서비스 워커 활성화 시
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
});

// 네트워크 요청 가로채기 (현재는 기본 동작만 수행)
self.addEventListener('fetch', (event) => {
  // Pass-through
});
