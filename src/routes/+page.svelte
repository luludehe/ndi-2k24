<script lang="ts">
	import {onMount} from 'svelte';

	let username = '';

	export function addCharacter() {
		const select = document.getElementById('characterSelect') as HTMLSelectElement;
		const asciiCode = parseInt(select.value, 16);
		if (asciiCode >= 32 && asciiCode <= 126) {
			username += String.fromCharCode(asciiCode);
		}
	}

	export function generateRandomHexCodes() {
		const hexCodes = [];
		for (let i = 32; i <= 126; i++) {
			hexCodes.push(i.toString(16).toUpperCase().padStart(2, '0'));
		}
		// Shuffle the array to make it random
		for (let i = hexCodes.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[hexCodes[i], hexCodes[j]] = [hexCodes[j], hexCodes[i]];
		}
		return hexCodes;
	}

	export function populateSelect() {
		const select = document.getElementById('characterSelect') as HTMLSelectElement;
		select.innerHTML = '';
		const hexCodes = generateRandomHexCodes();
		hexCodes.forEach(code => {
			const option = document.createElement('option');
			option.value = code;
			option.text = code;
			select.appendChild(option);
		});
	}

	// Populate the select element when the component is mounted
	onMount(() => {
		populateSelect();
	});
</script>


<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1 class="h1 text-white">Bienvenue sur notre jeu !</h1>
	<h3 class="h3 text-gray-50 text-center p-5">Ce jeu a été réalisé lors de la Nuit de l'Info 2024. Nous vous invitons à jouer un jeu où le but est de s'assurer du bon écoulement du fluide en créant les connexions entre les tuyaux.</h3>

	<button on:click={()=>pseudo_modal.showModal()} class="inline-block cursor-pointer rounded-md bg-green-600 px-4 py-3 text-center text-2xl shadow-xl shadow-gray-400 font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-green-700 mt-10">
	Jouer
	</button>

<!--	<button class="btn" on:click={()=>pseudo_modal.showModal()}>open modal</button>-->
	<dialog id="pseudo_modal" class="modal modal-bottom sm:modal-middle">
		<div class="modal-box">
			<h3 class="text-lg font-bold">Quel est ton nom ?</h3>
			<p class="py-4">Trouve dans la liste les lettres pour composer ton nom ! Malheureusement, on a un peu melangé les lettres avec les caractères spéciaux... et aussi leurs correspondances hexadécimales... </p>
			<div class="flex justify-center self-center gap-4">
				<select id="characterSelect" on:click={populateSelect}>
					<!-- Options will be populated dynamically -->
				</select>
				<button on:click={addCharacter} class="btn">Ajouter</button>
			</div>
			<p class="py-4">Pseudonyme: {username}</p>
			<div class="modal-action">
				<form method="dialog">
					<button on:click={() => window.location.href = `/game?username=${username}`} class="btn">Okay !</button>
				</form>
			</div>
		</div>
	</dialog>

</section>

<style>

	:global(.app) {
			/*background-color: var(--color-bg-1) !important;*/
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;
      background-image: url("src/lib/images/landing_background.jpg");
  }

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
</style>
