import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const deployTarget = process.env.DEPLOY_TARGET;
const base = deployTarget === 'ghpages' ? '/canvas.ai/' : '/';

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()]
});

