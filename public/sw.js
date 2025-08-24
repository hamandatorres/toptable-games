// TopTable Games - Modern Service Worker with Workbox-style caching
const CACHE_NAME = "toptable-games-v2.0";
const STATIC_CACHE = "toptable-static-v2.0";
const API_CACHE = "toptable-api-v2.0";
const IMAGE_CACHE = "toptable-images-v2.0";

// Static assets to cache immediately
const staticAssets = ["/", "/manifest.json", "/favicon.ico", "/index.html"];

// Install event - cache critical resources
self.addEventListener("install", (event) => {
	console.log("[SW] Installing service worker...");
	event.waitUntil(
		Promise.all([
			// Cache static assets
			caches.open(STATIC_CACHE).then((cache) => {
				return cache.addAll(staticAssets);
			}),
			// Skip waiting to activate immediately
			self.skipWaiting(),
		])
	);
});

// Activate event - clean up old caches and take control
self.addEventListener("activate", (event) => {
	console.log("[SW] Activating service worker...");
	event.waitUntil(
		Promise.all([
			// Clean up old caches
			caches.keys().then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (
							cacheName !== CACHE_NAME &&
							cacheName !== STATIC_CACHE &&
							cacheName !== API_CACHE &&
							cacheName !== IMAGE_CACHE
						) {
							console.log("[SW] Deleting old cache:", cacheName);
							return caches.delete(cacheName);
						}
					})
				);
			}),
			// Take control of all clients immediately
			self.clients.claim(),
		])
	);
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// API requests - Network First with cache fallback
	if (url.pathname.startsWith("/api/")) {
		event.respondWith(networkFirstStrategy(request, API_CACHE));
		return;
	}

	// Images - Cache First with network fallback
	if (request.destination === "image") {
		event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
		return;
	}

	// Static assets (JS, CSS) - Cache First with network fallback
	if (
		request.destination === "script" ||
		request.destination === "style" ||
		url.pathname.includes("/assets/")
	) {
		event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
		return;
	}

	// HTML pages - Network First with cache fallback
	if (request.destination === "document") {
		event.respondWith(networkFirstStrategy(request, STATIC_CACHE));
		return;
	}

	// Default - Network First
	event.respondWith(networkFirstStrategy(request, CACHE_NAME));
});

// Network First Strategy - Try network first, fallback to cache
async function networkFirstStrategy(request, cacheName) {
	try {
		const response = await fetch(request);

		// Cache successful responses
		if (response.status === 200) {
			const cache = await caches.open(cacheName);
			cache.put(request, response.clone());
		}

		return response;
	} catch (error) {
		console.log("[SW] Network failed, trying cache:", request.url);
		const cachedResponse = await caches.match(request);

		if (cachedResponse) {
			return cachedResponse;
		}

		// Return offline page for navigation requests
		if (request.destination === "document") {
			return new Response(
				`<!DOCTYPE html>
				<html>
				<head>
					<title>TopTable Games - Offline</title>
					<style>
						body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
						.offline { color: #666; }
					</style>
				</head>
				<body>
					<h1>TopTable Games</h1>
					<p class="offline">You're currently offline. Please check your connection.</p>
				</body>
				</html>`,
				{
					status: 200,
					headers: { "Content-Type": "text/html" },
				}
			);
		}

		throw error;
	}
}

// Cache First Strategy - Try cache first, fallback to network
async function cacheFirstStrategy(request, cacheName) {
	const cachedResponse = await caches.match(request);

	if (cachedResponse) {
		// Update cache in background
		updateCacheInBackground(request, cacheName);
		return cachedResponse;
	}

	// Not in cache, fetch from network
	try {
		const response = await fetch(request);

		if (response.status === 200) {
			const cache = await caches.open(cacheName);
			cache.put(request, response.clone());
		}

		return response;
	} catch (error) {
		console.log("[SW] Failed to fetch:", request.url);
		throw error;
	}
}

// Background cache update
async function updateCacheInBackground(request, cacheName) {
	try {
		const response = await fetch(request);
		if (response.status === 200) {
			const cache = await caches.open(cacheName);
			cache.put(request, response.clone());
		}
	} catch (error) {
		// Silent fail for background updates
	}
}

// Handle messages from the main thread
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});
