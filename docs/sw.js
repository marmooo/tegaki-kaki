const CACHE_NAME="2023-12-08 09:10",urlsToCache=["/tegaki-kaki/","/tegaki-kaki/index.js","/tegaki-kaki/worker.js","/tegaki-kaki/model/model.json","/tegaki-kaki/model/group1-shard1of1.bin","/tegaki-kaki/mp3/correct3.mp3","/tegaki-kaki/mp3/end.mp3","/tegaki-kaki/favicon/favicon.svg","https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js"];self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(e=>e.addAll(urlsToCache)))}),self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(t=>t||fetch(e.request)))}),self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(e=>Promise.all(e.filter(e=>e!==CACHE_NAME).map(e=>caches.delete(e)))))})