<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
    <!-- Background grid animation -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute inset-0" style="background-image: linear-gradient(rgba(0,240,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>
    </div>
    
    <!-- Title -->
    <div class="text-center mb-12 relative z-10">
      <h1 class="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-widest text-neon-cyan glitch-text mb-4"
          data-text="CYBER//RAYUELA">
        CYBER<span class="text-neon-pink">//</span>RAYUELA
      </h1>
      <p class="font-mono text-sm md:text-base text-cyber-text-dim tracking-wider flicker">
        EL LECTOR CÓMPLICE — JULIO CORTÁZAR
      </p>
      <div class="mt-4 w-64 mx-auto h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50"></div>
    </div>
    
    <!-- Quote -->
    <blockquote class="max-w-xl text-center text-cyber-text-dim italic font-body text-sm md:text-base mb-12 relative z-10 px-8">
      <p>"A su manera este libro es muchos libros, pero sobre todo es dos libros."</p>
      <footer class="mt-2 text-neon-pink text-xs font-mono">— Tablero de Dirección</footer>
    </blockquote>
    
    <!-- Reading Mode Selection -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full relative z-10 mb-16">
      <button v-for="mode in modes" :key="mode.id"
        @click="selectMode(mode.id)"
        class="group p-6 border border-cyber-border rounded-lg hover:border-neon-cyan transition-all duration-300 bg-cyber-dark/50 backdrop-blur-sm text-left"
        :class="{ 'box-glow-cyan': mode.id === 'tradicional', 'box-glow-pink': mode.id === 'rayuela' }">
        <div class="font-display text-lg mb-2 group-hover:text-neon-cyan transition-colors" :class="mode.color">
          {{ mode.title }}
        </div>
        <p class="text-sm text-cyber-text-dim leading-relaxed">{{ mode.description }}</p>
        <div class="mt-4 font-mono text-xs text-cyber-text-dim">
          {{ mode.detail }}
        </div>
      </button>
    </div>
    
    <!-- Quick Stats -->
    <div class="flex gap-8 font-mono text-xs text-cyber-text-dim relative z-10">
      <div class="text-center">
        <div class="text-2xl text-neon-cyan font-display">155</div>
        <div>capítulos</div>
      </div>
      <div class="text-center">
        <div class="text-2xl text-neon-pink font-display">3</div>
        <div>secciones</div>
      </div>
      <div class="text-center">
        <div class="text-2xl text-neon-orange font-display">∞</div>
        <div>caminos</div>
      </div>
    </div>
    
    <!-- Rayuela hopscotch graphic -->
    <div class="mt-16 opacity-20 relative z-10">
      <svg width="80" height="160" viewBox="0 0 80 160">
        <rect x="5" y="0" width="70" height="30" rx="3" fill="none" stroke="#00f0ff" stroke-width="1"/>
        <rect x="5" y="35" width="32" height="30" rx="3" fill="none" stroke="#ff2d7b" stroke-width="1"/>
        <rect x="43" y="35" width="32" height="30" rx="3" fill="none" stroke="#ff2d7b" stroke-width="1"/>
        <rect x="5" y="70" width="70" height="30" rx="3" fill="none" stroke="#00f0ff" stroke-width="1"/>
        <rect x="5" y="105" width="32" height="30" rx="3" fill="none" stroke="#ff6b00" stroke-width="1"/>
        <rect x="43" y="105" width="32" height="30" rx="3" fill="none" stroke="#ff6b00" stroke-width="1"/>
        <circle cx="40" cy="150" r="6" fill="#00f0ff" opacity="0.6">
          <animate attributeName="cy" values="150;145;150" dur="1.5s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useReadingStore } from '@/stores/reading'

const router = useRouter()
const reading = useReadingStore()

const modes = [
  {
    id: 'tradicional',
    title: 'MODO TRADICIONAL',
    description: 'Lee el libro del capítulo 1 al 56, como una novela convencional. Al final, tres estrellitas equivalen a la palabra Fin.',
    detail: 'Capítulos 1 → 56',
    color: 'text-neon-cyan'
  },
  {
    id: 'rayuela',
    title: 'MODO RAYUELA',
    description: 'Sigue el Tablero de Dirección de Cortázar. Empieza en el capítulo 73 y salta entre los 155 capítulos hasta el bucle infinito.',
    detail: '73 → 1 → 2 → 116 → ... → 131 ↔ 58',
    color: 'text-neon-pink'
  },
  {
    id: 'laberinto',
    title: 'MODO LABERINTO',
    description: 'Navegación libre. Elige cualquier camino, salta a donde quieras, deja que el azar te guíe. Eres el lector cómplice.',
    detail: 'Tu propio tablero',
    color: 'text-neon-orange'
  }
]

function selectMode(mode) {
  reading.setMode(mode)
  router.push({ name: 'reader', params: { chapter: reading.currentChapter } })
}
</script>
