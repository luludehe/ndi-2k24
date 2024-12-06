import Phaser from 'phaser';

const GRID_ROWS = 6;
const GRID_COLS = 6;
let TILE_SIZE = 0;

// Définition des directions possibles
const DIRECTIONS = ['up', 'right', 'down', 'left'] as const;
type Direction = typeof DIRECTIONS[number];

// Type de tuyau avec ses connexions intrinsèques
type PipeType = {
	type: number;
	baseConnections: Direction[]; // Connexions à 0°
};

// Configuration des tuyaux avec leurs connexions de base
const PIPE_TYPES: Record<number, PipeType> = {
	0: { type: 0, baseConnections: [] }, // Vide
	1: { type: 1, baseConnections: ['up', 'down'] }, // Tuyau droit vertical
	2: { type: 2, baseConnections: ['up', 'left', 'down'] }, // T
	3: { type: 3, baseConnections: ['up', 'right', 'down', 'left'] }, // Croix
	4: { type: 4, baseConnections: ['down', 'right'] } // Coude
};

const ROTATIONS = [0, 90, 180, 270];

let grid: number[][] = [];
let rotations: number[][] = [];
let pipeSprites: Phaser.GameObjects.Image[][] = [];

const config = {
	type: Phaser.AUTO,
	parent: 'phaser-container',
	width: 600,
	height: 600,
	scene: {
		preload,
		create,
		update,
	},
};

let game: Phaser.Game | null = null;

export const initGame = () => {
	if (!game) {
		game = new Phaser.Game(config);
	}
};

export const destroyGame = () => {
	if (game) {
		game.destroy(true);
		game = null;
	}
};

// Fonction pour obtenir les connexions réelles après rotation
function getRotatedConnections(pipeType: number, rotation: number): Direction[] {
	const pipe = PIPE_TYPES[pipeType];
	if (!pipe) return [];

	return pipe.baseConnections.map(direction => {
		const directionIndex = DIRECTIONS.indexOf(direction);
		const rotatedIndex = (directionIndex + rotation / 90) % 4;
		return DIRECTIONS[rotatedIndex];
	});
}

// Fonction pour vérifier si deux tuyaux sont connectés
function arePipesConnected(
	pipe1Type: number,
	pipe1Rotation: number,
	pipe2Type: number,
	pipe2Rotation: number,
	direction: Direction
): boolean {
	const pipe1Connections = getRotatedConnections(pipe1Type, pipe1Rotation);
	const pipe2Connections = getRotatedConnections(pipe2Type, pipe2Rotation);

	const oppositeDirection = DIRECTIONS[(DIRECTIONS.indexOf(direction) + 2) % 4];

	return (
		pipe1Connections.includes(direction) &&
		pipe2Connections.includes(oppositeDirection)
	);
}

const generateGrid = (rows: number, cols: number): number[][] => {
	const newGrid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
	const newRotations: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

	// Chemin prédéfini pour garantir la connexion
	const path: { type: number, rotation: number }[] = [
		{ type: 1, rotation: 0 },   // Vertical straight
		{ type: 4, rotation: 0 },   // Bend right-down
		{ type: 1, rotation: 90 },  // Horizontal straight
		{ type: 2, rotation: 180 }, // T pointing up
		{ type: 4, rotation: 270 }, // Bend top-right
		{ type: 1, rotation: 0 }    // Vertical straight to end
	];

	let currentRow = 0;
	let currentCol = 0;

	for (const segment of path) {
		// Limite le chemin à la grille
		if (currentRow < rows && currentCol < cols) {
			newGrid[currentRow][currentCol] = segment.type;
			newRotations[currentRow][currentCol] = segment.rotation;

			// Avancer dans la grille selon le type de tuyau
			switch (segment.type) {
				case 1: // Straight
					segment.rotation === 0 ? currentRow++ : currentCol++;
					break;
				case 4: // Bend
					if (segment.rotation === 0) {
						currentCol++;
					} else if (segment.rotation === 270) {
						currentRow++;
					}
					break;
				case 2: // T
					currentCol++;
					break;
			}
		}
	}

	// Remplir le reste de la grille avec des tuyaux aléatoires
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			if (newGrid[row][col] === 0) {
				const randomType = Math.floor(Math.random() * 4) + 1; // 1 à 4
				const randomRotation = ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)];
				newGrid[row][col] = randomType;
				newRotations[row][col] = randomRotation;
			}
		}
	}

	grid = newGrid;
	rotations = newRotations;

	return newGrid;
};

