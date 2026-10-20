// Felles for alle Rolig-sider: registrer service worker (kun over http/https; file:// fungerer som før).
(function () {
  'use strict';
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  var here = document.currentScript && document.currentScript.src;
  if (!here) return;
  var sw = new URL('sw.js', here), scope = new URL('./', here);
  window.addEventListener('load', function () {
    navigator.serviceWorker.register(sw.href, { scope: scope.href }).catch(function () { /* offline-støtte er en bonus, ikke et krav */ });
  });
})();
