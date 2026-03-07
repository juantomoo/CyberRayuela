<template>
  <div :class="{ 'light-mode': !settings.darkMode }">
    <div class="crt-overlay" v-if="settings.darkMode"></div>
    
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-cyber-black/90 backdrop-blur-sm border-b border-cyber-border">
      <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <router-link to="/" class="font-display text-neon-cyan text-sm tracking-widest hover:opacity-80 transition-opacity">
          CYBER<span class="text-neon-pink">//</span>RAYUELA
        </router-link>
        
        <!-- Desktop nav -->
        <div class="hidden md:flex items-center gap-6">
          <router-link v-for="link in navLinks" :key="link.to" :to="link.to"
            class="font-mono text-xs uppercase tracking-wider text-cyber-text-dim hover:text-neon-cyan transition-colors"
            active-class="!text-neon-cyan">
            {{ link.label }}
          </router-link>
          
          <button @click="settings.toggleDark()" class="text-cyber-text-dim hover:text-neon-orange transition-colors" :title="settings.darkMode ? 'Modo claro' : 'Modo oscuro'">
            <svg v-if="settings.darkMode" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/></svg>
            <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
          </button>
        </div>
        
        <!-- Mobile menu button -->
        <button @click="mobileMenu = !mobileMenu" class="md:hidden text-cyber-text-dim">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!mobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <!-- Mobile menu -->
      <div v-if="mobileMenu" class="md:hidden bg-cyber-dark border-t border-cyber-border px-4 py-3">
        <router-link v-for="link in navLinks" :key="link.to" :to="link.to"
          class="block py-2 font-mono text-sm text-cyber-text-dim hover:text-neon-cyan"
          active-class="!text-neon-cyan"
          @click="mobileMenu = false">
          {{ link.label }}
        </router-link>
        <button @click="settings.toggleDark(); mobileMenu = false" class="mt-2 py-2 font-mono text-sm text-cyber-text-dim hover:text-neon-orange">
          {{ settings.darkMode ? '☀ Modo claro' : '🌙 Modo oscuro' }}
        </button>
      </div>
    </nav>
    
    <!-- Main content -->
    <main class="pt-14 min-h-screen">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- La Maga Random Button -->
    <RandomButton />
    
    <!-- Mini Music Player -->
    <MiniPlayer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import RandomButton from '@/components/RandomButton.vue'
import MiniPlayer from '@/components/MiniPlayer.vue'

const settings = useSettingsStore()
const mobileMenu = ref(false)

const navLinks = [
  { to: '/leer', label: 'Leer' },
  { to: '/mapa', label: 'Mapa' },
  { to: '/musica', label: 'Música' },
  { to: '/morelli', label: 'Morelli' },
  { to: '/ia', label: 'IA' }
]
</script>
