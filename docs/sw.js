const CACHE_NAME="2024-04-28 01:20",urlsToCache=["/tegaki-kaki/","/tegaki-kaki/index.js","/tegaki-kaki/worker.js","/tegaki-kaki/model/model.json","/tegaki-kaki/model/group1-shard1of1.bin","/tegaki-kaki/mp3/correct3.mp3","/tegaki-kaki/mp3/end.mp3","/tegaki-kaki/favicon/favicon.svg"];self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(e=>e.addAll(urlsToCache)))}),self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(t=>t||fetch(e.request)))}),self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(e=>Promise.all(e.filter(e=>e!==CACHE_NAME).map(e=>caches.delete(e)))))})