import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	resolve: {
		alias: {
			lib: '/src/lib',
		},
	},
	plugins: [sveltekit()],
	optimizeDeps: {
		include: ['phaser']
	},
});
