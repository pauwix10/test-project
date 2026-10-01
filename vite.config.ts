import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // One entry per track. Each builds to dist/<track>/index.html so Netlify serves it
  // as a real static file at its canonical URL, ahead of the catch-all redirect.
  // Adding a track = new <track>/index.html + src/entries/<track>.tsx + a line here.
  build: {
    rollupOptions: {
      input: {
        'ottawa-office-space': path.resolve(__dirname, 'ottawa-office-space/index.html'),
        'ottawa-coworking-space': path.resolve(__dirname, 'ottawa-coworking-space/index.html'),
        'ottawa-virtual-office': path.resolve(__dirname, 'ottawa-virtual-office/index.html'),
        'ottawa-meeting-rooms': path.resolve(__dirname, 'ottawa-meeting-rooms/index.html'),
      },
    },
  },
  assetsInclude: ['**/*.svg'],
})
