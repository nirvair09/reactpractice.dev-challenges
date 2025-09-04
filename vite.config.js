import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/reactpractice.dev-challenges/todo-dnd-app/', // 👈 important for GitHub Pages
})
