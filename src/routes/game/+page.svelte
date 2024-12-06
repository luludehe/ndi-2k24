<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';

	onMount(async () => {
		if (typeof window !== 'undefined') {
			const { initGame } = await import('$lib/game/PhaserGame');
			initGame();
		}
	});

	onDestroy(async () => {
		if (typeof window !== 'undefined') {
			const { destroyGame } = await import('$lib/game/PhaserGame');
			destroyGame();
		}
	});
</script>

<div class="flex justify-between mb-3">
	<h3 class="h3 text-black">Score: 0</h3>
	<h3 class="h3 text-black">Username: {$page.url.searchParams.get('username')}</h3>
</div>

<div class="background w-full">
	<div id="phaser-container"></div>
</div>

<style>

    :global(.app) {
        /*background: linear-gradient(to bottom, #00c6ff, #0072ff) !important;*/
        background-size: cover;
				background-repeat: no-repeat;
				background-position: center;
        background-image: url("$lib/images/background-large.jpg");
    }

    #phaser-container {
        position: relative;
        width: fit-content;
        height: fit-content;
        display: flex;
        justify-content: center;
        align-items: center;
				margin: auto;
				border: black 2px solid;
    }

    #phaser-container canvas {
        display: block;
				width: 100%;
				height: 100%;
    }
</style>