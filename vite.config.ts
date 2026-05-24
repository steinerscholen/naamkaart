import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Required for GitHub Pages: the app is served at /student-badges/ not /
  base: '/student-badges/',
})
