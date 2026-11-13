import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-core': ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
          'chartjs': ['chart.js', 'react-chartjs-2'],
          'firebase': ['firebase/app', 'firebase/firestore'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})

