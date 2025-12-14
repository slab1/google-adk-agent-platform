import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 3000,
		proxy: {
			'/api': {
				target: 'http://localhost:8000',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, '')
			},
			'/ws': {
				target: 'ws://localhost:8000',
				ws: true,
				changeOrigin: true
			}
		}
	},
	build: {
		sourcemap: true,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['svelte', '@sveltejs/kit'],
					charts: ['chart.js'],
					ui: ['lucide-svelte', 'tailwind-merge']
				}
			}
		}
	},
	optimizeDeps: {
		include: ['chart.js', 'lucide-svelte']
	},
	define: {
		global: 'globalThis'
	}
});