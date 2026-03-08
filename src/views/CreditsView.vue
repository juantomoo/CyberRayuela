<template>
  <div class="max-w-3xl mx-auto px-4 py-12 pb-24">
    <h2 class="font-display text-xl text-neon-cyan tracking-widest mb-8">CRÉDITOS</h2>

    <!-- Obra -->
    <section class="credit-section">
      <h3 class="credit-heading">Sobre la obra</h3>
      <p>
        <em>Rayuela</em> (1963) es una novela de <strong>Julio Cortázar</strong>.
        Los derechos de autor de la obra <strong>no han caducado</strong>; su texto
        permanece protegido bajo las leyes de propiedad intelectual vigentes.
      </p>
      <p>
        Este proyecto reproduce fragmentos de la obra con fines
        <strong>estrictamente educativos y de investigación personal</strong>,
        sin ánimo de lucro y sin intención de sustituir la adquisición del
        libro original.  Se recomienda adquirir una edición física o digital
        autorizada.
      </p>
    </section>

    <!-- Uso -->
    <section class="credit-section">
      <h3 class="credit-heading">Uso personal &amp; educativo</h3>
      <p>
        <strong>CyberRayuela</strong> es un proyecto de uso estrictamente personal
        y educativo.  No tiene fines comerciales ni genera ingresos de ningún tipo.
        Su único propósito es facilitar la lectura interactiva y el estudio de la
        estructura narrativa de <em>Rayuela</em>.
      </p>
    </section>

    <!-- Música -->
    <section class="credit-section">
      <h3 class="credit-heading">Música</h3>
      <p>
        La banda sonora embebida reproduce fragmentos de piezas de jazz, tango y
        música clásica mencionadas en la novela.  Los videos se cargan directamente
        desde YouTube mediante su API oficial; <strong>CyberRayuela no aloja ni
        redistribuye ningún archivo de audio o video</strong>.
      </p>
    </section>

    <!-- Contacto -->
    <section class="credit-section">
      <h3 class="credit-heading">Reclamaciones de derechos de autor</h3>
      <p>
        Si usted es titular de derechos sobre algún contenido utilizado en este
        proyecto y desea que sea retirado, por favor envíe un mensaje a:
      </p>
      <p class="my-4">
        <button @click="revealEmail = !revealEmail" class="btn-neon text-xs px-4 py-2">
          {{ revealEmail ? 'Ocultar correo' : 'Mostrar correo de contacto' }}
        </button>
      </p>
      <transition name="fade">
        <p v-if="revealEmail" class="font-mono text-sm text-neon-orange select-all break-all">
          machina<span class="text-cyber-text-dim">.</span>work<span class="text-cyber-text-dim">@</span>gmail<span class="text-cyber-text-dim">.</span>com
        </p>
      </transition>
    </section>

    <!-- Desarrollador -->
    <section class="credit-section">
      <h3 class="credit-heading">Desarrollo</h3>
      <p>
        Desarrollado por <strong class="text-neon-cyan">Juan Tomoo</strong>.
        Este software se ofrece <em>tal cual</em>, sin licencia de uso alguna.
      </p>
      <p class="mt-3">
        <a href="https://juantomoo.github.io/" target="_blank" rel="noopener"
          class="inline-flex items-center gap-2 text-neon-cyan hover:text-neon-pink transition-colors font-mono text-sm">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.5 11.5 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 21.796 24 17.298 24 12 24 5.37 18.627 0 12 0z"/></svg>
          juantomoo.github.io
        </a>
      </p>
    </section>

    <!-- Footer tagline -->
    <div class="mt-12 pt-6 border-t border-cyber-border text-center">
      <p class="font-display text-xs text-cyber-text-dim tracking-widest">
        CYBER<span class="text-neon-pink">//</span>RAYUELA — 2025
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const revealEmail = ref(false)
</script>

<style scoped>
.credit-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-cyber-border);
}
.credit-heading {
  font-family: var(--font-display);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--color-neon-orange);
  margin-bottom: 0.75rem;
}
.credit-section p {
  font-size: 0.95rem;
  line-height: 1.8;
  color: var(--color-cyber-text);
}
.credit-section p + p { margin-top: 0.5rem; }
</style>
