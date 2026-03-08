/**
 * usePlayer — Global music player composable (singleton state).
 *
 * Manages the YouTube IFrame player, track list and playback state.
 * The actual <iframe> lives inside MusicBar.vue as a 1×1 invisible element;
 * this composable only manipulates it via the YT API.
 */
import { ref } from 'vue'
import playlistData from '@/data/playlist.json'

/* ── singleton reactive state (module-level) ── */
const tracks = playlistData.tracks
const currentIndex = ref(-1)
const currentTrack = ref(null)
const isPlaying = ref(false)

let player = null
let playerReady = false
let ytReady = false
let pendingVideoId = null
let ytLoaded = false

export function usePlayer() {
  /* ── YT API loader ── */
  function loadYTAPI() {
    if (ytLoaded) return
    ytLoaded = true
    if (window.YT && window.YT.Player) { ytReady = true; return }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)

    window.onYouTubeIframeAPIReady = () => { ytReady = true }
  }

  /* ── player lifecycle ── */
  function createPlayer(videoId) {
    const el = document.getElementById('global-yt-player')
    if (!el) return

    if (player && playerReady) {
      player.loadVideoById(videoId)
      return
    }
    if (player && !playerReady) {
      pendingVideoId = videoId
      return
    }

    playerReady = false
    player = new window.YT.Player('global-yt-player', {
      height: '1',
      width: '1',
      videoId,
      playerVars: { autoplay: 1, modestbranding: 1, rel: 0 },
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
          if (event.data === window.YT.PlayerState.ENDED) nextTrack()
        },
        onError: (event) => {
          console.warn(`[YT] Error ${event.data} — skipping`)
          setTimeout(() => nextTrack(), 800)
        }
      }
    })
  }

  /* ── playback controls ── */
  function playTrack(idx) {
    if (idx < 0 || idx >= tracks.length) return
    currentIndex.value = idx
    currentTrack.value = tracks[idx]

    if (ytReady) {
      createPlayer(tracks[idx].videoId)
    } else {
      const check = setInterval(() => {
        if (ytReady) { clearInterval(check); createPlayer(tracks[idx].videoId) }
      }, 200)
    }
  }

  function togglePlay() {
    if (!player || !playerReady) {
      if (tracks.length > 0) playTrack(0)
      return
    }
    if (isPlaying.value) player.pauseVideo()
    else player.playVideo()
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
    playTrack(Math.floor(Math.random() * tracks.length))
  }

  function destroyPlayer() {
    if (player && player.destroy) {
      player.destroy()
      player = null
      playerReady = false
      pendingVideoId = null
    }
  }

  return {
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
  }
}
