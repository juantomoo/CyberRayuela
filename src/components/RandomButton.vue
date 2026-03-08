<template>
  <button @click="goRandom" title="La Maga — Capítulo aleatorio"
    class="fixed bottom-16 right-6 z-40 w-14 h-14 rounded-full bg-neon-pink text-white flex items-center justify-center shadow-lg shadow-neon-pink/30 pulse-maga hover:scale-110 transition-transform">
    <span class="text-2xl">🎲</span>
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useReadingStore } from '@/stores/reading'

const router = useRouter()
const reading = useReadingStore()

function goRandom() {
  reading.goRandom()
  router.push({ name: 'reader', params: { chapter: reading.currentChapter } })
}
</script>