const checkVictory = (grid: number[][], rotations: number[][]): boolean => {
	const rows = grid.length;
	const cols = grid[0].length;

	const findPath = (
		row: number,
		col: number,
		visited: boolean[][]
	): boolean => {
		if (row === rows - 1 && col === cols - 1) {
			return true;
		}

		visited[row][col] = true;

		const directions: [number, number, Direction][] = [
			[0, 1, 'right'],  // Droite
			[1, 0, 'down']    // Bas
		];

		for (const [dx, dy, direction] of directions) {
			const newRow = row + dx;
			const newCol = col + dy;

			if (
				newRow >= 0 && newRow < rows &&
				newCol >= 0 && newCol < cols &&
				!visited[newRow][newCol]
			) {
				if (arePipesConnected(
					grid[row][col],
					rotations[row][col],
					grid[newRow][newCol],
					rotations[newRow][newCol],
					direction
				)) {
					if (findPath(newRow, newCol, visited)) {
						return true;
					}
				}
			}
		}

		return false;
	};

	const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
	return findPath(0, 0, visited);
};

function updateTileSize() {
	const container = document.getElementById('phaser-container')!;
	const containerWidth = container.clientWidth;
	const containerHeight = container.clientHeight;

	const cellWidth = containerWidth / GRID_COLS;
	const cellHeight = containerHeight / GRID_ROWS;

	TILE_SIZE = Math.min(cellWidth, cellHeight);
}

function preload(this: Phaser.Scene) {
	this.load.image('ocean', '$lib/game/assets/game-background.png');
	this.load.image('empty', '$lib/game/assets/empty_pipe.png');
	this.load.image('straight', '$lib/game/assets/straight.png');
	this.load.image('tee', '$lib/game/assets/T.png');
	this.load.image('cross', '$lib/game/assets/cross.png');
	this.load.image('bend', '$lib/game/assets/bend.png');
}

function create(this: Phaser.Scene) {
	updateTileSize();

	const background = this.add.graphics();
	background.fillGradientStyle(0xBAD8FD, 0xBAD8FD, 0x4B9CFF, 0x4B9CFF, 1);
	background.fillRect(0, 0, config.width, config.height);
	// background.setDisplaySize(config.width, config.height);

	// Générer une nouvelle grille
	grid = generateGrid(GRID_ROWS, GRID_COLS);
	pipeSprites = [];

	for (let row = 0; row < GRID_ROWS; row++) {
		const rowSprites: Phaser.GameObjects.Image[] = [];

		for (let col = 0; col < GRID_COLS; col++) {
			const x = col * TILE_SIZE + TILE_SIZE / 2;
			const y = row * TILE_SIZE + TILE_SIZE / 2;

			const pipeType = grid[row][col];
			const spriteKey =
				pipeType === 0 ? 'empty' :
					pipeType === 1 ? 'straight' :
						pipeType === 2 ? 'tee' :
							pipeType === 3 ? 'cross' : 'bend';

			const pipe = this.add.image(x, y, spriteKey);
			const scale = TILE_SIZE / Math.max(pipe.width, pipe.height);
			pipe.setScale(scale);

			// Initialiser avec la rotation d'origine
			pipe.angle = rotations[row][col];

			pipe.setInteractive();
			pipe.on('pointerdown', () => {
				rotatePipe(row, col);
			});

			rowSprites.push(pipe);
		}

		pipeSprites.push(rowSprites);
	}
}

let modalShown = false;

function delay(ms: number) {
	return new Promise( resolve => setTimeout(resolve, ms) );
}

function update() {
	if (checkVictory(grid, rotations) && !modalShown) {
		delay(3000).then(() => {
			console.log('Victoire !');
			alert('Victoire !');
			modalShown = true;
		});
	}
}

function rotatePipe(row: number, col: number) {
	// Trouver l'index actuel de la rotation
	const currentRotationIndex = ROTATIONS.indexOf(rotations[row][col]);

	// Passer à la rotation suivante
	const nextRotationIndex = (currentRotationIndex + 1) % ROTATIONS.length;
	rotations[row][col] = ROTATIONS[nextRotationIndex];

	// Mettre à jour l'angle du sprite
	pipeSprites[row][col].angle = rotations[row][col];
}