<script lang="ts">
	import Counter from '$lib/components/Counter.svelte';
	import welcome from 'lib/images/svelte-welcome.webp';
	import welcomeFallback from '$lib/images/svelte-welcome.png';
	import { Avatar } from '@skeletonlabs/skeleton';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
</script>


<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1 class="h1">Bienvenue sur ce magnifique site</h1>
	<h3 class="h3 text-center p-5">Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi aperiam quod deserunt veniam odio nemo officiis! Recusandae architecto asperiores facilis facere consectetur maiores necessitatibus hic dicta aliquid. Aut, saepe nihil!</h3>

	<button class="inline-block cursor-pointer rounded-md bg-green-600 px-4 py-3 text-center text-2xl shadow-xl shadow-gray-400 font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-green-700 mt-10">
	Play
	</button>

</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
</style>
