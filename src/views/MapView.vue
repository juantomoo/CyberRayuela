<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <h2 class="font-display text-xl text-neon-cyan tracking-wider mb-2">MAPA LITERARIO</h2>
    <p class="font-mono text-xs text-cyber-text-dim mb-6">Los lugares de Rayuela en París y Buenos Aires</p>
    
    <div class="map-container" style="height: 70vh; min-height: 400px;">
      <div ref="mapEl" class="w-full h-full"></div>
    </div>
    
    <!-- Location list -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="loc in locations" :key="loc.id"
        @click="flyTo(loc)"
        class="p-4 border border-cyber-border rounded-lg bg-cyber-dark/50 cursor-pointer hover:border-neon-cyan transition-colors group">
        <h3 class="font-display text-sm text-neon-cyan group-hover:glow-cyan">{{ loc.name }}</h3>
        <p class="text-xs text-cyber-text-dim mt-1 italic line-clamp-2">"{{ loc.quote }}"</p>
        <div class="mt-2 font-mono text-xs text-neon-pink">
          <router-link :to="{ name: 'reader', params: { chapter: loc.chapter } }" class="hover:underline">
            → Capítulo {{ loc.chapter }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import locationsData from '@/data/locations.json'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const locations = locationsData.locations
const mapEl = ref(null)
let map = null

function createMap() {
  if (!mapEl.value) return
  
  map = L.map(mapEl.value, {
    center: [48.8566, 2.3522],
    zoom: 14,
    zoomControl: true
  })
  
  // Dark tile layer (CartoDB Dark Matter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19
  }).addTo(map)
  
  // Custom neon marker icon
  const neonIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:16px;height:16px;background:radial-gradient(circle,#00f0ff 30%,transparent 70%);border-radius:50%;box-shadow:0 0 10px #00f0ff,0 0 20px #00f0ff;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })
  
  // Add markers
  for (const loc of locations) {
    const marker = L.marker([loc.lat, loc.lng], { icon: neonIcon }).addTo(map)
    
    marker.bindPopup(`
      <div style="font-family:'Share Tech Mono',monospace;max-width:250px;">
        <h3 style="color:#00f0ff;font-size:14px;margin:0 0 8px;">${loc.name}</h3>
        <p style="color:#c0c0c8;font-size:12px;font-style:italic;margin:0 0 8px;">"${loc.quote.substring(0, 150)}..."</p>
        <a href="/leer/${loc.chapter}" style="color:#ff2d7b;font-size:11px;text-decoration:none;">→ Leer Capítulo ${loc.chapter}</a>
      </div>
    `, {
      closeButton: true,
      className: 'cyber-popup'
    })
  }
}

function flyTo(loc) {
  if (map) {
    map.flyTo([loc.lat, loc.lng], 16, { duration: 1.5 })
  }
}

onMounted(() => {
  createMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
:deep(.custom-marker) {
  background: transparent !important;
  border: none !important;
}
</style>
