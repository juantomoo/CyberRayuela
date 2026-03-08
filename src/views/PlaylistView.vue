<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <h2 class="font-display text-xl text-neon-cyan tracking-wider mb-2">LA BANDA SONORA DE PARÍS</h2>
    <p class="font-mono text-xs text-cyber-text-dim mb-6">Canciones y músicos mencionados en Rayuela</p>
    
    <!-- Player -->
    <div v-if="currentTrack" class="mb-8 border border-neon-cyan/30 rounded-lg overflow-hidden bg-cyber-dark/50">
      <div class="aspect-video max-h-[360px]">
        <div :id="'yt-player'" class="w-full h-full"></div>
      </div>
      <div class="p-4 flex items-center justify-between">
        <div>
          <h3 class="font-mono text-sm text-neon-cyan">{{ currentTrack.title }}</h3>
          <p class="text-xs text-cyber-text-dim">{{ currentTrack.artist }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button @click="prevTrack" class="text-cyber-text-dim hover:text-neon-cyan transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8.445 14.832A1 1 0 0010 14V6a1 1 0 00-1.555-.832l-5 3a1 1 0 000 1.664l5 3zM15.445 14.832A1 1 0 0017 14V6a1 1 0 00-1.555-.832l-5 3a1 1 0 000 1.664l5 3z"/></svg>
          </button>
          <button @click="togglePlay" class="text-neon-cyan hover:text-neon-pink transition-colors">
            <svg v-if="!isPlaying" class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/></svg>
            <svg v-else class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
          </button>
          <button @click="nextTrack" class="text-cyber-text-dim hover:text-neon-cyan transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832l5-3a1 1 0 000-1.664l-5-3zM11.555 5.168A1 1 0 0010 6v8a1 1 0 001.555.832l5-3a1 1 0 000-1.664l-5-3z"/></svg>
          </button>
          <button @click="shufflePlay" class="text-cyber-text-dim hover:text-neon-orange transition-colors" title="Aleatorio">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M15.95 2.393c.143-.024.287-.024.43 0l.212.053.174.088.15.115.115.15.088.174.053.212.024.43v3.97a.75.75 0 01-1.5 0V4.81l-1.97 1.97a.75.75 0 01-1.06-1.06l1.97-1.97H12.41a.75.75 0 010-1.5h3.54zM2.22 2.22a.75.75 0 011.06 0l14.5 14.5a.75.75 0 11-1.06 1.06L2.22 3.28a.75.75 0 010-1.06z"/></svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Track list -->
    <div class="space-y-2">
      <div v-for="(track, idx) in tracks" :key="idx"
        @click="playTrack(idx)"
        :class="{ 'border-neon-cyan/50 bg-cyber-panel/50': currentIndex === idx }"
        class="flex items-center gap-4 p-3 border border-cyber-border/50 rounded-lg cursor-pointer hover:border-neon-cyan/30 hover:bg-cyber-dark/50 transition-all group">
        <div class="w-8 h-8 flex items-center justify-center">
          <span v-if="currentIndex === idx && isPlaying" class="text-neon-cyan text-lg">♪</span>
          <span v-else class="text-cyber-text-dim font-mono text-sm group-hover:text-neon-cyan">{{ idx + 1 }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-mono text-sm truncate" :class="currentIndex === idx ? 'text-neon-cyan' : 'text-cyber-text'">{{ track.title }}</h3>
          <p class="text-xs text-cyber-text-dim truncate">{{ track.artist }}</p>
        </div>
        <div class="hidden md:flex gap-1 flex-wrap justify-end">
          <router-link v-for="ch in track.chapters.slice(0, 3)" :key="ch"
            :to="{ name: 'reader', params: { chapter: ch } }"
            class="font-mono text-xs text-neon-pink/60 hover:text-neon-pink px-1"
            @click.stop>
            Cap.{{ ch }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide, nextTick } from 'vue'
import playlistData from '@/data/playlist.json'

const tracks = playlistData.tracks
const currentIndex = ref(-1)
const isPlaying = ref(false)
let player = null
let ytReady = false
let pendingVideoId = null

const currentTrack = ref(null)

// Expose to mini player
provide('playlist', {
  currentTrack,
  isPlaying,
  togglePlay,
  nextTrack
})

// Load YouTube IFrame API
function loadYTAPI() {
  if (window.YT && window.YT.Player) {
    ytReady = true
    return
  }
  const tag = document.createElement('script')
  tag.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(tag)
  
  window.onYouTubeIframeAPIReady = () => {
    ytReady = true
  }
}

let playerReady = false

function createPlayer(videoId) {
  if (player && playerReady) {
    player.loadVideoById(videoId)
    return
  }
  if (player && !playerReady) {
    // Player is still initializing — queue the video
    pendingVideoId = videoId
    return
  }

  playerReady = false
  player = new window.YT.Player('yt-player', {
    videoId,
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      color: 'white'
    },
    events: {
      onReady: () => {
        playerReady = true
        if (pendingVideoId) {
          player.loadVideoById(pendingVideoId)
          pendingVideoId = null
        } else {
          player.playVideo()
        }
      },
      onStateChange: (event) => {
        isPlaying.value = event.data === window.YT.PlayerState.PLAYING
        if (event.data === window.YT.PlayerState.ENDED) {
          nextTrack()
        }
      },
      onError: (event) => {
        // 2=bad param, 5=HTML5, 100=not found, 101/150=not embeddable
        console.warn(`[YT] Error ${event.data} — "${currentTrack.value?.title}" no disponible, saltando...`)
        setTimeout(() => nextTrack(), 800)
      }
    }
  })
}

async function playTrack(idx) {
  if (idx < 0 || idx >= tracks.length) return
  currentIndex.value = idx
  currentTrack.value = tracks[idx]

  // The #yt-player div is inside v-if="currentTrack" — Vue hasn't rendered
  // it yet at this point. We MUST wait for the DOM update before YT.Player
  // can find the element.
  await nextTick()

  if (ytReady) {
    createPlayer(tracks[idx].videoId)
  } else {
    // Wait for YT API
    const check = setInterval(() => {
      if (ytReady) {
        clearInterval(check)
        createPlayer(tracks[idx].videoId)
      }
    }, 200)
  }
}

function togglePlay() {
  if (!player || !playerReady) {
    if (tracks.length > 0) playTrack(0)
    return
  }
  if (isPlaying.value) {
    player.pauseVideo()
  } else {
    player.playVideo()
  }
}

function nextTrack() {
  const next = (currentIndex.value + 1) % tracks.length
  playTrack(next)
}

function prevTrack() {
  const prev = currentIndex.value <= 0 ? tracks.length - 1 : currentIndex.value - 1
  playTrack(prev)
}

function shufflePlay() {
  const random = Math.floor(Math.random() * tracks.length)
  playTrack(random)
}

onMounted(() => {
  loadYTAPI()
})

onUnmounted(() => {
  if (player && player.destroy) {
    player.destroy()
    player = null
    playerReady = false
    pendingVideoId = null
  }
})
</script>
