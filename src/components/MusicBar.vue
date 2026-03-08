<template>
  <Teleport to="body">
    <!-- Hidden YouTube player (1×1 invisible, audio only) -->
    <div class="yt-hidden-player">
      <div id="global-yt-player"></div>
    </div>

    <!-- Bottom bar -->
    <div class="music-bar" :class="{ 'music-bar--active': !!currentTrack }">
      <!-- Playlist panel (slides up) -->
      <transition name="playlist-slide">
        <div v-if="showPlaylist" class="playlist-panel">
          <div class="playlist-panel__header">
            <h3 class="font-display text-xs text-neon-cyan tracking-widest uppercase">La Banda Sonora de París</h3>
            <button @click="showPlaylist = false" class="text-cyber-text-dim hover:text-neon-pink transition-colors text-lg leading-none">&times;</button>
          </div>
          <div class="playlist-panel__list">
            <div v-for="(track, idx) in tracks" :key="idx"
              @click="playTrack(idx)"
              :class="{ 'playlist-item--active': currentIndex === idx }"
              class="playlist-item">
              <span class="playlist-item__num">
                <span v-if="currentIndex === idx && isPlaying" class="text-neon-cyan">♪</span>
                <span v-else>{{ idx + 1 }}</span>
              </span>
              <div class="playlist-item__info">
                <span class="playlist-item__title">{{ track.title }}</span>
                <span class="playlist-item__artist">{{ track.artist }}</span>
              </div>
              <div class="playlist-item__chapters">
                <router-link v-for="ch in track.chapters.slice(0, 2)" :key="ch"
                  :to="{ name: 'reader', params: { chapter: ch } }"
                  class="font-mono text-[10px] text-neon-pink/50 hover:text-neon-pink px-0.5"
                  @click.stop>
                  {{ ch }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Controls bar -->
      <div class="music-bar__controls">
        <!-- Track info -->
        <div class="music-bar__info" v-if="currentTrack">
          <p class="music-bar__title">{{ currentTrack.title }}</p>
          <p class="music-bar__artist">{{ currentTrack.artist }}</p>
        </div>
        <div class="music-bar__info" v-else>
          <p class="music-bar__title music-bar__title--idle">Banda sonora</p>
          <p class="music-bar__artist">▶ para iniciar</p>
        </div>

        <!-- Playback buttons -->
        <div class="music-bar__buttons">
          <button @click="prevTrack" class="music-bar__btn" title="Anterior">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14V6a1 1 0 00-1.555-.832l-5 3a1 1 0 000 1.664l5 3zM15.445 14.832A1 1 0 0017 14V6a1 1 0 00-1.555-.832l-5 3a1 1 0 000 1.664l5 3z"/></svg>
          </button>
          <button @click="togglePlay" class="music-bar__btn music-bar__btn--play" title="Play / Pause">
            <svg v-if="!isPlaying" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
            </svg>
            <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </button>
          <button @click="nextTrack" class="music-bar__btn" title="Siguiente">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832l5-3a1 1 0 000-1.664l-5-3zM11.555 5.168A1 1 0 0010 6v8a1 1 0 001.555.832l5-3a1 1 0 000-1.664l-5-3z"/></svg>
          </button>
          <button @click="shufflePlay" class="music-bar__btn" title="Aleatorio">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 010 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h3a1 1 0 110 2H4a1 1 0 01-1-1zm10-12a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm0 12a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
          </button>
        </div>

        <!-- Extra buttons -->
        <div class="music-bar__extra">
          <a v-if="currentTrack" :href="'https://www.youtube.com/watch?v=' + currentTrack.videoId"
            target="_blank" rel="noopener"
            class="music-bar__btn" title="Abrir en YouTube">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.5 6.19a3 3 0 00-2.11-2.13C19.55 3.5 12 3.5 12 3.5s-7.55 0-9.39.56A3 3 0 00.5 6.19 31.25 31.25 0 000 12a31.25 31.25 0 00.5 5.81 3 3 0 002.11 2.13c1.84.56 9.39.56 9.39.56s7.55 0 9.39-.56a3 3 0 002.11-2.13A31.25 31.25 0 0024 12a31.25 31.25 0 00-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
          </a>
          <button @click="showPlaylist = !showPlaylist" class="music-bar__btn" title="Playlist">
            <svg class="w-4 h-4" :class="{ 'text-neon-cyan': showPlaylist }" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm10 0a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { usePlayer } from '@/composables/usePlayer'

const {
  tracks,
  currentIndex,
  currentTrack,
  isPlaying,
  loadYTAPI,
  playTrack,
  togglePlay,
  nextTrack,
  prevTrack,
  shufflePlay,
  destroyPlayer
} = usePlayer()

const showPlaylist = ref(false)

onMounted(() => { loadYTAPI() })
onUnmounted(() => { destroyPlayer() })
</script>

<style scoped>
/* Hidden YT iframe */
.yt-hidden-player {
  position: fixed;
  bottom: 0; left: 0;
  width: 1px; height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  z-index: -1;
}

/* ── Bottom bar ── */
.music-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 50;
  background: rgba(10, 10, 15, 0.96);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--color-cyber-border);
  font-family: var(--font-mono);
}

.music-bar__controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  max-width: 72rem;
  margin: 0 auto;
}

.music-bar__info {
  flex: 1;
  min-width: 0;
}
.music-bar__title {
  font-size: 0.75rem;
  color: var(--color-neon-cyan);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.music-bar__title--idle {
  color: var(--color-cyber-text-dim);
}
.music-bar__artist {
  font-size: 0.625rem;
  color: var(--color-cyber-text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-bar__buttons {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.music-bar__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem; height: 2rem;
  color: var(--color-cyber-text-dim);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
  text-decoration: none;
}
.music-bar__btn:hover { color: var(--color-neon-cyan); }
.music-bar__btn--play { color: var(--color-neon-cyan); }
.music-bar__btn--play:hover { color: var(--color-neon-pink); }

.music-bar__extra {
  display: flex;
  align-items: center;
  gap: 0;
}

/* ── Playlist panel ── */
.playlist-panel {
  position: absolute;
  bottom: 100%;
  left: 0; right: 0;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  background: rgba(18, 18, 24, 0.98);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--color-neon-cyan);
  border-bottom: 1px solid var(--color-cyber-border);
}

.playlist-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-cyber-border);
}

.playlist-panel__list {
  overflow-y: auto;
  flex: 1;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(42, 42, 58, 0.3);
}
.playlist-item:hover { background: rgba(0, 240, 255, 0.04); }
.playlist-item--active { background: rgba(0, 240, 255, 0.08); }

.playlist-item__num {
  width: 1.5rem;
  text-align: center;
  font-size: 0.7rem;
  color: var(--color-cyber-text-dim);
  flex-shrink: 0;
}

.playlist-item__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.playlist-item__title {
  font-size: 0.75rem;
  color: var(--color-cyber-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.playlist-item--active .playlist-item__title { color: var(--color-neon-cyan); }
.playlist-item__artist {
  font-size: 0.625rem;
  color: var(--color-cyber-text-dim);
}

.playlist-item__chapters {
  display: none;
  gap: 0.25rem;
  flex-shrink: 0;
}
@media (min-width: 768px) {
  .playlist-item__chapters { display: flex; }
}

/* ── Transitions ── */
.playlist-slide-enter-active,
.playlist-slide-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.playlist-slide-enter-from,
.playlist-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
