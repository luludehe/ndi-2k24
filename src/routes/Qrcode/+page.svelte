<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';

	let userLink = '';
	let selectedPokemon = '';
	let qrCodeImage: string | null = null;
	import BulbasaurImage from '$lib/images/image.png';
	import CharmanderImage from '$lib/images/4.png';
	import SquirtleImage from '$lib/images/7.png';

	const pokemons = [
		{ name: 'Bulbasaur', image: BulbasaurImage },
		{ name: 'Charmander', image: CharmanderImage },
		{ name: 'Squirtle', image: SquirtleImage }
	];

	// Generate the QR code overlaid with the selected image
	const generateQRCode = async () => {
		if (!userLink || !selectedPokemon) return;

		// Generate the high-definition QR code
		const baseQRCode = await QRCode.toDataURL(userLink, {
			errorCorrectionLevel: 'L',
			margin: 1,
			scale: 10 // Increase resolution
		});

		// Load the selected Pokémon image
		const pokemonImage = new Image();
		pokemonImage.src = pokemons.find(p => p.name === selectedPokemon)?.image || '';

		pokemonImage.onload = () => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			// Load the QR code image
			const qrImg = new Image();
			qrImg.src = baseQRCode;

			qrImg.onload = () => {
				// Dimensions
				const width = qrImg.width;
				const height = qrImg.height;

				canvas.width = width;
				canvas.height = height;

				// Resize the Pokémon image to match the QR code
				const tempCanvas = document.createElement('canvas');
				const tempCtx = tempCanvas.getContext('2d');
				tempCanvas.width = width;
				tempCanvas.height = height;
				tempCtx?.drawImage(pokemonImage, 0, 0, width, height);

				// Apply a pixel-by-pixel "AND" operation
				ctx.drawImage(qrImg, 0, 0);
				const qrData = ctx.getImageData(0, 0, width, height);
				const pokemonData = tempCtx?.getImageData(0, 0, width, height);

				if (pokemonData) {
					for (let i = 0; i < qrData.data.length; i += 4) {
						// "AND" operation on each R, G, B component
						qrData.data[i] = qrData.data[i] & pokemonData.data[i];
						qrData.data[i + 1] = qrData.data[i + 1] & pokemonData.data[i + 1];
						qrData.data[i + 2] = qrData.data[i + 2] & pokemonData.data[i + 2];
					}
					ctx.putImageData(qrData, 0, 0);
				}

				// Convert the result to Data URL
				qrCodeImage = canvas.toDataURL();
			};
		};
	};
</script>

<style>
    .pokemon-list img {
        cursor: pointer;
        transition: transform 0.2s ease-in-out;
    }
    .pokemon-list img:hover {
        transform: scale(1.1);
    }
    .qr-code {
        margin-top: 20px;
    }
</style>

<h1>Pokémon QR Code Generator</h1>

<div>
	<label for="link">Enter your link:</label>
	<input id="link" type="url" bind:value={userLink} placeholder="https://example.com" />
</div>

<h2>Select a Pokémon:</h2>
<div class="pokemon-list">
	{#each pokemons as { name, image }}
		<img
			src={image}
			alt={name}
			width="100"
			height="100"
			on:click={() => { selectedPokemon = name; }}
			class:selected={selectedPokemon === name}
		/>
	{/each}
</div>

<button on:click={generateQRCode} disabled={!userLink || !selectedPokemon}>
	Generate QR Code
</button>

{#if qrCodeImage}
	<div class="qr-code">
		<h2>Your Pokémon QR Code:</h2>
		<img src={qrCodeImage} alt="QR Code" />
	</div>
{/if}