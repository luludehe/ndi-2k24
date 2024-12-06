<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';

	let userLink = '';
	let selectedPokemon = '';
	let qrCodeImage: string | null = null;
	import BulbasaurImage from '$lib/images/image.png';
	import CharmanderImage from '$lib/qrcode/salameche.png';
	import SquirtleImage from '$lib/qrcode/carapuce.png';

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
    section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex: 0.6;
    }

    .pokemon-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 10px;
    }

    .pokemon-item {
        cursor: pointer;
        text-align: center;
        transition: transform 0.2s ease-in-out;
    }

    .pokemon-item:hover {
        transform: scale(1.1);
    }

    .qr-code {
        margin-top: 20px;
    }

</style>

<section>

	<h1 class="h1 text-gray-800 font-bold">Générateur de QrCode Pokémon</h1>

	<div class="w-full mx-auto my-16 flex self-center justify-center">
		<label class="form-control min-w-96 max-w-xs">
			<div class="label">
				<span class="label-text text-md font-bold text-gray-800">Entrez votre lien</span>
			</div>
			<input id="link" type="url" bind:value={userLink} placeholder="https://example.com" class="bg-slate-50 input input-bordered w-full max-w-xs mx-auto" />
		</label>
	</div>


	<h2 class="text-gray-800 font-bold text-xl mb-8">Choisissez un pokémon:</h2>

	<div class="columns-3 ...">
		{#each pokemons as { name, image }}
			<div on:click={() => { selectedPokemon = name; }}>
				<img class="pokemon-item"
					src={image}
					alt={name}
					width="100"
					height="100"
					class:selected={selectedPokemon === name}
				/>
				<p>{name}</p>
			</div>
		{/each}
	</div>

	<div class="w-48 flexself-center justify-center">
		<button on:click={generateQRCode} disabled={!userLink || !selectedPokemon} class="w-48 inline-block cursor-pointer rounded-md bg-cyan-600 px-4 py-3 text-center text-md shadow-xl shadow-gray-400 font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-cyan-700 mt-10">
			Génération
		</button>
	</div>

	{#if qrCodeImage}
		<div class="qr-code">
			<h2>Your Pokémon QR Code:</h2>
			<img src={qrCodeImage} alt="QR Code" />
		</div>
	{/if}

</section>