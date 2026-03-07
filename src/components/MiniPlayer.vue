<template>
  <Teleport to="body">
    <transition name="slide-up">
      <div v-if="currentTrack" 
        class="fixed bottom-0 left-0 right-0 z-50 bg-cyber-dark/95 backdrop-blur border-t border-cyber-border px-4 py-2 flex items-center gap-3">
        <div class="flex-1 min-w-0">
          <p class="font-mono text-xs text-neon-cyan truncate">{{ currentTrack.title }}</p>
          <p class="font-mono text-[10px] text-cyber-text-dim truncate">{{ currentTrack.artist }}</p>
        </div>
        <button @click="togglePlay" class="w-8 h-8 flex items-center justify-center text-neon-cyan hover:text-neon-cyan/80">
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <button @click="nextTrack" class="w-8 h-8 flex items-center justify-center text-cyber-text-dim hover:text-neon-cyan">
          ⏭
        </button>
        <router-link to="/musica" class="font-mono text-[10px] text-neon-orange hover:underline">
          ♪
        </router-link>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { inject, ref, computed } from 'vue'

// MiniPlayer reads from injected playlist state (provided by PlaylistView or a global provider)
// If no playlist is active, it stays hidden
const playlistState = inject('playlistState', null)

const currentTrack = computed(() => playlistState?.currentTrack?.value || null)
const isPlaying = computed(() => playlistState?.isPlaying?.value || false)

function togglePlay() {
  playlistState?.togglePlay?.()
}

function nextTrack() {
  playlistState?.next?.()
}
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.3s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
}
</style>
