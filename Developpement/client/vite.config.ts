import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // <-- C'est cette ligne qui corrige l'erreur
  plugins: [react()],
})

