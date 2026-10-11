import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// `base` must match the GitHub Pages URL path. The deploy workflow sets
// BASE_PATH automatically from the repository name (e.g. "/Squad_Timetable/"),
// so renaming the repo needs no code change. Local builds fall back to the default.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.BASE_PATH || '/Squad_Timetable/',
});
