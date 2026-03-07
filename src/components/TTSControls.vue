<template>
  <div class="flex items-center gap-3 p-3 border border-cyber-border/50 rounded-lg bg-cyber-dark/30">
    <div class="flex items-center gap-2">
      <button v-if="!isPlaying" @click="$emit('play')" title="Reproducir"
        class="w-8 h-8 flex items-center justify-center text-neon-cyan hover:text-neon-cyan/80 transition-colors">
        ▶
      </button>
      <button v-else-if="isPaused" @click="resume" title="Continuar"
        class="w-8 h-8 flex items-center justify-center text-neon-cyan hover:text-neon-cyan/80 transition-colors">
        ▶
      </button>
      <button v-else @click="pause" title="Pausar"
        class="w-8 h-8 flex items-center justify-center text-neon-orange hover:text-neon-orange/80 transition-colors">
        ⏸
      </button>
      <button @click="$emit('stop')" :disabled="!isPlaying" title="Detener"
        class="w-8 h-8 flex items-center justify-center text-neon-pink hover:text-neon-pink/80 disabled:opacity-30 transition-colors">
        ⏹
      </button>
    </div>
    
    <div class="h-6 w-px bg-cyber-border"></div>
    
    <!-- Voice selector -->
    <select v-model="settings.ttsVoice"
      class="bg-transparent border border-cyber-border text-cyber-text font-mono text-xs px-2 py-1 rounded max-w-[160px] focus:border-neon-cyan focus:outline-none">
      <option v-for="v in voices" :key="v.name" :value="v.name">
        {{ v.name.replace(/Microsoft |Google /, '') }}
      </option>
    </select>
    
    <!-- Rate slider -->
    <div class="flex items-center gap-1">
      <span class="font-mono text-xs text-cyber-text-dim">{{ settings.ttsRate.toFixed(1) }}x</span>
      <input type="range" v-model.number="settings.ttsRate" min="0.5" max="2" step="0.1"
        class="w-16 accent-neon-cyan" />
    </div>
    
    <!-- Status -->
    <span v-if="isPlaying && !isPaused" class="font-mono text-xs text-neon-cyan animate-pulse">
      ♪ Leyendo...
    </span>
    <span v-else-if="isPaused" class="font-mono text-xs text-neon-orange">
      Pausado
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps({
  paragraphs: { type: Array, default: () => [] },
  currentParagraph: { type: Number, default: -1 },
  isPlaying: { type: Boolean, default: false },
  isPaused: { type: Boolean, default: false },
  voices: { type: Array, default: () => [] }
})

defineEmits(['play', 'stop'])

const settings = useSettingsStore()

function pause() {
  window.speechSynthesis.pause()
}

function resume() {
  window.speechSynthesis.resume()
}
</script>
